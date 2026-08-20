import React from 'react';
import { TechnicalIndicators, StockQuote } from '../types/finance';
import { formatCurrency } from '../services/storageService';
import {
  TrendingUp,
  TrendingDown,
  Gauge,
  Zap,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Compass,
} from 'lucide-react';

interface TechnicalAnalysisTabProps {
  quote: StockQuote;
  indicators: TechnicalIndicators;
}

export const TechnicalAnalysisTab: React.FC<TechnicalAnalysisTabProps> = ({
  quote,
  indicators,
}) => {
  const { summary, pivotPoints, atr14 } = indicators;
  const currentPrice = quote.regularMarketPrice;

  // Signal color styling
  const getSignalBadge = (action: 'BUY' | 'SELL' | 'NEUTRAL') => {
    if (action === 'BUY') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <ArrowUpRight className="w-3.5 h-3.5" /> Compra
        </span>
      );
    }
    if (action === 'SELL') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
          <ArrowDownRight className="w-3.5 h-3.5" /> Venda
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
        Neutro
      </span>
    );
  };

  const sma20Val = indicators.sma20[indicators.sma20.length - 1];
  const sma50Val = indicators.sma50[indicators.sma50.length - 1];
  const sma200Val = indicators.sma200[indicators.sma200.length - 1];
  const ema9Val = indicators.ema9[indicators.ema9.length - 1];
  const ema21Val = indicators.ema21[indicators.ema21.length - 1];
  const rsiVal = indicators.rsi14[indicators.rsi14.length - 1];
  const macdVal = indicators.macd.macdLine[indicators.macd.macdLine.length - 1];
  const macdHist = indicators.macd.histogram[indicators.macd.histogram.length - 1];
  const stochK = indicators.stochastic.k[indicators.stochastic.k.length - 1];
  const stochD = indicators.stochastic.d[indicators.stochastic.d.length - 1];
  const bbUpper = indicators.bollingerBands.upper[indicators.bollingerBands.upper.length - 1];
  const bbLower = indicators.bollingerBands.lower[indicators.bollingerBands.lower.length - 1];

  return (
    <div className="space-y-6">
      {/* Top Row: Overall Gauge Meter & Signal Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall Meter Card */}
        <div className="geometric-card rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-sky-400" /> Medidor Técnico Consolidado
            </h3>
            <span className="text-xs text-slate-500 font-mono">12 Indicadores</span>
          </div>

          <div className="my-4 text-center">
            {/* Visual Arc Gauge Representation */}
            <div className="relative w-48 h-24 mx-auto overflow-hidden">
              <div className="w-48 h-48 rounded-full border-12 border-slate-800/80 border-b-transparent border-l-transparent -rotate-45 relative">
                <div
                  className="absolute inset-0 rounded-full border-12 border-transparent border-t-emerald-500 transition-all duration-700"
                  style={{
                    transform: `rotate(${(summary.score / 100) * 180 - 90}deg)`,
                  }}
                ></div>
              </div>
            </div>

            <div className="mt-1">
              <div
                className={`text-2xl font-black tracking-tight ${
                  summary.score >= 70
                    ? 'text-emerald-400'
                    : summary.score >= 55
                    ? 'text-emerald-300'
                    : summary.score <= 30
                    ? 'text-rose-500'
                    : summary.score <= 45
                    ? 'text-rose-400'
                    : 'text-amber-300'
                }`}
              >
                {summary.overallSignal.replace('_', ' ')}
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                Pontuação Técnica: <span className="font-bold text-white">{summary.score} / 100</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-slate-800/80 text-xs">
            <div className="bg-emerald-950/30 border border-emerald-800/40 p-2 rounded-xl">
              <div className="text-emerald-400 font-bold text-base">{summary.buyCount}</div>
              <div className="text-emerald-300 text-[10px]">Compra</div>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/60 p-2 rounded-xl">
              <div className="text-slate-200 font-bold text-base">{summary.neutralCount}</div>
              <div className="text-slate-400 text-[10px]">Neutro</div>
            </div>
            <div className="bg-rose-950/30 border border-rose-800/40 p-2 rounded-xl">
              <div className="text-rose-400 font-bold text-base">{summary.sellCount}</div>
              <div className="text-rose-300 text-[10px]">Venda</div>
            </div>
          </div>
        </div>

        {/* Moving Averages Status Card */}
        <div className="geometric-card rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" /> Médias & Cruzamentos
            </h3>
            {summary.goldenCross ? (
              <span className="text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-semibold animate-pulse">
                🌟 Golden Cross!
              </span>
            ) : summary.deathCross ? (
              <span className="text-[11px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded font-semibold">
                ⚠️ Death Cross
              </span>
            ) : (
              <span className="text-[11px] bg-slate-950/80 text-slate-400 border border-slate-800 px-2 py-0.5 rounded">
                Alinhamento Regular
              </span>
            )}
          </div>

          <div className="space-y-2.5 my-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">SMA 20 (Curto Prazo):</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-200">${sma20Val?.toFixed(2) ?? 'N/A'}</span>
                {getSignalBadge(currentPrice > sma20Val ? 'BUY' : 'SELL')}
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">SMA 50 (Médio Prazo):</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-200">${sma50Val?.toFixed(2) ?? 'N/A'}</span>
                {getSignalBadge(currentPrice > sma50Val ? 'BUY' : 'SELL')}
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">SMA 200 (Longo Prazo):</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-200">${sma200Val?.toFixed(2) ?? 'N/A'}</span>
                {getSignalBadge(currentPrice > sma200Val ? 'BUY' : 'SELL')}
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">EMA 9 x EMA 21:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-200">${ema9Val?.toFixed(2)}</span>
                {getSignalBadge(ema9Val > ema21Val ? 'BUY' : 'SELL')}
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80 text-xs text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              O preço atual (${currentPrice.toFixed(2)}) está{' '}
              <strong className={currentPrice > sma50Val ? 'text-emerald-400' : 'text-rose-400'}>
                {currentPrice > sma50Val ? 'acima' : 'abaixo'} da SMA 50
              </strong>
              , indicando tendência estrutural de {currentPrice > sma50Val ? 'alta' : 'baixa'}.
            </span>
          </div>
        </div>

        {/* Volatility & Momentum Card */}
        <div className="geometric-card rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Compass className="w-4 h-4 text-pink-400" /> Momentum & Volatilidade
            </h3>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                summary.rsiStatus === 'OVERSOLD'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : summary.rsiStatus === 'OVERBOUGHT'
                  ? 'bg-rose-500/20 text-rose-300'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              RSI: {summary.rsiStatus}
            </span>
          </div>

          <div className="space-y-3 my-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">RSI 14 Períodos:</span>
                <span className="font-mono font-bold text-white">{rsiVal?.toFixed(1) ?? 50} / 100</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden relative border border-slate-800">
                <div className="absolute left-[30%] w-0.5 h-full bg-emerald-500/60" title="Sobrevenda (30)"></div>
                <div className="absolute left-[70%] w-0.5 h-full bg-rose-500/60" title="Sobrecompra (70)"></div>
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, rsiVal || 50))}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">MACD Histogram:</span>
              <div className="flex items-center gap-2">
                <span className={`font-mono ${macdHist >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {macdHist >= 0 ? '+' : ''}{macdHist?.toFixed(2) ?? '0.00'}
                </span>
                {getSignalBadge(macdHist >= 0 ? 'BUY' : 'SELL')}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Estocástico %K:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-200">{stochK?.toFixed(1) ?? '50.0'}</span>
                {getSignalBadge(stochK < 20 ? 'BUY' : stochK > 80 ? 'SELL' : 'NEUTRAL')}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">ATR 14 (Volatilidade Diária):</span>
              <span className="font-mono text-slate-200">${atr14.toFixed(2)}</span>
            </div>
          </div>

          <div className="text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-800/80">
            <span>Bandas Bollinger:</span>
            <span className="font-mono text-slate-400">
              ${bbLower?.toFixed(1)} - ${bbUpper?.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Pivot Points & Support/Resistance Levels */}
      <div className="geometric-card rounded-2xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800/80">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" /> Níveis de Suporte e Resistência (Pivot Points)
            </h3>
            <p className="text-xs text-slate-400">
              Pontos de inflexão de liquidez calculados com base no fechamento e volatilidade recente
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400">Preço Atual:</span>
            <span className="font-mono font-bold text-white">${currentPrice.toFixed(2)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-3 text-center">
          {/* S3 */}
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
            <div className="text-xs font-semibold text-rose-400 mb-1">Suporte 3 (S3)</div>
            <div className="text-base font-mono font-bold text-slate-200">${pivotPoints.s3}</div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono">
              {(((pivotPoints.s3 - currentPrice) / currentPrice) * 100).toFixed(1)}%
            </div>
          </div>
          {/* S2 */}
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
            <div className="text-xs font-semibold text-rose-300 mb-1">Suporte 2 (S2)</div>
            <div className="text-base font-mono font-bold text-slate-200">${pivotPoints.s2}</div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono">
              {(((pivotPoints.s2 - currentPrice) / currentPrice) * 100).toFixed(1)}%
            </div>
          </div>
          {/* S1 */}
          <div className="bg-rose-950/20 border border-rose-800/40 p-3 rounded-xl">
            <div className="text-xs font-semibold text-rose-300 mb-1">Suporte 1 (S1)</div>
            <div className="text-base font-mono font-bold text-rose-300">${pivotPoints.s1}</div>
            <div className="text-[10px] text-rose-400/80 mt-1 font-mono">
              {(((pivotPoints.s1 - currentPrice) / currentPrice) * 100).toFixed(1)}%
            </div>
          </div>
          {/* PIVOT */}
          <div className="bg-blue-950/40 border border-blue-600/50 p-3 rounded-xl shadow-md">
            <div className="text-xs font-bold text-sky-300 mb-1">Pivô Central (P)</div>
            <div className="text-lg font-mono font-black text-white">${pivotPoints.pivot}</div>
            <div className="text-[10px] text-sky-400 mt-1 font-mono">
              {(((pivotPoints.pivot - currentPrice) / currentPrice) * 100).toFixed(1)}%
            </div>
          </div>
          {/* R1 */}
          <div className="bg-emerald-950/20 border border-emerald-800/40 p-3 rounded-xl">
            <div className="text-xs font-semibold text-emerald-300 mb-1">Resistência 1 (R1)</div>
            <div className="text-base font-mono font-bold text-emerald-300">${pivotPoints.r1}</div>
            <div className="text-[10px] text-emerald-400/80 mt-1 font-mono">
              +{(((pivotPoints.r1 - currentPrice) / currentPrice) * 100).toFixed(1)}%
            </div>
          </div>
          {/* R2 */}
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
            <div className="text-xs font-semibold text-emerald-300 mb-1">Resistência 2 (R2)</div>
            <div className="text-base font-mono font-bold text-slate-200">${pivotPoints.r2}</div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono">
              +{(((pivotPoints.r2 - currentPrice) / currentPrice) * 100).toFixed(1)}%
            </div>
          </div>
          {/* R3 */}
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
            <div className="text-xs font-semibold text-emerald-400 mb-1">Resistência 3 (R3)</div>
            <div className="text-base font-mono font-bold text-slate-200">${pivotPoints.r3}</div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono">
              +{(((pivotPoints.r3 - currentPrice) / currentPrice) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
