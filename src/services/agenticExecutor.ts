/**
 * Agentic Executor & Function Calling Layer
 * 
 * Implements the 3 Core Architectural Principles:
 * 1. Hard Iteration Limit (`step < 6`): Prevents endless loops and controls latency/costs.
 * 2. Graceful Function Error Handling: Catches execution errors and returns structured error payloads to the model instead of throwing.
 * 3. In-Memory Cache in `executeFunction`: Short TTL caching for quotes (15–60s) and insights to minimize Yahoo Finance rate limits and response latency.
 */

import {
  get_stock_quote,
  get_price_history,
  get_analyst_insights,
  search_tickers,
} from './yahooFinanceService';

// ----------------------------------------------------------------------
// Principle 3: In-Memory TTL Cache Layer
// ----------------------------------------------------------------------

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

class InMemoryCache {
  private cache = new Map<string, CacheEntry>();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttlMs;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlSeconds: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttlMs: ttlSeconds * 1000,
    });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const functionCache = new InMemoryCache();

// Standard TTLs per function type
const DEFAULT_TTLS: Record<string, number> = {
  get_stock_quote: 30,      // 30 seconds for real-time stock quotes
  get_price_history: 120,   // 2 minutes for price history candles
  get_analyst_insights: 300,// 5 minutes for analyst consensus/targets
  search_tickers: 600,      // 10 minutes for ticker search autocompletion
};

// ----------------------------------------------------------------------
// Principle 2: Graceful Error Catching in `executeFunction`
// ----------------------------------------------------------------------

export interface FunctionExecutionResult<T = any> {
  success: boolean;
  functionName: string;
  args: Record<string, any>;
  data?: T;
  error?: string;
  cached?: boolean;
  executedAt: string;
}

/**
 * Encapsulates function execution with in-memory TTL cache and graceful error handling.
 */
export async function executeFunction(
  functionName: string,
  args: Record<string, any> = {}
): Promise<FunctionExecutionResult> {
  const cacheKey = `${functionName}:${JSON.stringify(args)}`;
  const ttlSeconds = DEFAULT_TTLS[functionName] || 30;

  // 1. Check in-memory cache
  const cachedData = functionCache.get(cacheKey);
  if (cachedData !== null) {
    return {
      success: true,
      functionName,
      args,
      data: cachedData,
      cached: true,
      executedAt: new Date().toISOString(),
    };
  }

  // 2. Execute function with graceful error handling
  try {
    let result: any;

    switch (functionName) {
      case 'get_stock_quote': {
        const symbol = String(args.symbol || args.ticker || 'NVDA').trim().toUpperCase();
        if (!symbol) {
          return {
            success: false,
            functionName,
            args,
            error: 'Parâmetro "symbol" é obrigatório para get_stock_quote.',
            executedAt: new Date().toISOString(),
          };
        }
        result = await get_stock_quote(symbol);
        break;
      }

      case 'get_price_history': {
        const symbol = String(args.symbol || args.ticker || 'NVDA').trim().toUpperCase();
        const range = String(args.range || '1y');
        const interval = String(args.interval || '1d');
        result = await get_price_history(symbol, range, interval);
        break;
      }

      case 'get_analyst_insights': {
        const symbol = String(args.symbol || args.ticker || 'NVDA').trim().toUpperCase();
        result = await get_analyst_insights(symbol);
        break;
      }

      case 'search_tickers': {
        const query = String(args.query || args.q || '').trim();
        result = await search_tickers(query);
        break;
      }

      default:
        return {
          success: false,
          functionName,
          args,
          error: `Função desconhecida ou não suportada: "${functionName}".`,
          executedAt: new Date().toISOString(),
        };
    }

    // Cache successful execution
    functionCache.set(cacheKey, result, ttlSeconds);

    return {
      success: true,
      functionName,
      args,
      data: result,
      cached: false,
      executedAt: new Date().toISOString(),
    };
  } catch (err: any) {
    // Return structured error payload instead of throwing exception
    const errorMessage = err?.message || 'Erro inesperado na chamada ao serviço Yahoo Finance.';
    return {
      success: false,
      functionName,
      args,
      error: `Erro ao executar ${functionName}: ${errorMessage}`,
      executedAt: new Date().toISOString(),
    };
  }
}

/**
 * Encapsulates parallel function execution using Promise.all for independent tool calls.
 * When the model requests multiple independent function calls (e.g. quotes for 3 tickers or quote + history + insights),
 * executing them simultaneously with Promise.all reduces overall request latency.
 */
export async function executeParallelFunctions(
  calls: Array<{ functionName: string; args: Record<string, any> }>
): Promise<FunctionExecutionResult[]> {
  if (!calls || calls.length === 0) return [];

  // Execute all independent calls simultaneously using Promise.all
  const results = await Promise.all(
    calls.map((call) => executeFunction(call.functionName, call.args))
  );

  return results;
}

// ----------------------------------------------------------------------
// Principle 1: Iterative Agent Loop with Strict Step Limit (`step < 6`)
// ----------------------------------------------------------------------

export interface AgentStepLog {
  step: number;
  action: string;
  functionCalled?: string;
  args?: Record<string, any>;
  result: FunctionExecutionResult | FunctionExecutionResult[] | any;
  timestamp: string;
  isParallel?: boolean;
}

export interface AgentLoopResponse {
  query: string;
  completed: boolean;
  stepsExecuted: number;
  stepLogs: AgentStepLog[];
  finalAnswer: string;
  accumulatedData: Record<string, any>;
  parallelExecutionUsed: boolean;
}

/**
 * Runs a multi-step agentic execution loop with a strict `step < 6` boundary.
 * Leverages `executeParallelFunctions` (Promise.all) for independent queries in Step 1.
 */
export async function runAgenticLoop(
  userQuery: string,
  options?: {
    symbol?: string;
    compareSymbols?: string[];
    onStepProgress?: (log: AgentStepLog) => void;
  }
): Promise<AgentLoopResponse> {
  const symbol = (options?.symbol || 'NVDA').trim().toUpperCase();
  const compareSymbols = options?.compareSymbols || [symbol, 'AAPL', 'MSFT'];
  const stepLogs: AgentStepLog[] = [];
  const accumulatedData: Record<string, any> = {};

  let step = 1;
  const MAX_STEPS = 6; // Strict upper bound: while (step < 6)

  // Agent loop strictly enforced with step < 6
  while (step < MAX_STEPS) {
    if (step === 1) {
      // Step 1: Parallel Execution - Fetch quote, price history, and analyst insights simultaneously using Promise.all
      const parallelCalls = [
        { functionName: 'get_stock_quote', args: { symbol } },
        { functionName: 'get_price_history', args: { symbol, range: '1y', interval: '1d' } },
        { functionName: 'get_analyst_insights', args: { symbol } },
      ];

      const parallelResults = await executeParallelFunctions(parallelCalls);

      parallelResults.forEach((res) => {
        if (res.success && res.data) {
          accumulatedData[res.functionName] = res.data;
        } else {
          accumulatedData[`${res.functionName}_error`] = res.error;
        }
      });

      const logEntry: AgentStepLog = {
        step,
        action: `[PARALELO (Promise.all)] Executou simultaneamente get_stock_quote, get_price_history e get_analyst_insights para ${symbol}`,
        result: parallelResults,
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        isParallel: true,
      };

      stepLogs.push(logEntry);
      if (options?.onStepProgress) options.onStepProgress(logEntry);

    } else if (step === 2 && compareSymbols.length > 1) {
      // Step 2: Parallel Comparison Execution - Fetch quotes for multiple comparison tickers simultaneously
      const parallelComparisonCalls = compareSymbols.map((s) => ({
        functionName: 'get_stock_quote',
        args: { symbol: s },
      }));

      const comparisonResults = await executeParallelFunctions(parallelComparisonCalls);

      accumulatedData.comparisonQuotes = comparisonResults.map((r) => r.data).filter(Boolean);

      const logEntry: AgentStepLog = {
        step,
        action: `[PARALELO (Promise.all)] Executou cotações em paralelo para os tickers de comparação: ${compareSymbols.join(', ')}`,
        result: comparisonResults,
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        isParallel: true,
      };

      stepLogs.push(logEntry);
      if (options?.onStepProgress) options.onStepProgress(logEntry);

    } else {
      // Sequential step for any dependent verification if required
      const functionName = 'search_tickers';
      const args = { query: symbol };
      const result = await executeFunction(functionName, args);

      const logEntry: AgentStepLog = {
        step,
        action: `[SEQUENCIAL] Busca de verificação de tickers para ${symbol}`,
        functionCalled: functionName,
        args,
        result,
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        isParallel: false,
      };

      stepLogs.push(logEntry);
      if (options?.onStepProgress) options.onStepProgress(logEntry);
    }

    // Check convergence: if we gathered stock_quote, price_history, and analyst_insights
    if (
      accumulatedData.get_stock_quote &&
      accumulatedData.get_price_history &&
      accumulatedData.get_analyst_insights
    ) {
      return {
        query: userQuery,
        completed: true,
        stepsExecuted: step,
        stepLogs,
        finalAnswer: `Análise paralela concluída com sucesso em ${step} passo(s) (Promise.all utilizado para otimizar latência e limite step < 6).`,
        accumulatedData,
        parallelExecutionUsed: true,
      };
    }

    step++;
  }

  return {
    query: userQuery,
    completed: false,
    stepsExecuted: step - 1,
    stepLogs,
    finalAnswer: `Limite máximo de iterações atingido (step < 6). Loop agentivo finalizado com segurança sem chamadas infinitas.`,
    accumulatedData,
    parallelExecutionUsed: true,
  };
}
