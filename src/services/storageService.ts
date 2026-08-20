import { WatchlistCategory, PortfolioPosition, PriceAlert } from '../types/finance';

const WATCHLIST_KEY = 'market_pulse_watchlists_v1';
const PORTFOLIO_KEY = 'market_pulse_portfolios_v1';
const ALERTS_KEY = 'market_pulse_alerts_v1';
const RECENT_SEARCHES_KEY = 'market_pulse_recent_searches_v1';
const SETTINGS_KEY = 'market_pulse_settings_v1';

const DEFAULT_WATCHLISTS: WatchlistCategory[] = [
  {
    id: 'favs',
    name: 'Favoritos Principais',
    symbols: ['NVDA', 'AAPL', 'MSFT', 'PETR4.SA', 'BTC-USD', 'SPY'],
  },
  {
    id: 'tech',
    name: 'Big Tech & IA',
    symbols: ['NVDA', 'MSFT', 'AAPL', 'GOOGL', 'AMZN', 'META', 'TSLA'],
  },
  {
    id: 'b3',
    name: 'B3 Brasil Dividendos',
    symbols: ['PETR4.SA', 'VALE3.SA', 'ITUB4.SA', 'BBAS3.SA'],
  },
  {
    id: 'crypto',
    name: 'Cripto & Macro',
    symbols: ['BTC-USD', 'ETH-USD', 'SOL-USD', 'USDBRL=X', 'EURUSD=X'],
  },
];

const DEFAULT_PORTFOLIO: PortfolioPosition[] = [
  {
    id: 'pos-1',
    symbol: 'NVDA',
    shares: 40,
    buyPrice: 110.20,
    buyDate: '2026-05-15',
    notes: 'Posição central em hardware de IA',
  },
  {
    id: 'pos-2',
    symbol: 'AAPL',
    shares: 25,
    buyPrice: 205.50,
    buyDate: '2026-04-10',
    notes: 'Recompra constante de ações e ecossistema',
  },
  {
    id: 'pos-3',
    symbol: 'PETR4.SA',
    shares: 300,
    buyPrice: 34.20,
    buyDate: '2026-03-22',
    notes: 'Dividendos elevados em Reais',
  },
  {
    id: 'pos-4',
    symbol: 'BTC-USD',
    shares: 0.35,
    buyPrice: 58200.0,
    buyDate: '2026-06-01',
    notes: 'Reserva digital de valor',
  },
];

const DEFAULT_ALERTS: PriceAlert[] = [
  {
    id: 'alt-1',
    symbol: 'NVDA',
    targetPrice: 135.0,
    condition: 'ABOVE',
    createdAt: new Date().toISOString(),
    active: true,
  },
  {
    id: 'alt-2',
    symbol: 'BTC-USD',
    targetPrice: 65000.0,
    condition: 'ABOVE',
    createdAt: new Date().toISOString(),
    active: true,
  },
  {
    id: 'alt-3',
    symbol: 'PETR4.SA',
    targetPrice: 36.0,
    condition: 'BELOW',
    createdAt: new Date().toISOString(),
    active: true,
  },
];

export interface AppSettings {
  currency: 'USD' | 'BRL' | 'EUR';
  theme: 'dark' | 'light';
  chartType: 'candlestick' | 'line' | 'area';
  defaultTimeframe: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  currency: 'USD',
  theme: 'dark',
  chartType: 'candlestick',
  defaultTimeframe: '1y',
};

export const StorageService = {
  getWatchlists(): WatchlistCategory[] {
    try {
      const data = localStorage.getItem(WATCHLIST_KEY);
      return data ? JSON.parse(data) : DEFAULT_WATCHLISTS;
    } catch {
      return DEFAULT_WATCHLISTS;
    }
  },

  saveWatchlists(lists: WatchlistCategory[]): void {
    try {
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(lists));
    } catch {
      // ignore
    }
  },

  addSymbolToWatchlist(listId: string, symbol: string): WatchlistCategory[] {
    const lists = this.getWatchlists();
    const cleanSym = symbol.trim().toUpperCase();
    const target = lists.find((l) => l.id === listId) || lists[0];
    if (target && !target.symbols.includes(cleanSym)) {
      target.symbols.push(cleanSym);
      this.saveWatchlists(lists);
    }
    return lists;
  },

  removeSymbolFromWatchlist(listId: string, symbol: string): WatchlistCategory[] {
    const lists = this.getWatchlists();
    const cleanSym = symbol.trim().toUpperCase();
    const target = lists.find((l) => l.id === listId);
    if (target) {
      target.symbols = target.symbols.filter((s) => s !== cleanSym);
      this.saveWatchlists(lists);
    }
    return lists;
  },

  getPortfolios(): PortfolioPosition[] {
    try {
      const data = localStorage.getItem(PORTFOLIO_KEY);
      return data ? JSON.parse(data) : DEFAULT_PORTFOLIO;
    } catch {
      return DEFAULT_PORTFOLIO;
    }
  },

  savePortfolios(positions: PortfolioPosition[]): void {
    try {
      localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(positions));
    } catch {
      // ignore
    }
  },

  addPortfolioPosition(pos: Omit<PortfolioPosition, 'id'>): PortfolioPosition[] {
    const positions = this.getPortfolios();
    const newPos: PortfolioPosition = {
      ...pos,
      id: `pos-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      symbol: pos.symbol.trim().toUpperCase(),
    };
    positions.push(newPos);
    this.savePortfolios(positions);
    return positions;
  },

  removePortfolioPosition(id: string): PortfolioPosition[] {
    const positions = this.getPortfolios().filter((p) => p.id !== id);
    this.savePortfolios(positions);
    return positions;
  },

  getAlerts(): PriceAlert[] {
    try {
      const data = localStorage.getItem(ALERTS_KEY);
      return data ? JSON.parse(data) : DEFAULT_ALERTS;
    } catch {
      return DEFAULT_ALERTS;
    }
  },

  saveAlerts(alerts: PriceAlert[]): void {
    try {
      localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
    } catch {
      // ignore
    }
  },

  addAlert(alert: Omit<PriceAlert, 'id' | 'createdAt' | 'active'>): PriceAlert[] {
    const alerts = this.getAlerts();
    const newAlert: PriceAlert = {
      ...alert,
      id: `alt-${Date.now()}`,
      symbol: alert.symbol.trim().toUpperCase(),
      createdAt: new Date().toISOString(),
      active: true,
    };
    alerts.push(newAlert);
    this.saveAlerts(alerts);
    return alerts;
  },

  deleteAlert(id: string): PriceAlert[] {
    const alerts = this.getAlerts().filter((a) => a.id !== id);
    this.saveAlerts(alerts);
    return alerts;
  },

  getRecentSearches(): string[] {
    try {
      const data = localStorage.getItem(RECENT_SEARCHES_KEY);
      return data ? JSON.parse(data) : ['NVDA', 'PETR4.SA', 'BTC-USD', 'AAPL', 'VALE3.SA'];
    } catch {
      return ['NVDA', 'PETR4.SA', 'BTC-USD', 'AAPL'];
    }
  },

  addRecentSearch(symbol: string): void {
    try {
      const clean = symbol.trim().toUpperCase();
      let list = this.getRecentSearches().filter((s) => s !== clean);
      list.unshift(clean);
      if (list.length > 10) list = list.slice(0, 10);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  },

  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: Partial<AppSettings>): AppSettings {
    try {
      const current = this.getSettings();
      const updated = { ...current, ...settings };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      return updated;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },
};

/**
 * Format currency amounts with proper symbols
 */
export function formatCurrency(
  value: number | undefined,
  currency: string = 'USD',
  compact: boolean = false
): string {
  if (value === undefined || isNaN(value)) return 'N/A';

  let currCode = currency || 'USD';
  if (currCode === 'BRL') currCode = 'BRL';
  else if (currCode === 'EUR') currCode = 'EUR';
  else currCode = 'USD';

  if (compact && Math.abs(value) >= 1_000_000_000_000) {
    return `${(value / 1_000_000_000_000).toFixed(2)}T ${currCode}`;
  }
  if (compact && Math.abs(value) >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B ${currCode}`;
  }
  if (compact && Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M ${currCode}`;
  }

  const fractionDigits = Math.abs(value) < 1 ? 4 : 2;
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currCode,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(value);
  } catch {
    return `${currCode} ${value.toFixed(2)}`;
  }
}

/**
 * Format numbers with compact notation
 */
export function formatNumber(num: number | undefined, compact: boolean = false): string {
  if (num === undefined || isNaN(num)) return 'N/A';
  if (compact) {
    if (Math.abs(num) >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
    if (Math.abs(num) >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
    if (Math.abs(num) >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat('pt-BR').format(num);
}
