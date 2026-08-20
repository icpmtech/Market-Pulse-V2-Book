import React, { useState, useEffect, useRef } from 'react';
import { TickerSearchResult } from '../types/finance';
import { search_tickers } from '../services/yahooFinanceService';
import { StorageService } from '../services/storageService';
import {
  Search,
  X,
  TrendingUp,
  Clock,
  Sparkles,
  Flame,
  ArrowRight,
} from 'lucide-react';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTicker: (sym: string) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTicker,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TickerSearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setRecentSearches(StorageService.getRecentSearches());
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const res = await search_tickers(query);
      setResults(res);
    }, 150);
    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (sym: string) => {
    StorageService.addRecentSearch(sym);
    onSelectTicker(sym);
    onClose();
    setQuery('');
  };

  const trendingPicks = [
    { sym: 'NVDA', name: 'NVIDIA Corp', category: 'Tech & IA' },
    { sym: 'AAPL', name: 'Apple Inc', category: 'Tech' },
    { sym: 'PETR4.SA', name: 'Petrobras', category: 'B3 Brasil' },
    { sym: 'BTC-USD', name: 'Bitcoin', category: 'Cripto' },
    { sym: 'VALE3.SA', name: 'Vale S.A.', category: 'B3 Brasil' },
    { sym: 'SPY', name: 'S&P 500 ETF', category: 'ETF' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Search input header */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-sky-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar ticker, empresa ou ativo (ex: NVDA, PETR4.SA, BTC-USD, SPY)..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-hidden font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-500 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block bg-slate-950 border border-slate-800 text-[10px] text-slate-400 font-mono px-2 py-0.5 rounded">
            ESC
          </kbd>
        </div>

        {/* Results or Suggestions */}
        <div className="p-4 max-h-[65vh] overflow-y-auto space-y-4">
          {query.trim() ? (
            <div className="space-y-1">
              <div className="text-[10px] font-mono uppercase text-slate-500 px-2 mb-1">
                Resultados Encontrados ({results.length})
              </div>
              {results.length > 0 ? (
                results.map((item) => (
                  <div
                    key={item.symbol}
                    onClick={() => handleSelect(item.symbol)}
                    className="p-3 rounded-xl hover:bg-slate-800/80 cursor-pointer flex items-center justify-between transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center font-mono font-bold text-sky-400 text-xs group-hover:border-sky-500/50">
                        {item.symbol.slice(0, 3)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white text-sm">{item.symbol}</span>
                          <span className="text-[10px] bg-slate-950 px-1.5 py-0.5 rounded text-slate-400 border border-slate-800">
                            {item.exchDisp}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 truncate max-w-sm">{item.name}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-sky-400 transition transform group-hover:translate-x-1" />
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs">
                  Nenhum ticker encontrado. Pressione Enter para carregar ticker <span className="font-mono text-white font-bold">{query.toUpperCase()}</span>.
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-slate-500 px-2 mb-2">
                    <Clock className="w-3 h-3" /> Pesquisas Recentes
                  </div>
                  <div className="flex flex-wrap gap-2 px-2">
                    {recentSearches.map((sym) => (
                      <button
                        key={sym}
                        onClick={() => handleSelect(sym)}
                        className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-mono px-3 py-1.5 rounded-lg transition"
                      >
                        <span>{sym}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Tickers */}
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-slate-500 px-2 mb-2">
                  <Flame className="w-3 h-3 text-amber-400" /> Tickers em Destaque
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {trendingPicks.map((pick) => (
                    <div
                      key={pick.sym}
                      onClick={() => handleSelect(pick.sym)}
                      className="p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 cursor-pointer flex items-center justify-between transition group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-white text-xs">{pick.sym}</span>
                        <span className="text-[11px] text-slate-400">{pick.name}</span>
                      </div>
                      <span className="text-[10px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">
                        {pick.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
