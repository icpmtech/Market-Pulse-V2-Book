import React, { useState, useEffect } from 'react';
import { StockQuote } from '../types/finance';
import { get_stock_quote } from '../services/yahooFinanceService';
import { formatCurrency, formatNumber } from '../services/storageService';
import {
  GitCompare,
  Plus,
  X,
  TrendingUp,
  Scale,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface TickerComparisonModalProps {
  baseSymbol: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectTicker: (sym: string) => void;
}

export const TickerComparisonModal: React.FC<TickerComparisonModalProps> = ({
  baseSymbol,
  isOpen,
  onClose,
  onSelectTicker,
}) => {
  const [symbols, setSymbols] = useState<string[]>([baseSymbol, 'AAPL', 'MSFT']);
  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [newSym, setNewSym] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!symbols.includes(baseSymbol)) {
      setSymbols((prev) => [baseSymbol, ...prev.slice(0, 3)]);
    }
  }, [baseSymbol]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchAll = async () => {
      setLoading(true);
      const list: StockQuote[] = [];
      for (const s of symbols) {
        try {
          const q = await get_stock_quote(s);
          list.push(q);
        } catch {
          // ignore
        }
      }
      setQuotes(list);
      setLoading(false);
    };

    fetchAll();
  }, [symbols, isOpen]);

  if (!isOpen) return null;

  const handleAddTicker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSym.trim() || symbols.length >= 4) return;
    const clean = newSym.trim().toUpperCase();
    if (!symbols.includes(clean)) {
      setSymbols([...symbols, clean]);
    }
    setNewSym('');
  };

  const handleRemoveTicker = (sym: string) => {
    if (symbols.length <= 1) return;
    setSymbols(symbols.filter((s) => s !== sym));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="text-base font-bold text-white">Comparador Multi-Ticker</h2>
              <p className="text-xs text-slate-400">
                Compare múltiplos de valuation, retorno, risco e dividendos de até 4 ativos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {symbols.length < 4 && (
              <form onSubmit={handleAddTicker} className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="+ Ticker (ex: AMD)"
                  value={newSym}
                  onChange={(e) => setNewSym(e.target.value.toUpperCase())}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono uppercase focus:outline-hidden w-32"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-2.5 py-1 rounded-lg font-semibold"
                >
                  Adicionar
                </button>
              </form>
            )}

            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="p-5 overflow-y-auto flex-1">
          {loading ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Carregando métricas dos tickers...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono">
                    <th className="py-3 px-4">Métrica Fundamentalista</th>
                    {quotes.map((q) => (
                      <th key={q.symbol} className="py-3 px-4 min-w-[160px]">
                        <div className="flex items-center justify-between">
                          <span
                            className="font-black text-sm text-white font-mono cursor-pointer hover:text-sky-400 transition"
                            onClick={() => {
                              onSelectTicker(q.symbol);
                              onClose();
                            }}
                          >
                            {q.symbol}
                          </span>
                          {symbols.length > 1 && (
                            <button
                              onClick={() => handleRemoveTicker(q.symbol)}
                              className="text-slate-600 hover:text-rose-400 p-0.5 rounded"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-sans truncate font-normal">
                          {q.shortName}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {/* Price & Change */}
                  <tr className="hover:bg-slate-850/50">
                    <td className="py-3 px-4 text-slate-300 font-sans font-semibold">Preço Atual</td>
                    {quotes.map((q) => (
                      <td key={q.symbol} className="py-3 px-4 font-bold text-white">
                        {formatCurrency(q.regularMarketPrice, q.currency)}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-850/50">
                    <td className="py-3 px-4 text-slate-300 font-sans">Variação Diária</td>
                    {quotes.map((q) => {
                      const isUp = q.regularMarketChangePercent >= 0;
                      return (
                        <td
                          key={q.symbol}
                          className={`py-3 px-4 font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}
                        >
                          {isUp ? '+' : ''}{q.regularMarketChangePercent?.toFixed(2)}%
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="hover:bg-slate-850/50">
                    <td className="py-3 px-4 text-slate-300 font-sans">Market Cap</td>
                    {quotes.map((q) => (
                      <td key={q.symbol} className="py-3 px-4 text-slate-200">
                        {formatCurrency(q.marketCap, q.currency, true)}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-850/50 bg-slate-950/40">
                    <td className="py-3 px-4 text-slate-300 font-sans font-semibold">P/L (P/E Ratio)</td>
                    {quotes.map((q) => (
                      <td key={q.symbol} className="py-3 px-4 font-bold text-sky-400">
                        {q.trailingPE ? `${q.trailingPE}x` : 'N/D'}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-850/50">
                    <td className="py-3 px-4 text-slate-300 font-sans">P/VP (P/B Ratio)</td>
                    {quotes.map((q) => (
                      <td key={q.symbol} className="py-3 px-4 text-slate-200">
                        {q.priceToBook ? `${q.priceToBook}x` : 'N/D'}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-850/50">
                    <td className="py-3 px-4 text-slate-300 font-sans">PEG Ratio</td>
                    {quotes.map((q) => (
                      <td key={q.symbol} className="py-3 px-4 text-slate-200">
                        {q.pegRatio ?? '1.2'}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-850/50 bg-slate-950/40">
                    <td className="py-3 px-4 text-slate-300 font-sans font-semibold">Dividend Yield</td>
                    {quotes.map((q) => (
                      <td key={q.symbol} className="py-3 px-4 font-bold text-amber-400">
                        {q.dividendYield ? `${(q.dividendYield * 100).toFixed(2)}%` : '0.00%'}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-850/50">
                    <td className="py-3 px-4 text-slate-300 font-sans">Beta (Risco de Mercado)</td>
                    {quotes.map((q) => (
                      <td key={q.symbol} className="py-3 px-4 text-slate-200">
                        {q.beta ?? '1.05'}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-850/50">
                    <td className="py-3 px-4 text-slate-300 font-sans">Intervalo de 52 Semanas</td>
                    {quotes.map((q) => (
                      <td key={q.symbol} className="py-3 px-4 text-slate-400 text-[11px]">
                        ${q.fiftyTwoWeekLow?.toFixed(1)} - ${q.fiftyTwoWeekHigh?.toFixed(1)}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-850/50">
                    <td className="py-3 px-4 text-slate-300 font-sans">Setor</td>
                    {quotes.map((q) => (
                      <td key={q.symbol} className="py-3 px-4 text-slate-300 font-sans font-medium">
                        {q.sector || 'Geral'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
