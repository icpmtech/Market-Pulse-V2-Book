import React, { useState } from 'react';
import {
  executeFunction,
  runAgenticLoop,
  functionCache,
  AgentStepLog,
  AgentLoopResponse,
} from '../services/agenticExecutor';
import {
  Terminal,
  Play,
  Copy,
  Check,
  Code,
  Zap,
  Clock,
  Sparkles,
  FileJson,
  ShieldCheck,
  Cpu,
  RefreshCw,
  AlertTriangle,
  Database,
  Layers,
} from 'lucide-react';

interface SkillsApiConsoleProps {
  initialSymbol?: string;
  onSelectSymbol?: (sym: string) => void;
}

export const SkillsApiConsole: React.FC<SkillsApiConsoleProps> = ({
  initialSymbol = 'NVDA',
  onSelectSymbol,
}) => {
  const [selectedSkill, setSelectedSkill] = useState<
    'get_stock_quote' | 'get_price_history' | 'get_analyst_insights' | 'agentic_loop'
  >('get_stock_quote');
  const [symbol, setSymbol] = useState(initialSymbol);
  const [period, setPeriod] = useState('1y');
  const [interval, setInterval] = useState('1d');
  const [output, setOutput] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [execTime, setExecTime] = useState<number | null>(null);
  const [isCachedResult, setIsCachedResult] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);
  const [codeLang, setCodeLang] = useState<'python' | 'ts'>('python');

  // Agentic Loop state
  const [agentLogs, setAgentLogs] = useState<AgentStepLog[]>([]);
  const [agentSummary, setAgentSummary] = useState<AgentLoopResponse | null>(null);

  const handleExecuteSkill = async () => {
    setLoading(true);
    setIsCachedResult(false);
    setAgentLogs([]);
    setAgentSummary(null);
    const start = performance.now();

    try {
      if (selectedSkill === 'agentic_loop') {
        // Execute Agentic Loop with strict step < 6 limit
        const loopRes = await runAgenticLoop(`Análise completa de ${symbol}`, {
          symbol,
          onStepProgress: (log) => {
            setAgentLogs((prev) => [...prev, log]);
          },
        });
        setAgentSummary(loopRes);
        setOutput(loopRes);
      } else {
        // Execute via executeFunction with TTL cache & error handling
        let args: Record<string, any> = { symbol };
        if (selectedSkill === 'get_price_history') {
          args = { symbol, range: period, interval };
        }

        const res = await executeFunction(selectedSkill, args);
        setOutput(res);
        setIsCachedResult(Boolean(res.cached));
      }
      setExecTime(Math.round(performance.now() - start));
    } catch (err: any) {
      setOutput({
        success: false,
        error: err.message || 'Falha ao executar função',
        executedAt: new Date().toISOString(),
      });
      setExecTime(Math.round(performance.now() - start));
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = () => {
    functionCache.clear();
    alert('Cache de execuções de funções limpo com sucesso!');
  };

  const getGeneratedCode = () => {
    if (selectedSkill === 'agentic_loop') {
      return `// Parallel vs Sequential Function Calling Pattern
import { runAgenticLoop, executeParallelFunctions, executeFunction } from '@/services/agenticExecutor';

// 1. Chamadas Paralelas Simultâneas com Promise.all (Recomendado para chamadas independentes)
const [quote, history, insights] = await Promise.all([
  executeFunction('get_stock_quote', { symbol: '${symbol}' }),
  executeFunction('get_price_history', { symbol: '${symbol}', range: '${period}' }),
  executeFunction('get_analyst_insights', { symbol: '${symbol}' }),
]);

// 2. Ou através de um Loop Agentivo otimizado (Limite rígido: step < 6)
const agentResponse = await runAgenticLoop('Análise completa de ${symbol}', { symbol: '${symbol}' });
console.log('Passos executados:', agentResponse.stepsExecuted);`;
    }

    if (codeLang === 'python') {
      if (selectedSkill === 'get_stock_quote') {
        return `# Python yFinance Skill: get_stock_quote
import yfinance as yf

def get_stock_quote(symbol: str):
    ticker = yf.Ticker(symbol)
    info = ticker.info
    return {
        "symbol": symbol,
        "price": info.get("regularMarketPrice") or info.get("currentPrice"),
        "change_percent": info.get("regularMarketChangePercent"),
        "market_cap": info.get("marketCap"),
        "trailing_pe": info.get("trailingPE"),
        "52w_high": info.get("fiftyTwoWeekHigh"),
        "52w_low": info.get("fiftyTwoWeekLow")
    }

quote = get_stock_quote("${symbol}")
print(quote)`;
      } else if (selectedSkill === 'get_price_history') {
        return `# Python yFinance Skill: get_price_history
import yfinance as yf

def get_price_history(symbol: str, period="${period}", interval="${interval}"):
    ticker = yf.Ticker(symbol)
    df = ticker.history(period=period, interval=interval)
    return df.reset_index().to_dict(orient="records")

history = get_price_history("${symbol}")
print(f"Total velas: {len(history)}")`;
      } else {
        return `# Python yFinance Skill: get_analyst_insights
import yfinance as yf

def get_analyst_insights(symbol: str):
    ticker = yf.Ticker(symbol)
    return {
        "target_price": ticker.analyst_price_targets,
        "recommendations": ticker.recommendations_summary,
        "earnings_history": ticker.earnings_history
    }

insights = get_analyst_insights("${symbol}")
print(insights)`;
      }
    } else {
      return `// TypeScript executeFunction with TTL Cache & Error Catching
import { executeFunction } from '@/services/agenticExecutor';

// Chamada encapsulada com cache em memória (TTL 30s) e tratamento gracioso de erro
const result = await executeFunction('${selectedSkill}', { symbol: '${symbol}' });
if (result.success) {
  console.log('Dados:', result.data, 'Cached:', result.cached);
} else {
  console.warn('Erro capturado sem interromper requisição:', result.error);
}`;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getGeneratedCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-sky-400" /> Console Agentivo & API yFinance Playground
          </h2>
          <p className="text-xs text-slate-400">
            Execução de funções com <strong>Cache TTL</strong>, <strong>Tratamento Gracioso de Erro</strong> e <strong>Limite Rígido (<code className="text-amber-300 font-mono">step &lt; 6</code>)</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isCachedResult && (
            <span className="flex items-center gap-1 text-xs font-mono bg-indigo-950/80 px-2.5 py-1 rounded-lg border border-indigo-700 text-indigo-300">
              <Database className="w-3.5 h-3.5" /> Cache HIT (0ms latency)
            </span>
          )}

          {execTime !== null && (
            <span className="flex items-center gap-1 text-xs font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-emerald-400">
              <Clock className="w-3.5 h-3.5" /> Latência: {execTime}ms
            </span>
          )}

          <button
            onClick={handleClearCache}
            className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition text-xs flex items-center gap-1"
            title="Limpar Cache In-Memory"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Principles Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="bg-amber-950/30 border border-amber-800/40 p-3 rounded-xl flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300 block">1. Limite de Iterações (step &lt; 6)</strong>
            <span className="text-slate-400">Garante que loops agentivos terminem em até 5 passos sem gerar consumo infinito.</span>
          </div>
        </div>

        <div className="bg-emerald-950/30 border border-emerald-800/40 p-3 rounded-xl flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-emerald-300 block">2. Tratamento Gracioso de Erros</strong>
            <span className="text-slate-400">Erros na API são retornados em payload JSON para recuperação pelo modelo.</span>
          </div>
        </div>

        <div className="bg-indigo-950/30 border border-indigo-800/40 p-3 rounded-xl flex items-start gap-2.5">
          <Database className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-indigo-300 block">3. Cache In-Memory na executeFunction</strong>
            <span className="text-slate-400">Ativos consultados repetidamente respondem do cache (TTL 15s–60s).</span>
          </div>
        </div>
      </div>

      {/* Skill Tabs & Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => {
            setSelectedSkill('get_stock_quote');
            setOutput(null);
          }}
          className={`p-3 rounded-xl border text-left transition ${
            selectedSkill === 'get_stock_quote'
              ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2 font-mono font-bold text-xs text-sky-300">
            <Zap className="w-3.5 h-3.5" /> get_stock_quote
          </div>
          <div className="text-[11px] text-slate-300 mt-1">Cotação e indicadores (Cache 30s)</div>
        </button>

        <button
          onClick={() => {
            setSelectedSkill('get_price_history');
            setOutput(null);
          }}
          className={`p-3 rounded-xl border text-left transition ${
            selectedSkill === 'get_price_history'
              ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2 font-mono font-bold text-xs text-emerald-300">
            <Zap className="w-3.5 h-3.5" /> get_price_history
          </div>
          <div className="text-[11px] text-slate-300 mt-1">Velas OHLCV (Cache 120s)</div>
        </button>

        <button
          onClick={() => {
            setSelectedSkill('get_analyst_insights');
            setOutput(null);
          }}
          className={`p-3 rounded-xl border text-left transition ${
            selectedSkill === 'get_analyst_insights'
              ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-500/10'
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2 font-mono font-bold text-xs text-purple-300">
            <Zap className="w-3.5 h-3.5" /> get_analyst_insights
          </div>
          <div className="text-[11px] text-slate-300 mt-1">Preço-alvo e consenso (Cache 300s)</div>
        </button>

        <button
          onClick={() => {
            setSelectedSkill('agentic_loop');
            setOutput(null);
          }}
          className={`p-3 rounded-xl border text-left transition ${
            selectedSkill === 'agentic_loop'
              ? 'bg-amber-600/20 border-amber-500 text-white shadow-lg shadow-amber-500/10'
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2 font-mono font-bold text-xs text-amber-300">
            <Cpu className="w-3.5 h-3.5" /> Loop Agentivo (step &lt; 6)
          </div>
          <div className="text-[11px] text-slate-300 mt-1">Execução multi-step automatizada</div>
        </button>
      </div>

      {/* Parameter Inputs & Execute Button */}
      <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[140px]">
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Ticker / Símbolo:</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="ex: NVDA, PETR4.SA, INVALID_TICKER"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono uppercase focus:outline-hidden focus:border-blue-500"
          />
        </div>

        {selectedSkill === 'get_price_history' && (
          <>
            <div className="w-28">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Período:</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-hidden"
              >
                <option value="1d">1 Dia</option>
                <option value="5d">5 Dias</option>
                <option value="1mo">1 Mês</option>
                <option value="6mo">6 Meses</option>
                <option value="1y">1 Ano</option>
                <option value="5y">5 Anos</option>
              </select>
            </div>

            <div className="w-28">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Intervalo:</label>
              <select
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-hidden"
              >
                <option value="1m">1 Minuto</option>
                <option value="5m">5 Minutos</option>
                <option value="1d">1 Dia</option>
              </select>
            </div>
          </>
        )}

        <div className="pt-4 flex items-center gap-2">
          <button
            onClick={handleExecuteSkill}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs px-5 py-2 rounded-lg shadow-lg shadow-blue-500/20 transition"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
            {selectedSkill === 'agentic_loop' ? 'Disparar Loop Agentivo' : 'Executar via executeFunction'}
          </button>
        </div>
      </div>

      {/* Step Progress for Agentic Loop */}
      {agentLogs.length > 0 && (
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <h4 className="text-xs font-bold text-amber-400 flex items-center gap-2">
            <Cpu className="w-4 h-4" /> Progresso do Loop Agentivo (Limite Rígido: step &lt; 6)
          </h4>

          <div className="space-y-1.5 font-mono text-[11px]">
            {agentLogs.map((log) => (
              <div
                key={log.step}
                className="p-2 bg-slate-900/80 rounded-lg border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-bold">
                    Step {log.step}
                  </span>
                  <span className="text-slate-200">{log.action}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] ${log.result.success ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  {log.result.cached ? 'CACHE HIT' : log.result.success ? 'OK' : 'ERRO CAPTURADO'}
                </span>
              </div>
            ))}
          </div>

          {agentSummary && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-xs text-emerald-300 mt-3 font-mono">
              ✅ {agentSummary.finalAnswer} (Passos Totais: {agentSummary.stepsExecuted} / 5)
            </div>
          )}
        </div>
      )}

      {/* Code Snippet & Output Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Snippet */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2 font-semibold text-slate-300">
              <Code className="w-4 h-4 text-amber-400" /> Código de Integração
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-slate-900 p-0.5 rounded-md border border-slate-800 text-[11px]">
                <button
                  onClick={() => setCodeLang('python')}
                  className={`px-2 py-0.5 rounded ${codeLang === 'python' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                >
                  Python
                </button>
                <button
                  onClick={() => setCodeLang('ts')}
                  className={`px-2 py-0.5 rounded ${codeLang === 'ts' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                >
                  TypeScript
                </button>
              </div>
              <button
                onClick={handleCopyCode}
                className="p-1 text-slate-400 hover:text-white rounded bg-slate-800 transition"
                title="Copiar código"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto p-3 bg-slate-900/60 rounded-lg mt-3 h-[240px]">
            <code>{getGeneratedCode()}</code>
          </pre>
        </div>

        {/* JSON Result Output */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2 font-semibold text-slate-300">
              <FileJson className="w-4 h-4 text-emerald-400" /> Payload JSON Retornado
            </div>
            {output && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded border font-mono ${
                  output.success === false
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}
              >
                {output.cached ? 'CACHE HIT' : output.success === false ? 'ERRO CAPTURADO' : 'SUCESSO'}
              </span>
            )}
          </div>

          <div className="overflow-y-auto p-3 bg-slate-900/60 rounded-lg mt-3 h-[240px]">
            {output ? (
              <pre className="text-[11px] font-mono text-emerald-300">
                {JSON.stringify(output, null, 2)}
              </pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                <Terminal className="w-8 h-8 mb-2 opacity-40" />
                Clique em "Executar" para disparar a chamada.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
