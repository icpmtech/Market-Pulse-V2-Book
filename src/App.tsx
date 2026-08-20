import React, { useState, useEffect, useCallback } from 'react';
import {
  StockQuote,
  PriceHistoryItem,
  AnalystInsights,
  TechnicalIndicators,
  FundamentalMetrics,
} from './types/finance';
import {
  executeFunction,
} from './services/agenticExecutor';
import { computeTechnicalIndicators } from './services/technicalAnalysis';
import { computeFundamentalMetrics } from './services/fundamentalAnalysis';
import { StorageService } from './services/storageService';

// UI Components
import { Navbar } from './components/Navbar';
import { TickerHeader } from './components/TickerHeader';
import { StockChart } from './components/StockChart';
import { TechnicalAnalysisTab } from './components/TechnicalAnalysisTab';
import { FundamentalAnalysisTab } from './components/FundamentalAnalysisTab';
import { AnalystInsightsTab } from './components/AnalystInsightsTab';
import { WatchlistManager } from './components/WatchlistManager';
import { PortfolioTracker } from './components/PortfolioTracker';
import { QuickSearchModal } from './components/QuickSearchModal';
import { SkillsApiConsole } from './components/SkillsApiConsole';
import { TickerComparisonModal } from './components/TickerComparisonModal';
import { PriceAlertsModal } from './components/PriceAlertsModal';
import { FeaturesDocModal } from './components/FeaturesDocModal';
import { GmailShareModal } from './components/GmailShareModal';
import { MobileBottomNav } from './components/MobileBottomNav';

import {
  LineChart,
  Activity,
  BarChart3,
  Users,
  Star,
  Briefcase,
  Layers,
  Terminal,
  FileText,
} from 'lucide-react';

export default function App() {
  const [currentSymbol, setCurrentSymbol] = useState<string>('NVDA');
  const [activeTab, setActiveTab] = useState<
    'chart' | 'technical' | 'fundamental' | 'analysts' | 'watchlist' | 'portfolio'
  >('chart');

  const [period, setPeriod] = useState<string>('1y');
  const [interval, setInterval] = useState<string>('1d');
  const [currency, setCurrency] = useState<'USD' | 'BRL' | 'EUR'>('USD');

  // Core Data States
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [history, setHistory] = useState<PriceHistoryItem[]>([]);
  const [insights, setInsights] = useState<AnalystInsights | null>(null);
  const [indicators, setIndicators] = useState<TechnicalIndicators | null>(null);
  const [fundamentalMetrics, setFundamentalMetrics] = useState<FundamentalMetrics | null>(null);

  // Loading & Refresh State
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal Open States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const [isGmailShareOpen, setIsGmailShareOpen] = useState(false);

  // Load ticker data via executeFunction wrapper with Parallel Promise.all execution, TTL caching & graceful error recovery
  const loadTickerData = useCallback(
    async (sym: string, p: string = period, i: string = interval) => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        // Parallel Function Calling: Execute independent requests simultaneously using Promise.all
        const [quoteRes, historyRes, insightsRes] = await Promise.all([
          executeFunction('get_stock_quote', { symbol: sym }),
          executeFunction('get_price_history', { symbol: sym, range: p, interval: i }),
          executeFunction('get_analyst_insights', { symbol: sym }),
        ]);

        if (!quoteRes.success || !quoteRes.data) {
          setErrorMsg(quoteRes.error || `Símbolo '${sym}' não encontrado no Yahoo Finance.`);
          return;
        }

        const quoteData = quoteRes.data;
        const historyData = historyRes.data || [];
        const insightsData = insightsRes.data || null;

        setQuote(quoteData);
        setHistory(historyData);
        setInsights(insightsData);

        // Compute technical indicators from history
        if (historyData.length > 5) {
          const tech = computeTechnicalIndicators(historyData);
          setIndicators(tech);
        }

        // Compute fundamental analysis
        if (quoteData) {
          const fund = computeFundamentalMetrics(quoteData, insightsData);
          setFundamentalMetrics(fund);
        }
      } catch (err: any) {
        // Fallback error capture
        setErrorMsg('Erro de conexão ao carregar os dados deste ticker.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [period, interval]
  );

  // Initial Load & Symbol changes
  useEffect(() => {
    loadTickerData(currentSymbol, period, interval);
  }, [currentSymbol, period, interval, loadTickerData]);

  // Global Keyboard Shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectTicker = (sym: string) => {
    setCurrentSymbol(sym.trim().toUpperCase());
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadTickerData(currentSymbol, period, interval);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white bg-grid-pattern relative">
      {/* Subtle ambient lighting for Geometric Balance */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Top Navigation & Global Markets */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSkillsConsole={() => setIsSkillsOpen(true)}
        onOpenFeaturesDoc={() => setIsFeaturesOpen(true)}
        onOpenGmailShare={() => setIsGmailShareOpen(true)}
        onSelectTicker={handleSelectTicker}
        activeTab={activeTab}
        onSelectTab={(tab: any) => setActiveTab(tab)}
        currency={currency}
        onCurrencyChange={setCurrency}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-20 md:pb-6 space-y-4 sm:space-y-6">
        {/* Error Alert if any */}
        {errorMsg && (
          <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-center justify-between shadow-lg">
            <span>{errorMsg}</span>
            <button
              onClick={() => loadTickerData(currentSymbol)}
              className="bg-rose-600 text-white px-3 py-1 rounded-lg font-semibold hover:bg-rose-500 transition"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Ticker Header Summary */}
        {quote && (
          <TickerHeader
            quote={quote}
            onRefresh={handleRefresh}
            onOpenAlerts={() => setIsAlertsOpen(true)}
            onOpenCompare={() => setIsCompareOpen(true)}
            onOpenPortfolio={() => setActiveTab('portfolio')}
            onOpenGmailShare={() => setIsGmailShareOpen(true)}
            isRefreshing={isRefreshing}
          />
        )}

        {/* Navigation Tabs Bar with Geometric Balance */}
        <div className="flex items-center gap-1.5 border-b border-slate-800/80 overflow-x-auto scrollbar-none pb-0.5">
          <button
            onClick={() => setActiveTab('chart')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all shrink-0 ${
              activeTab === 'chart'
                ? 'bg-slate-900/90 text-sky-400 border-t-2 border-sky-500 border-x border-slate-800 shadow-md shadow-sky-950/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border-t-2 border-transparent'
            }`}
          >
            <LineChart className="w-4 h-4" />
            <span>Gráfico Apache ECharts</span>
          </button>

          <button
            onClick={() => setActiveTab('technical')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all shrink-0 ${
              activeTab === 'technical'
                ? 'bg-slate-900/90 text-emerald-400 border-t-2 border-emerald-500 border-x border-slate-800 shadow-md shadow-emerald-950/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border-t-2 border-transparent'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Análise Técnica</span>
            {indicators && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-mono font-bold">
                {indicators.summary.score}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('fundamental')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all shrink-0 ${
              activeTab === 'fundamental'
                ? 'bg-slate-900/90 text-indigo-400 border-t-2 border-indigo-500 border-x border-slate-800 shadow-md shadow-indigo-950/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border-t-2 border-transparent'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Análise Fundamentalista</span>
          </button>

          <button
            onClick={() => setActiveTab('analysts')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all shrink-0 ${
              activeTab === 'analysts'
                ? 'bg-slate-900/90 text-purple-400 border-t-2 border-purple-500 border-x border-slate-800 shadow-md shadow-purple-950/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border-t-2 border-transparent'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Consenso de Analistas</span>
            {insights && (
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-mono font-bold">
                +{insights.upsidePotentialPercent}%
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('watchlist')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all shrink-0 ${
              activeTab === 'watchlist'
                ? 'bg-slate-900/90 text-amber-400 border-t-2 border-amber-500 border-x border-slate-800 shadow-md shadow-amber-950/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border-t-2 border-transparent'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Watchlists</span>
          </button>

          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all shrink-0 ${
              activeTab === 'portfolio'
                ? 'bg-slate-900/90 text-pink-400 border-t-2 border-pink-500 border-x border-slate-800 shadow-md shadow-pink-950/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border-t-2 border-transparent'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Portfólio Tracker</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="transition-all duration-200">
          {activeTab === 'chart' && quote && (
            <StockChart
              quote={quote}
              history={history}
              indicators={indicators}
              period={period}
              onPeriodChange={setPeriod}
              interval={interval}
              onIntervalChange={setInterval}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'technical' && quote && indicators && (
            <TechnicalAnalysisTab quote={quote} indicators={indicators} />
          )}

          {activeTab === 'fundamental' && quote && fundamentalMetrics && (
            <FundamentalAnalysisTab
              quote={quote}
              metrics={fundamentalMetrics}
              insights={insights ?? undefined}
            />
          )}

          {activeTab === 'analysts' && quote && insights && (
            <AnalystInsightsTab quote={quote} insights={insights} />
          )}

          {activeTab === 'watchlist' && (
            <WatchlistManager
              currentSymbol={currentSymbol}
              onSelectSymbol={handleSelectTicker}
            />
          )}

          {activeTab === 'portfolio' && (
            <PortfolioTracker onSelectSymbol={handleSelectTicker} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950/90 border-t border-slate-800/80 py-4 mt-8 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>Market Pulse Financial Intelligence • Geometric Balance UI • Yahoo Finance & Apache ECharts</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSkillsOpen(true)}
              className="hover:text-sky-400 transition flex items-center gap-1"
            >
              <Terminal className="w-3.5 h-3.5" /> API Skills
            </button>
            <button
              onClick={() => setIsFeaturesOpen(true)}
              className="hover:text-sky-400 transition flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" /> features.md
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Popovers */}
      <QuickSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTicker={handleSelectTicker}
      />

      {isSkillsOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setIsSkillsOpen(false)}
              className="absolute top-4 right-4 z-10 text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-lg"
            >
              ✕
            </button>
            <SkillsApiConsole initialSymbol={currentSymbol} onSelectSymbol={handleSelectTicker} />
          </div>
        </div>
      )}

      <TickerComparisonModal
        baseSymbol={currentSymbol}
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        onSelectTicker={handleSelectTicker}
      />

      {quote && (
        <PriceAlertsModal
          currentQuote={quote}
          isOpen={isAlertsOpen}
          onClose={() => setIsAlertsOpen(false)}
        />
      )}

      <FeaturesDocModal
        isOpen={isFeaturesOpen}
        onClose={() => setIsFeaturesOpen(false)}
      />

      <GmailShareModal
        isOpen={isGmailShareOpen}
        onClose={() => setIsGmailShareOpen(false)}
        quote={quote}
        insights={insights}
        technical={indicators}
        fundamental={fundamentalMetrics}
      />

      {/* Mobile-First Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab as any)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenGmailShare={() => setIsGmailShareOpen(true)}
      />
    </div>
  );
}
