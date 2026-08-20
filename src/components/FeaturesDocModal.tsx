import React, { useState } from 'react';
import {
  FileText,
  X,
  Copy,
  Check,
  CheckCircle2,
  ListTodo,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface FeaturesDocModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeaturesDocModal: React.FC<FeaturesDocModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    const text = `# Market Pulse - Yahoo Finance & Technical Analysis
Skills implementadas: get_stock_quote, get_price_history, get_analyst_insights
Gráficos: Apache ECharts interativos com Candlestick, MAs e Osciladores
Análise: Técnica (RSI, MACD, Bollinger, Pivot Points) e Fundamentalista (P/L, Fair Value, Dividendos)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/20 text-sky-400 rounded-xl border border-blue-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Documentação de Features (features.md)</h2>
              <p className="text-xs text-slate-400">
                Skills Yahoo Finance, Motor Gráfico Apache ECharts e Roadmap de Evolução
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiado!' : 'Copiar Resumo'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Markdown-style Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* Section 1: Skills */}
          <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" /> 1. Skills Yahoo Finance (yFinance Engine)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                <code className="text-xs font-mono font-bold text-sky-300">get_stock_quote(symbol)</code>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  Cotação em tempo real, variação nominal e percentual, máxima/mínima 52 semanas, volume, P/L, EPS, Market Cap e Dividend Yield.
                </p>
              </div>
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                <code className="text-xs font-mono font-bold text-emerald-300">get_price_history(symbol, period, interval)</code>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  Série temporal de velas japonesas OHLCV (Open, High, Low, Close, Volume) nos períodos 1D, 5D, 1M, 6M, 1A, 5A e MAX.
                </p>
              </div>
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                <code className="text-xs font-mono font-bold text-purple-300">get_analyst_insights(symbol)</code>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  Consenso de Wall Street (Strong Buy a Sell), Preço-Alvo Mínimo, Médio e Máximo, surpresas de lucros trimestrais e histórico de upgrades/downgrades.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Charts & Technical Engine */}
          <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 2. Apache ECharts & Motores de Análise
            </h3>
            <div className="space-y-2 text-slate-400 text-[11px] leading-relaxed">
              <p>
                • <strong>Apache ECharts</strong>: Renderização ultra-rápida em Canvas com suporte a Velas Japonesas, Linha de Fechamento, Área com gradiente, sobreposição de SMA 20, 50, 200, Bandas de Bollinger, sub-painel de Volume e Oscilador (RSI 14 / MACD).
              </p>
              <p>
                • <strong>Análise Técnica</strong>: Termômetro com Score de 0 a 100 ponderando 12 indicadores, detecção de Golden Cross / Death Cross, suporte e resistência (S1-S3, R1-R3) e ATR para volatilidade.
              </p>
              <p>
                • <strong>Análise Fundamentalista</strong>: Diagnóstico com Fórmula de Graham, Múltiplos P/L, P/VP, EV/EBITDA, ROE, Margens e sustentabilidade de Dividendos.
              </p>
            </div>
          </div>

          {/* Section 3: Roadmap */}
          <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-amber-400" /> 3. Roadmap de Evolução Futura (Versão 2.0)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg border border-slate-800/80">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>WebSockets com feed tick-by-tick ao vivo</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg border border-slate-800/80">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Backtesting de estratégias com Sharpe Ratio</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg border border-slate-800/80">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Screener de Ações customizado com filtros P/L & DY</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg border border-slate-800/80">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Disparo de alertas automáticos via Webhooks</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
