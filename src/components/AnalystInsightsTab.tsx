import React from 'react';
import { AnalystInsights, StockQuote } from '../types/finance';
import { formatCurrency, formatNumber } from '../services/storageService';
import {
  Users,
  Target,
  TrendingUp,
  Award,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
} from 'lucide-react';

interface AnalystInsightsTabProps {
  quote: StockQuote;
  insights: AnalystInsights;
}

export const AnalystInsightsTab: React.FC<AnalystInsightsTabProps> = ({
  quote,
  insights,
}) => {
  const {
    targetHighPrice,
    targetLowPrice,
    targetMeanPrice,
    currentPrice,
    upsidePotentialPercent,
    numberOfAnalystOpinions,
    recommendationsDistribution,
    earningsSurprises,
    recentUpgradesDowngrades,
  } = insights;

  const totalRecs =
    recommendationsDistribution.strongBuy +
    recommendationsDistribution.buy +
    recommendationsDistribution.hold +
    recommendationsDistribution.underperform +
    recommendationsDistribution.sell || 1;

  const strongBuyPct = (recommendationsDistribution.strongBuy / totalRecs) * 100;
  const buyPct = (recommendationsDistribution.buy / totalRecs) * 100;
  const holdPct = (recommendationsDistribution.hold / totalRecs) * 100;
  const underperformPct = (recommendationsDistribution.underperform / totalRecs) * 100;
  const sellPct = (recommendationsDistribution.sell / totalRecs) * 100;

  // Calculate target range slider position
  const targetRange = Math.max(1, targetHighPrice - targetLowPrice);
  const currentPosPct = Math.min(100, Math.max(0, ((currentPrice - targetLowPrice) / targetRange) * 100));
  const meanPosPct = Math.min(100, Math.max(0, ((targetMeanPrice - targetLowPrice) / targetRange) * 100));

  return (
    <div className="space-y-6">
      {/* Top Banner: Price Target & Consensus */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Consensus Card */}
        <div className="geometric-card rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-400" /> Consenso de Wall Street
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {numberOfAnalystOpinions} Analistas
            </span>
          </div>

          <div className="my-4 text-center">
            <div className="inline-block px-4 py-1.5 rounded-xl text-lg font-black tracking-wide uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
              {insights.recommendationKey.replace('_', ' ')}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Índice Médio: <span className="font-bold text-white font-mono">{insights.recommendationMean}</span> (1.0 = Compra Forte • 5.0 = Venda)
            </p>
          </div>

          {/* Breakdown Stack Bar */}
          <div className="space-y-2">
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
              <div style={{ width: `${strongBuyPct}%` }} className="bg-emerald-500" title={`Compra Forte: ${strongBuyPct.toFixed(0)}%`}></div>
              <div style={{ width: `${buyPct}%` }} className="bg-emerald-400" title={`Compra: ${buyPct.toFixed(0)}%`}></div>
              <div style={{ width: `${holdPct}%` }} className="bg-amber-400" title={`Manter: ${holdPct.toFixed(0)}%`}></div>
              <div style={{ width: `${underperformPct}%` }} className="bg-orange-500" title={`Abaixo: ${underperformPct.toFixed(0)}%`}></div>
              <div style={{ width: `${sellPct}%` }} className="bg-rose-500" title={`Venda: ${sellPct.toFixed(0)}%`}></div>
            </div>

            <div className="grid grid-cols-5 text-[10px] text-center text-slate-400 font-mono">
              <div>
                <span className="text-emerald-400 font-bold">{recommendationsDistribution.strongBuy}</span>
                <div>Forte</div>
              </div>
              <div>
                <span className="text-emerald-300 font-bold">{recommendationsDistribution.buy}</span>
                <div>Compra</div>
              </div>
              <div>
                <span className="text-amber-400 font-bold">{recommendationsDistribution.hold}</span>
                <div>Manter</div>
              </div>
              <div>
                <span className="text-orange-400 font-bold">{recommendationsDistribution.underperform}</span>
                <div>Neutro</div>
              </div>
              <div>
                <span className="text-rose-400 font-bold">{recommendationsDistribution.sell}</span>
                <div>Venda</div>
              </div>
            </div>
          </div>
        </div>

        {/* Target Price Range Card (Span 2) */}
        <div className="lg:col-span-2 geometric-card rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" /> Preço-Alvo em 12 Meses (Price Target Range)
              </h3>
              <p className="text-xs text-slate-400">
                Projeção dos analistas para a cotação nos próximos 12 meses
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Potencial Médio:</span>
              <span
                className={`text-sm font-mono font-bold px-2.5 py-0.5 rounded-lg ${
                  upsidePotentialPercent >= 0
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {upsidePotentialPercent >= 0 ? '+' : ''}{upsidePotentialPercent}%
              </span>
            </div>
          </div>

          {/* Visual Target Spread Slider */}
          <div className="my-6 px-4">
            <div className="relative w-full h-4 bg-slate-950 rounded-full border border-slate-800 shadow-inner">
              {/* Highlight range from Current to Target Mean */}
              <div
                className="absolute top-0 bottom-0 bg-gradient-to-r from-blue-600/60 to-emerald-500/60 rounded-full"
                style={{
                  left: `${Math.min(currentPosPct, meanPosPct)}%`,
                  width: `${Math.abs(meanPosPct - currentPosPct)}%`,
                }}
              ></div>

              {/* Current Price Pin */}
              <div
                className="absolute -top-7 -translate-x-1/2 flex flex-col items-center pointer-events-none"
                style={{ left: `${currentPosPct}%` }}
              >
                <span className="bg-blue-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow">
                  Atual: ${currentPrice.toFixed(2)}
                </span>
                <div className="w-1.5 h-1.5 bg-blue-500 rotate-45 mt-0.5"></div>
              </div>

              {/* Mean Target Pin */}
              <div
                className="absolute -bottom-7 -translate-x-1/2 flex flex-col items-center pointer-events-none"
                style={{ left: `${meanPosPct}%` }}
              >
                <div className="w-1.5 h-1.5 bg-emerald-400 rotate-45 mb-0.5"></div>
                <span className="bg-emerald-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow">
                  Alvo Médio: ${targetMeanPrice.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Range markers */}
            <div className="flex justify-between text-xs font-mono text-slate-400 mt-9">
              <div className="text-left">
                <span className="text-slate-500">Mínimo:</span>
                <div className="text-rose-400 font-bold">${targetLowPrice.toFixed(2)}</div>
              </div>
              <div className="text-center">
                <span className="text-slate-500">Médio:</span>
                <div className="text-emerald-400 font-bold">${targetMeanPrice.toFixed(2)}</div>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Máximo:</span>
                <div className="text-emerald-300 font-bold">${targetHighPrice.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 text-xs text-slate-300 flex items-center justify-between shadow-xs">
            <span className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>
                Alvo Máximo de Wall Street representa ganho potencial de{' '}
                <strong className="text-emerald-400">
                  +{(((targetHighPrice - currentPrice) / currentPrice) * 100).toFixed(1)}%
                </strong>
                .
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Earnings History & Analyst Upgrades/Downgrades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Surprises */}
        <div className="geometric-card rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" /> Histórico de Resultados (Earnings Surprises)
            </h3>
            <span className="text-xs text-emerald-400 font-medium font-mono">Últimos 4 Trimestres</span>
          </div>

          <div className="space-y-3">
            {earningsSurprises.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-950/70 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between text-xs shadow-xs"
              >
                <div>
                  <div className="font-bold text-white">{item.period}</div>
                  <div className="text-slate-400 font-mono">
                    Estimado: <span className="text-slate-200">${item.estimate.toFixed(2)}</span> • Real:{' '}
                    <span className="text-emerald-400 font-bold">${item.actual.toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <ArrowUpRight className="w-3.5 h-3.5" /> +{item.surprisePercent.toFixed(2)}%
                  </span>
                  <div className="text-[10px] text-slate-500 mt-0.5">Surpresa Positiva</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upgrades & Downgrades */}
        <div className="geometric-card rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" /> Revisões de Recomendações Recentes
            </h3>
            <span className="text-xs text-slate-400 font-mono">Bancos de Investimento</span>
          </div>

          <div className="space-y-3">
            {recentUpgradesDowngrades.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-950/70 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between text-xs shadow-xs"
              >
                <div>
                  <div className="font-bold text-white">{item.firm}</div>
                  <div className="text-slate-400 font-mono text-[11px] mt-0.5">
                    {item.fromGrade ? `${item.fromGrade} ➔ ` : ''}
                    <strong className="text-slate-200">{item.toGrade}</strong>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded text-[11px] ${
                      item.action === 'up'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : item.action === 'down'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {item.action === 'up' ? 'Upgrade' : item.action === 'down' ? 'Downgrade' : 'Reiterado'}
                  </span>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-mono">{item.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
