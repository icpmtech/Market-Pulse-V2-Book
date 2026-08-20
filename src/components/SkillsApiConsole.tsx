import React, { useState } from 'react';
import {
  get_stock_quote,
  get_price_history,
  get_analyst_insights,
} from '../services/yahooFinanceService';
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
} from 'lucide-react';

interface SkillsApiConsoleProps {
  initialSymbol?: string;
  onSelectSymbol?: (sym: string) => void;
}

export const SkillsApiConsole: React.FC<SkillsApiConsoleProps> = ({
  initialSymbol = 'NVDA',
  onSelectSymbol,
}) => {
  const [selectedSkill, setSelectedSkill] = useState<'get_stock_quote' | 'get_price_history' | 'get_analyst_insights'>('get_stock_quote');
  const [symbol, setSymbol] = useState(initialSymbol);
  const [period, setPeriod] = useState('1y');
  const [interval, setInterval] = useState('1d');
  const [output, setOutput] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [execTime, setExecTime] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [codeLang, setCodeLang] = useState<'python' | 'ts'>('python');

  const handleExecuteSkill = async () => {
    setLoading(true);
    const start = performance.now();
    try {
      let result;
      if (selectedSkill === 'get_stock_quote') {
        result = await get_stock_quote(symbol);
      } else if (selectedSkill === 'get_price_history') {
        result = await get_price_history(symbol, period, interval);
      } else if (selectedSkill === 'get_analyst_insights') {
        result = await get_analyst_insights(symbol);
      }
      setOutput(result);
      setExecTime(Math.round(performance.now() - start));
    } catch (err: any) {
      setOutput({ error: err.message || 'Falha ao executar skill' });
      setExecTime(Math.round(performance.now() - start));
    } finally {
      setLoading(false);
    }
  };

  const getGeneratedCode = () => {
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

# Execução
quote = get_stock_quote("${symbol}")
print(quote)`;
      } else if (selectedSkill === 'get_price_history') {
        return `# Python yFinance Skill: get_price_history
import yfinance as yf

def get_price_history(symbol: str, period="${period}", interval="${interval}"):
    ticker = yf.Ticker(symbol)
    df = ticker.history(period=period, interval=interval)
    # OHLCV DataFrame pronto para Apache ECharts ou análise técnica
    return df.reset_index().to_dict(orient="records")

history = get_price_history("${symbol}")
print(f"Total velas carregadas: {len(history)}")`;
      } else {
        return `# Python yFinance Skill: get_analyst_insights
import yfinance as yf

def get_analyst_insights(symbol: str):
    ticker = yf.Ticker(symbol)
    return {
        "target_price": ticker.analyst_price_targets,
        "recommendations": ticker.recommendations_summary,
        "earnings_history": ticker.earnings_history,
        "upgrades_downgrades": ticker.upgrades_downgrades.head(5).to_dict()
    }

insights = get_analyst_insights("${symbol}")
print(insights)`;
      }
    } else {
      if (selectedSkill === 'get_stock_quote') {
        return `// TypeScript Skill: get_stock_quote
import { get_stock_quote } from '@/services/yahooFinanceService';

const quote = await get_stock_quote('${symbol}');
console.log('Preço:', quote.regularMarketPrice, quote.currency);`;
      } else if (selectedSkill === 'get_price_history') {
        return `// TypeScript Skill: get_price_history
import { get_price_history } from '@/services/yahooFinanceService';

const candles = await get_price_history('${symbol}', '${period}', '${interval}');
console.log('Total de velas:', candles.length);`;
      } else {
        return `// TypeScript Skill: get_analyst_insights
import { get_analyst_insights } from '@/services/yahooFinanceService';

const insights = await get_analyst_insights('${symbol}');
console.log('Preço-Alvo Médio:', insights.targetMeanPrice, 'Upside:', insights.upsidePotentialPercent + '%');`;
      }
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
            <Terminal className="w-5 h-5 text-sky-400" /> Console de Skills yFinance (API Playground)
          </h2>
          <p className="text-xs text-slate-400">
            Execute diretamente as 3 skills solicitadas: <code className="text-sky-300">get_stock_quote</code>,{' '}
            <code className="text-emerald-300">get_price_history</code> e <code className="text-purple-300">get_analyst_insights</code>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {execTime !== null && (
            <span className="flex items-center gap-1 text-xs font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-emerald-400">
              <Clock className="w-3.5 h-3.5" /> Latência: {execTime}ms
            </span>
          )}
        </div>
      </div>

      {/* Skill Tabs & Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          onClick={() => {
            setSelectedSkill('get_stock_quote');
            setOutput(null);
          }}
          className={`p-3.5 rounded-xl border text-left transition ${
            selectedSkill === 'get_stock_quote'
              ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2 font-mono font-bold text-xs text-sky-300">
            <Zap className="w-3.5 h-3.5" /> get_stock_quote
          </div>
          <div className="text-xs text-slate-300 mt-1">Cotação em tempo real, múltiplos e variação</div>
        </button>

        <button
          onClick={() => {
            setSelectedSkill('get_price_history');
            setOutput(null);
          }}
          className={`p-3.5 rounded-xl border text-left transition ${
            selectedSkill === 'get_price_history'
              ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2 font-mono font-bold text-xs text-emerald-300">
            <Zap className="w-3.5 h-3.5" /> get_price_history
          </div>
          <div className="text-xs text-slate-300 mt-1">Série temporal de velas OHLCV e volume</div>
        </button>

        <button
          onClick={() => {
            setSelectedSkill('get_analyst_insights');
            setOutput(null);
          }}
          className={`p-3.5 rounded-xl border text-left transition ${
            selectedSkill === 'get_analyst_insights'
              ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-500/10'
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2 font-mono font-bold text-xs text-purple-300">
            <Zap className="w-3.5 h-3.5" /> get_analyst_insights
          </div>
          <div className="text-xs text-slate-300 mt-1">Preço-alvo, consenso e histórico de lucros</div>
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
            placeholder="ex: NVDA, PETR4.SA, BTC-USD"
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
                <option value="max">Máximo</option>
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
                <option value="15m">15 Minutos</option>
                <option value="1d">1 Dia</option>
                <option value="1wk">1 Semana</option>
                <option value="1mo">1 Mês</option>
              </select>
            </div>
          </>
        )}

        <div className="pt-4">
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
            Executar Skill
          </button>
        </div>
      </div>

      {/* Code Snippet & Output Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Snippet */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2 font-semibold text-slate-300">
              <Code className="w-4 h-4 text-amber-400" /> Código Equivalente
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-slate-900 p-0.5 rounded-md border border-slate-800 text-[11px]">
                <button
                  onClick={() => setCodeLang('python')}
                  className={`px-2 py-0.5 rounded ${codeLang === 'python' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                >
                  Python (yfinance)
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
              <FileJson className="w-4 h-4 text-emerald-400" /> Resposta da Skill (JSON Payload)
            </div>
            {output && (
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Payload Válido
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
                Clique em "Executar Skill" para disparar a consulta.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
