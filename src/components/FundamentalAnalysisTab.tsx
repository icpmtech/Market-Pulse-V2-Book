import React from 'react';
import { StockQuote, FundamentalMetrics, AnalystInsights } from '../types/finance';
import { formatCurrency, formatNumber } from '../services/storageService';
import {
  PieChart,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Building2,
  Scale,
  Award,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface FundamentalAnalysisTabProps {
  quote: StockQuote;
  metrics: FundamentalMetrics;
  insights?: AnalystInsights;
}

export const FundamentalAnalysisTab: React.FC<FundamentalAnalysisTabProps> = ({
  quote,
  metrics,
  insights,
}) => {
  const { valuation, profitability, financialHealth, dividends } = metrics;
  const currentPrice = quote.regularMarketPrice;
  const fairValue = valuation.estimatedFairValue || currentPrice * 1.05;
  const diffPct = (((fairValue - currentPrice) / currentPrice) * 100);

  return (
    <div className="space-y-6">
      {/* Top Banner: Fair Value & Valuation Health Model */}
      <div className="geometric-card rounded-2xl p-6 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Left: Summary Grade */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              <Scale className="w-4 h-4" /> Diagnóstico Fundamentalista
            </div>
            <h2 className="text-2xl font-black text-white">
              {valuation.valuationGrade === 'UNDERVALUED'
                ? 'Ativo com Desconto (Subavaliado)'
                : valuation.valuationGrade === 'OVERVALUED'
                ? 'Prêmio Elevado (Sobreavaliado)'
                : 'Preço em Linha com Valor Justo'}
            </h2>
            <p className="text-xs text-slate-300">
              Modelo híbrido baseado em múltiplos históricos, Projeção de Fluxo de Caixa (DCF) e Fórmula de Benjamin Graham.
            </p>
          </div>

          {/* Middle: Fair Value Range Display */}
          <div className="bg-slate-950/80 border border-slate-800/90 p-4 rounded-xl flex flex-col justify-center text-center shadow-inner">
            <div className="text-xs text-slate-400 font-medium">Preço Justo Estimado (Fair Value)</div>
            <div className="text-3xl font-mono font-black text-indigo-400 mt-1">
              ${fairValue.toFixed(2)}
            </div>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <span className="text-xs text-slate-400">Preço Atual: ${currentPrice.toFixed(2)}</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${
                  diffPct >= 0
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {diffPct >= 0 ? `+${diffPct.toFixed(1)}% Margem` : `${diffPct.toFixed(1)}% Prêmio`}
              </span>
            </div>
          </div>

          {/* Right: Valuation Pillars */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950/70 border border-slate-800/80 p-2.5 rounded-lg shadow-xs">
              <div className="text-slate-400">Fórmula de Graham</div>
              <div className="font-mono font-bold text-white text-sm mt-0.5">
                {valuation.grahamNumber ? `$${valuation.grahamNumber.toFixed(2)}` : 'N/D'}
              </div>
            </div>
            <div className="bg-slate-950/70 border border-slate-800/80 p-2.5 rounded-lg shadow-xs">
              <div className="text-slate-400">Saúde Financeira</div>
              <div className={`font-bold text-sm mt-0.5 ${financialHealth.healthGrade === 'HEALTHY' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {financialHealth.healthGrade === 'HEALTHY' ? 'Forte (Excelente)' : 'Moderada'}
              </div>
            </div>
            <div className="bg-slate-950/70 border border-slate-800/80 p-2.5 rounded-lg shadow-xs">
              <div className="text-slate-400">Rentabilidade (ROE)</div>
              <div className="font-mono font-bold text-emerald-400 text-sm mt-0.5">
                {profitability.roe.toFixed(1)}%
              </div>
            </div>
            <div className="bg-slate-950/70 border border-slate-800/80 p-2.5 rounded-lg shadow-xs">
              <div className="text-slate-400">Segurança de Dividendo</div>
              <div className="font-bold text-sky-400 text-sm mt-0.5">
                {dividends.dividendSafety}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Key Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Valuation Multiples */}
        <div className="geometric-card rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-400" /> Múltiplos de Valuation
            </h3>
            <span className="text-[11px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono">
              Preço
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">P/L (Trailing P/E):</span>
              <span className="font-mono font-bold text-white">{valuation.peRatio}x</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">P/L Projetado (Forward P/E):</span>
              <span className="font-mono font-bold text-slate-200">{valuation.peForward}x</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">P/VP (Price to Book):</span>
              <span className="font-mono font-bold text-white">{valuation.pbRatio}x</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">PEG Ratio:</span>
              <span className="font-mono font-bold text-white">{valuation.pegRatio}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">EV / EBITDA:</span>
              <span className="font-mono font-bold text-white">{valuation.evToEbitda}x</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Beta (Volatilidade Relativa):</span>
              <span className="font-mono font-bold text-slate-300">{quote.beta ?? '1.0'}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Profitability & Margins */}
        <div className="geometric-card rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Rentabilidade & Margens
            </h3>
            <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-semibold">
              {profitability.profitabilityGrade}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Margem Bruta:</span>
              <span className="font-mono font-bold text-white">{profitability.grossMargin.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Margem Operacional:</span>
              <span className="font-mono font-bold text-white">{profitability.operatingMargin.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Margem Líquida:</span>
              <span className="font-mono font-bold text-emerald-400">{profitability.netMargin.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">ROE (Retorno s/ Patr.):</span>
              <span className="font-mono font-bold text-emerald-400">{profitability.roe.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">ROA (Retorno s/ Ativos):</span>
              <span className="font-mono font-bold text-slate-200">{profitability.roa.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">LPA (EPS 12M):</span>
              <span className="font-mono font-bold text-white">${quote.epsTrailingTwelveMonths?.toFixed(2) ?? 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Financial Health & Debt */}
        <div className="geometric-card rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-400" /> Saúde Financeira
            </h3>
            <span className="text-[11px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded font-semibold">
              {financialHealth.healthGrade}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Dívida / Patrimônio Líq.:</span>
              <span className="font-mono font-bold text-white">{financialHealth.debtToEquity.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Liquidez Corrente:</span>
              <span className="font-mono font-bold text-emerald-400">{financialHealth.currentRatio.toFixed(2)}x</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Fluxo de Caixa Livre (FCF):</span>
              <span className="font-mono font-bold text-white">
                {formatCurrency(financialHealth.freeCashFlow, quote.currency, true)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Capitalização de Mercado:</span>
              <span className="font-mono font-bold text-white">
                {formatCurrency(quote.marketCap, quote.currency, true)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Valor da Empresa (EV):</span>
              <span className="font-mono font-bold text-white">
                {formatCurrency(quote.enterpriseValue, quote.currency, true)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Dividends & Distribution */}
        <div className="geometric-card rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" /> Proventos & Dividendos
            </h3>
            <span className="text-[11px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">
              {dividends.dividendYield > 0 ? `${dividends.dividendYield}% a.a.` : 'Sem Proventos'}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Dividend Yield (Anual):</span>
              <span className="font-mono font-bold text-amber-400">{dividends.dividendYield.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Pagamento Anual por Ação:</span>
              <span className="font-mono font-bold text-white">
                {formatCurrency(dividends.annualPayout, quote.currency)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Payout Ratio (% Lucro):</span>
              <span className="font-mono font-bold text-white">{dividends.payoutRatio.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Sustentabilidade:</span>
              <span className={`font-bold ${dividends.dividendSafety === 'SAFE' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {dividends.dividendSafety}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Frequência Estimada:</span>
              <span className="text-slate-300">
                {quote.symbol.endsWith('.SA') ? 'Mensal / Trimestral' : 'Trimestral'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Company Profile Card */}
      <div className="geometric-card rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800/80">
          <Building2 className="w-5 h-5 text-sky-400" />
          <h3 className="text-sm font-bold text-white">Perfil Corporativo & Informações de Mercado</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs text-slate-300">
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 shadow-xs">
            <div className="text-slate-400 mb-1">Setor</div>
            <div className="font-bold text-white text-sm">{quote.sector || 'Geral'}</div>
          </div>
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 shadow-xs">
            <div className="text-slate-400 mb-1">Indústria</div>
            <div className="font-bold text-white text-sm">{quote.industry || 'Mercado Geral'}</div>
          </div>
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 shadow-xs">
            <div className="text-slate-400 mb-1">Bolsa / Praça</div>
            <div className="font-bold text-white text-sm">{quote.exchange}</div>
          </div>
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 shadow-xs">
            <div className="text-slate-400 mb-1">Moeda de Negociação</div>
            <div className="font-bold text-white text-sm">{quote.currency}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
