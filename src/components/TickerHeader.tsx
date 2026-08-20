import React, { useState } from 'react';
import { StockQuote } from '../types/finance';
import { StorageService, formatCurrency, formatNumber } from '../services/storageService';
import {
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Bell,
  Briefcase,
  GitCompare,
  Download,
  RotateCw,
  Share2,
  Check,
} from 'lucide-react';

interface TickerHeaderProps {
  quote: StockQuote;
  onRefresh: () => void;
  onOpenAlerts: () => void;
  onOpenCompare: () => void;
  onOpenPortfolio: () => void;
  isRefreshing?: boolean;
}

export const TickerHeader: React.FC<TickerHeaderProps> = ({
  quote,
  onRefresh,
  onOpenAlerts,
  onOpenCompare,
  onOpenPortfolio,
  isRefreshing = false,
}) => {
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Check if ticker is in active default watchlist
  React.useEffect(() => {
    const lists = StorageService.getWatchlists();
    const found = lists.some((l) => l.symbols.includes(quote.symbol));
    setIsInWatchlist(found);
  }, [quote.symbol]);

  const handleToggleWatchlist = () => {
    if (isInWatchlist) {
      StorageService.removeSymbolFromWatchlist('favs', quote.symbol);
      setIsInWatchlist(false);
    } else {
      StorageService.addSymbolToWatchlist('favs', quote.symbol);
      setIsInWatchlist(true);
    }
  };

  const isUp = quote.regularMarketChangePercent >= 0;

  // 52-week position calculation
  const week52Range = Math.max(1, quote.fiftyTwoWeekHigh - quote.fiftyTwoWeekLow);
  const week52PosPct = Math.min(
    100,
    Math.max(0, ((quote.regularMarketPrice - quote.fiftyTwoWeekLow) / week52Range) * 100)
  );

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(quote, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${quote.symbol}_quote_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="geometric-card rounded-2xl p-5 shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left: Ticker Identification & Price */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
              {quote.symbol}
            </h1>
            <span className="text-xs bg-slate-950/80 text-slate-300 border border-slate-700/60 px-2.5 py-1 rounded-lg font-mono font-semibold">
              {quote.exchange}
            </span>
            {quote.sector && (
              <span className="text-xs bg-blue-500/10 text-sky-300 border border-blue-500/30 px-2.5 py-1 rounded-lg font-medium">
                {quote.sector}
              </span>
            )}
            <span className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Mercado Aberto
            </span>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            {quote.longName || quote.shortName}
          </div>

          {/* Large Price and Day Change */}
          <div className="flex flex-wrap items-baseline gap-3 pt-1">
            <div className="text-3xl sm:text-4xl font-mono font-black text-white tracking-tight">
              {formatCurrency(quote.regularMarketPrice, quote.currency)}
            </div>

            <div
              className={`flex items-center gap-1 font-mono font-bold text-sm sm:text-base px-2.5 py-0.5 rounded-xl transition shadow-sm ${
                isUp
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {isUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>{isUp ? '+' : ''}{quote.regularMarketChange.toFixed(2)}</span>
              <span>({isUp ? '+' : ''}{quote.regularMarketChangePercent.toFixed(2)}%)</span>
            </div>

            <span className="text-xs text-slate-500 font-mono">
              Fech. Anterior: ${quote.regularMarketPreviousClose.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Middle: 52-Week Range Bar */}
        <div className="lg:w-72 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/90 space-y-2 shadow-inner">
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>Mín 52S: ${quote.fiftyTwoWeekLow.toFixed(2)}</span>
            <span>Máx 52S: ${quote.fiftyTwoWeekHigh.toFixed(2)}</span>
          </div>
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden relative border border-slate-800">
            <div
              className="absolute top-0 bottom-0 bg-gradient-to-r from-emerald-500 via-sky-400 to-indigo-500 rounded-full transition-all duration-700"
              style={{ width: `${week52PosPct}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>Posição no Ano: <strong className="text-white">{week52PosPct.toFixed(0)}%</strong></span>
            <span>Cap: <strong className="text-white">{formatCurrency(quote.marketCap, quote.currency, true)}</strong></span>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleToggleWatchlist}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
              isInWatchlist
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10'
                : 'bg-slate-950/90 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700'
            }`}
          >
            <Star className={`w-4 h-4 ${isInWatchlist ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>{isInWatchlist ? 'Salvo' : 'Watchlist'}</span>
          </button>

          <button
            onClick={onOpenAlerts}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950/90 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 text-xs font-medium transition"
            title="Definir Alerta de Preço"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Alertas</span>
          </button>

          <button
            onClick={onOpenCompare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950/90 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 text-xs font-medium transition"
            title="Comparar Tickers"
          >
            <GitCompare className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">Comparar</span>
          </button>

          <button
            onClick={handleExportData}
            className="p-2 rounded-xl bg-slate-950/90 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition"
            title="Exportar JSON da Cotação"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-slate-950/90 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition disabled:opacity-50"
            title="Atualizar Cotação"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
