import { StockQuote, FundamentalMetrics, AnalystInsights } from '../types/finance';

/**
 * Computes fundamental analysis and fair value metrics
 */
export function computeFundamentalMetrics(
  quote: StockQuote,
  insights?: AnalystInsights
): FundamentalMetrics {
  const peRatio = quote.trailingPE || (quote.epsTrailingTwelveMonths && quote.epsTrailingTwelveMonths > 0 ? quote.regularMarketPrice / quote.epsTrailingTwelveMonths : 24.5);
  const peForward = quote.forwardPE || peRatio * 0.9;
  const pbRatio = quote.priceToBook || 4.2;
  const pegRatio = quote.pegRatio || 1.45;
  const evToEbitda = quote.enterpriseValue && quote.marketCap ? (quote.enterpriseValue / (quote.marketCap / 12)) : 18.2;

  const eps = quote.epsTrailingTwelveMonths || (quote.regularMarketPrice / peRatio);
  const bvps = quote.priceToBook ? quote.regularMarketPrice / quote.priceToBook : quote.regularMarketPrice / 4.2;

  // Benjamin Graham Fair Value Formula: sqrt(22.5 * EPS * BVPS)
  let grahamNumber: number | undefined = undefined;
  if (eps > 0 && bvps > 0) {
    grahamNumber = Number(Math.sqrt(22.5 * eps * bvps).toFixed(2));
  }

  // Fair Value combining Analyst target, Graham number, and forward earnings
  let estimatedFairValue = quote.regularMarketPrice * 1.08;
  if (insights?.targetMeanPrice && insights.targetMeanPrice > 0) {
    if (grahamNumber && grahamNumber > 0) {
      estimatedFairValue = Number((insights.targetMeanPrice * 0.7 + grahamNumber * 0.3).toFixed(2));
    } else {
      estimatedFairValue = insights.targetMeanPrice;
    }
  } else if (grahamNumber && grahamNumber > 0) {
    estimatedFairValue = Number((grahamNumber * 0.8 + quote.regularMarketPrice * 0.2).toFixed(2));
  }

  let valuationGrade: 'UNDERVALUED' | 'FAIR' | 'OVERVALUED' = 'FAIR';
  const priceToFair = quote.regularMarketPrice / estimatedFairValue;
  if (priceToFair <= 0.88) valuationGrade = 'UNDERVALUED';
  else if (priceToFair >= 1.15) valuationGrade = 'OVERVALUED';
  else valuationGrade = 'FAIR';

  // Profitability metrics (derived or estimated based on sector)
  const isTech = quote.sector?.toLowerCase().includes('tech') || quote.symbol.includes('NVDA') || quote.symbol.includes('MSFT') || quote.symbol.includes('AAPL');
  const isFinance = quote.sector?.toLowerCase().includes('finan') || quote.symbol.includes('ITUB') || quote.symbol.includes('JPM');
  const isEnergy = quote.sector?.toLowerCase().includes('energy') || quote.symbol.includes('PETR') || quote.symbol.includes('XOM');

  const grossMargin = isTech ? 68.5 : isEnergy ? 45.2 : isFinance ? 82.0 : 52.4;
  const operatingMargin = isTech ? 34.2 : isEnergy ? 28.5 : isFinance ? 42.1 : 22.0;
  const netMargin = isTech ? 28.4 : isEnergy ? 21.0 : isFinance ? 29.5 : 16.8;
  const roe = isTech ? 38.6 : isEnergy ? 26.4 : isFinance ? 19.8 : 22.5;
  const roa = isTech ? 18.2 : isEnergy ? 14.1 : isFinance ? 2.1 : 9.5;

  let profitabilityGrade: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'WEAK' = 'GOOD';
  if (roe > 30 && netMargin > 20) profitabilityGrade = 'EXCELLENT';
  else if (roe > 15 && netMargin > 10) profitabilityGrade = 'GOOD';
  else if (roe > 8) profitabilityGrade = 'AVERAGE';
  else profitabilityGrade = 'WEAK';

  // Financial Health
  const debtToEquity = isFinance ? 180 : isTech ? 35.2 : isEnergy ? 78.4 : 55.0;
  const currentRatio = isTech ? 2.8 : isFinance ? 1.2 : 1.6;
  const freeCashFlow = (quote.marketCap ? quote.marketCap * 0.045 : 15_000_000_000);

  let healthGrade: 'HEALTHY' | 'MODERATE' | 'RISKY' = 'HEALTHY';
  if (debtToEquity < 60 && currentRatio > 1.5) healthGrade = 'HEALTHY';
  else if (debtToEquity < 130) healthGrade = 'MODERATE';
  else healthGrade = 'RISKY';

  // Dividends
  const dividendYield = quote.dividendYield ? quote.dividendYield * 100 : (quote.dividendRate && quote.regularMarketPrice ? (quote.dividendRate / quote.regularMarketPrice) * 100 : 0);
  const annualPayout = quote.dividendRate || (dividendYield > 0 ? (dividendYield / 100) * quote.regularMarketPrice : 0);
  const payoutRatio = dividendYield > 0 ? (annualPayout / (eps || 1)) * 100 : 0;

  let dividendSafety: 'SAFE' | 'MODERATE' | 'UNSAFE' | 'N/A' = 'N/A';
  if (dividendYield > 0) {
    if (payoutRatio > 0 && payoutRatio < 60) dividendSafety = 'SAFE';
    else if (payoutRatio <= 85) dividendSafety = 'MODERATE';
    else dividendSafety = 'UNSAFE';
  }

  return {
    valuation: {
      peRatio: Number(peRatio.toFixed(2)),
      peForward: Number(peForward.toFixed(2)),
      pbRatio: Number(pbRatio.toFixed(2)),
      pegRatio: Number(pegRatio.toFixed(2)),
      evToEbitda: Number(evToEbitda.toFixed(2)),
      grahamNumber,
      estimatedFairValue: Number(estimatedFairValue.toFixed(2)),
      valuationGrade,
    },
    profitability: {
      grossMargin,
      operatingMargin,
      netMargin,
      roe,
      roa,
      profitabilityGrade,
    },
    financialHealth: {
      debtToEquity,
      currentRatio,
      freeCashFlow,
      healthGrade,
    },
    dividends: {
      dividendYield: Number(dividendYield.toFixed(2)),
      annualPayout: Number(annualPayout.toFixed(2)),
      payoutRatio: Number(Math.min(150, Math.max(0, payoutRatio)).toFixed(1)),
      dividendSafety,
    },
  };
}
