import React, { useState, useEffect } from 'react';
import { WatchlistCategory, StockQuote } from '../types/finance';
import { StorageService, formatCurrency } from '../services/storageService';
import { get_stock_quote } from '../services/yahooFinanceService';
import {
  ListPlus,
  Trash2,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Layers,
  ChevronRight,
  TrendingUp,
  FolderPlus,
} from 'lucide-react';

interface WatchlistManagerProps {
  currentSymbol: string;
  onSelectSymbol: (sym: string) => void;
}

export const WatchlistManager: React.FC<WatchlistManagerProps> = ({
  currentSymbol,
  onSelectSymbol,
}) => {
  const [watchlists, setWatchlists] = useState<WatchlistCategory[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('favs');
  const [quotesMap, setQuotesMap] = useState<Record<string, StockQuote>>({});
  const [newTickerInput, setNewTickerInput] = useState('');
  const [newListName, setNewListName] = useState('');
  const [showCreateList, setShowCreateList] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loaded = StorageService.getWatchlists();
    setWatchlists(loaded);
    if (loaded.length > 0 && !selectedListId) {
      setSelectedListId(loaded[0].id);
    }
  }, []);

  const currentList = watchlists.find((l) => l.id === selectedListId) || watchlists[0];

  // Fetch quotes for items in current list
  useEffect(() => {
    if (!currentList || currentList.symbols.length === 0) return;

    let isMounted = true;
    const fetchQuotes = async () => {
      setIsLoading(true);
      const results: Record<string, StockQuote> = {};
      for (const sym of currentList.symbols) {
        try {
          const q = await get_stock_quote(sym);
          results[sym] = q;
        } catch {
          // ignore
        }
      }
      if (isMounted) {
        setQuotesMap((prev) => ({ ...prev, ...results }));
        setIsLoading(false);
      }
    };

    fetchQuotes();
    return () => {
      isMounted = false;
    };
  }, [selectedListId, watchlists]);

  const handleAddSymbol = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTickerInput.trim()) return;
    const updated = StorageService.addSymbolToWatchlist(currentList.id, newTickerInput);
    setWatchlists([...updated]);
    setNewTickerInput('');
  };

  const handleRemoveSymbol = (sym: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = StorageService.removeSymbolFromWatchlist(currentList.id, sym);
    setWatchlists([...updated]);
  };

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    const newList: WatchlistCategory = {
      id: `list-${Date.now()}`,
      name: newListName.trim(),
      symbols: ['NVDA', 'AAPL'],
    };
    const updated = [...watchlists, newList];
    StorageService.saveWatchlists(updated);
    setWatchlists(updated);
    setSelectedListId(newList.id);
    setNewListName('');
    setShowCreateList(false);
  };

  const handleDeleteList = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (watchlists.length <= 1) return;
    const updated = watchlists.filter((l) => l.id !== id);
    StorageService.saveWatchlists(updated);
    setWatchlists(updated);
    setSelectedListId(updated[0].id);
  };

  return (
    <div className="space-y-6">
      {/* Category Pills & Add Category */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {watchlists.map((list) => (
            <button
              key={list.id}
              onClick={() => setSelectedListId(list.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                selectedListId === list.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${selectedListId === list.id ? 'fill-white' : ''}`} />
              <span>{list.name}</span>
              <span className="bg-black/30 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
                {list.symbols.length}
              </span>
              {watchlists.length > 1 && selectedListId === list.id && (
                <span
                  onClick={(e) => handleDeleteList(list.id, e)}
                  className="hover:text-rose-300 ml-1"
                  title="Excluir lista"
                >
                  &times;
                </span>
              )}
            </button>
          ))}

          <button
            onClick={() => setShowCreateList(!showCreateList)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900 border border-dashed border-slate-700 text-slate-400 hover:text-white transition"
          >
            <Plus className="w-3.5 h-3.5" /> Nova Lista
          </button>
        </div>

        {/* Add Ticker Form */}
        <form onSubmit={handleAddSymbol} className="flex items-center gap-2">
          <input
            type="text"
            value={newTickerInput}
            onChange={(e) => setNewTickerInput(e.target.value.toUpperCase())}
            placeholder="+ Adicionar Ticker (ex: MSFT)"
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono uppercase focus:outline-hidden focus:border-blue-500 w-44"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
          >
            Adicionar
          </button>
        </form>
      </div>

      {/* Modal / inline creation for new list */}
      {showCreateList && (
        <form
          onSubmit={handleCreateList}
          className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center gap-3 animate-in fade-in"
        >
          <FolderPlus className="w-5 h-5 text-sky-400" />
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="Nome da Nova Watchlist (ex: Ações de Inteligência Artificial)"
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-hidden"
          />
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition"
          >
            Criar
          </button>
          <button
            type="button"
            onClick={() => setShowCreateList(false)}
            className="text-xs text-slate-400 hover:text-white px-2"
          >
            Cancelar
          </button>
        </form>
      )}

      {/* Tickers Grid in Selected List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentList?.symbols.map((sym) => {
          const q = quotesMap[sym];
          const isSelected = currentSymbol.toUpperCase() === sym.toUpperCase();
          const isPositive = (q?.regularMarketChangePercent ?? 0) >= 0;

          return (
            <div
              key={sym}
              onClick={() => onSelectSymbol(sym)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-950/40 border-blue-500 ring-1 ring-blue-500/40 shadow-xl'
                  : 'geometric-card hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-base text-white">{sym}</span>
                    <span className="text-[10px] text-slate-400 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800">
                      {q?.exchange || 'MARKET'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 truncate max-w-[180px] mt-0.5">
                    {q?.shortName || q?.longName || 'Carregando...'}
                  </div>
                </div>

                <button
                  onClick={(e) => handleRemoveSymbol(sym, e)}
                  className="text-slate-600 hover:text-rose-400 p-1 rounded transition opacity-0 group-hover:opacity-100"
                  title="Remover da watchlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Price & Change info */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-end justify-between">
                <div>
                  <div className="text-lg font-mono font-bold text-white">
                    {q ? formatCurrency(q.regularMarketPrice, q.currency) : '...'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    52S: ${q?.fiftyTwoWeekLow?.toFixed(1)} - ${q?.fiftyTwoWeekHigh?.toFixed(1)}
                  </div>
                </div>

                <div className="text-right">
                  {q ? (
                    <span
                      className={`inline-flex items-center gap-0.5 font-mono font-bold text-xs px-2 py-0.5 rounded ${
                        isPositive
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {isPositive ? '+' : ''}{q.regularMarketChangePercent?.toFixed(2)}%
                    </span>
                  ) : (
                    <div className="w-12 h-4 bg-slate-800 animate-pulse rounded"></div>
                  )}
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Vol: {q ? (q.regularMarketVolume / 1000000).toFixed(1) + 'M' : '...'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
