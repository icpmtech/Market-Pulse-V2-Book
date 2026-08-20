/**
 * Market Pulse - Financial Types and Skill Interfaces
 */

export interface StockQuote {
  symbol: string;
  shortName: string;
  longName?: string;
  currency: string;
  exchange: string;
  marketState: 'REGULAR' | 'CLOSED' | 'PRE' | 'POST';
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketPreviousClose: number;
  regularMarketOpen: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketVolume: number;
  averageDailyVolume3Month?: number;
  fiftyTwoWeekLow: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekChangePercent?: number;
  marketCap?: number;
  enterpriseValue?: number;
  trailingPE?: number;
  forwardPE?: number;
  priceToBook?: number;
  pegRatio?: number;
  beta?: number;
  epsTrailingTwelveMonths?: number;
  epsForward?: number;
  dividendRate?: number;
  dividendYield?: number;
  sharesOutstanding?: number;
  sector?: string;
  industry?: string;
  website?: string;
  summaryProfile?: string;
  lastUpdated: string;
}

export interface PriceHistoryItem {
  timestamp: number;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose?: number;
}

export interface AnalystInsights {
  symbol: string;
  targetHighPrice: number;
  targetLowPrice: number;
  targetMeanPrice: number;
  targetMedianPrice: number;
  currentPrice: number;
  upsidePotentialPercent: number;
  numberOfAnalystOpinions: number;
  recommendationKey: 'strong_buy' | 'buy' | 'hold' | 'underperform' | 'sell';
  recommendationMean: number; // 1.0 (Strong Buy) to 5.0 (Sell)
  recommendationsDistribution: {
    strongBuy: number;
    buy: number;
    hold: number;
    underperform: number;
    sell: number;
  };
  earningsSurprises: {
    period: string;
    actual: number;
    estimate: number;
    surprisePercent: number;
  }[];
  revenueEstimates?: {
    period: string;
    avgEstimate: number;
    lowEstimate: number;
    highEstimate: number;
    yearAgoRevenue: number;
  }[];
  recentUpgradesDowngrades: {
    date: string;
    firm: string;
    toGrade: string;
    fromGrade?: string;
    action: 'up' | 'down' | 'main' | 'init' | 'reit';
  }[];
}

export interface TechnicalIndicators {
  sma20: number[];
  sma50: number[];
  sma200: number[];
  ema9: number[];
  ema21: number[];
  rsi14: number[];
  macd: {
    macdLine: number[];
    signalLine: number[];
    histogram: number[];
  };
  bollingerBands: {
    upper: number[];
    middle: number[];
    lower: number[];
  };
  stochastic: {
    k: number[];
    d: number[];
  };
  atr14: number;
  pivotPoints: {
    pivot: number;
    r1: number;
    r2: number;
    r3: number;
    s1: number;
    s2: number;
    s3: number;
  };
  summary: {
    overallSignal: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
    score: number; // 0 to 100
    buyCount: number;
    neutralCount: number;
    sellCount: number;
    goldenCross: boolean;
    deathCross: boolean;
    rsiStatus: 'OVERSOLD' | 'NEUTRAL' | 'OVERBOUGHT';
  };
}

export interface FundamentalMetrics {
  valuation: {
    peRatio: number;
    peForward: number;
    pbRatio: number;
    pegRatio: number;
    evToEbitda: number;
    grahamNumber?: number;
    estimatedFairValue?: number;
    valuationGrade: 'UNDERVALUED' | 'FAIR' | 'OVERVALUED';
  };
  profitability: {
    grossMargin: number;
    operatingMargin: number;
    netMargin: number;
    roe: number;
    roa: number;
    profitabilityGrade: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'WEAK';
  };
  financialHealth: {
    debtToEquity: number;
    currentRatio: number;
    freeCashFlow: number;
    healthGrade: 'HEALTHY' | 'MODERATE' | 'RISKY';
  };
  dividends: {
    dividendYield: number;
    annualPayout: number;
    payoutRatio: number;
    dividendSafety: 'SAFE' | 'MODERATE' | 'UNSAFE' | 'N/A';
  };
}

export interface TickerSearchResult {
  symbol: string;
  name: string;
  exchDisp: string;
  typeDisp: 'Stock' | 'ETF' | 'Crypto' | 'Currency' | 'Index' | 'Commodity';
  sector?: string;
  industry?: string;
}

export interface MarketSummaryItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  category: 'Index' | 'Crypto' | 'Forex' | 'Commodity';
}

export interface WatchlistCategory {
  id: string;
  name: string;
  symbols: string[];
}

export interface PortfolioPosition {
  id: string;
  symbol: string;
  shares: number;
  buyPrice: number;
  buyDate: string;
  notes?: string;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'ABOVE' | 'BELOW';
  createdAt: string;
  active: boolean;
  triggered?: boolean;
  triggeredAt?: string;
}
