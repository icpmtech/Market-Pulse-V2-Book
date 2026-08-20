import React, { useState, useEffect } from 'react';
import { PortfolioPosition, StockQuote } from '../types/finance';
import { StorageService, formatCurrency } from '../services/storageService';
import { get_stock_quote } from '../services/yahooFinanceService';
import {
  Briefcase,
  Plus,
  Trash2,
  TrendingUp,
  DollarSign,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
} from 'lucide-react';

interface PortfolioTrackerProps {
  onSelectSymbol: (sym: string) => void;
}

export const PortfolioTracker: React.FC<PortfolioTrackerProps> = ({ onSelectSymbol }) => {
  const [positions, setPositions] = useState<PortfolioPosition[]>([]);
  const [quotesMap, setQuotesMap] = useState<Record<string, StockQuote>>({});
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [newSymbol, setNewSymbol] = useState('');
  const [newShares, setNewShares] = useState('');
  const [newBuyPrice, setNewBuyPrice] = useState('');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    const loaded = StorageService.getPortfolios();
    setPositions(loaded);
  }, []);

  useEffect(() => {
    if (positions.length === 0) return;
    const fetchQuotes = async () => {
      const map: Record<string, StockQuote> = {};
      for (const pos of positions) {
        try {
          const q = await get_stock_quote(pos.symbol);
          map[pos.symbol] = q;
        } catch {
          // ignore
        }
      }
      setQuotesMap((prev) => ({ ...prev, ...map }));
    };
    fetchQuotes();
  }, [positions]);

  const handleAddPosition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol || !newShares || !newBuyPrice) return;

    const updated = StorageService.addPortfolioPosition({
      symbol: newSymbol.toUpperCase(),
      shares: parseFloat(newShares),
      buyPrice: parseFloat(newBuyPrice),
      buyDate: new Date().toISOString().split('T')[0],
      notes: newNotes,
    });

    setPositions([...updated]);
    setNewSymbol('');
    setNewShares('');
    setNewBuyPrice('');
    setNewNotes('');
    setShowAddModal(false);
  };

  const handleRemovePosition = (id: string) => {
    const updated = StorageService.removePortfolioPosition(id);
    setPositions([...updated]);
  };

  // Calculations
  let totalCost = 0;
  let totalCurrentValue = 0;
  let estimatedAnnualDividends = 0;

  positions.forEach((pos) => {
    const q = quotesMap[pos.symbol];
    const curPrice = q?.regularMarketPrice ?? pos.buyPrice;
    const cost = pos.shares * pos.buyPrice;
    const currentVal = pos.shares * curPrice;
    totalCost += cost;
    totalCurrentValue += currentVal;

    if (q?.dividendYield) {
      estimatedAnnualDividends += currentVal * q.dividendYield;
    }
  });

  const totalGain = totalCurrentValue - totalCost;
  const totalGainPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Top Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="geometric-card p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Patrimônio Total</span>
            <Wallet className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white mt-1">
            {formatCurrency(totalCurrentValue, 'USD')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Custo Investido: {formatCurrency(totalCost, 'USD')}
          </div>
        </div>

        <div className="geometric-card p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Retorno Total (P&L)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div
            className={`text-2xl font-black font-mono mt-1 ${
              totalGain >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {totalGain >= 0 ? '+' : ''}{formatCurrency(totalGain, 'USD')}
          </div>
          <div className="text-[11px] font-mono mt-1">
            <span
              className={`font-bold ${
                totalGainPct >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {totalGainPct >= 0 ? '+' : ''}{totalGainPct.toFixed(2)}%
            </span>{' '}
            desde a compra
          </div>
        </div>

        <div className="geometric-card p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Projeção de Dividendos</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-400 mt-1">
            {formatCurrency(estimatedAnnualDividends, 'USD')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Yield Médio da Carteira: ~{(totalCurrentValue > 0 ? (estimatedAnnualDividends / totalCurrentValue) * 100 : 0).toFixed(2)}% a.a.
          </div>
        </div>

        <div className="geometric-card p-5 rounded-2xl shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Posições Ativas</span>
            <Briefcase className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white mt-1">
            {positions.length} Tickers
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-1.5 rounded-xl shadow-md shadow-blue-500/20 transition mt-2"
          >
            <Plus className="w-3.5 h-3.5" /> Nova Posição
          </button>
        </div>
      </div>

      {/* Add Position Form Modal */}
      {showAddModal && (
        <div className="geometric-card p-5 rounded-2xl shadow-2xl">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-400" /> Adicionar Posição na Carteira
          </h3>
          <form onSubmit={handleAddPosition} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Ticker / Símbolo:</label>
              <input
                type="text"
                required
                placeholder="ex: NVDA"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono uppercase focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Quantidade de Ações / Cotas:</label>
              <input
                type="number"
                step="any"
                required
                placeholder="ex: 50"
                value={newShares}
                onChange={(e) => setNewShares(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Preço Médio de Compra ($):</label>
              <input
                type="number"
                step="any"
                required
                placeholder="ex: 115.50"
                value={newBuyPrice}
                onChange={(e) => setNewBuyPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Notas / Tese de Investimento:</label>
              <input
                type="text"
                placeholder="ex: Hardware IA longo prazo"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-hidden"
              />
            </div>
            <div className="md:col-span-4 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 bg-blue-600 text-white font-semibold text-xs rounded-lg hover:bg-blue-500 shadow-md shadow-blue-500/20"
              >
                Salvar Posição
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Positions Table */}
      <div className="geometric-card rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Detalhamento dos Ativos</h3>
          <span className="text-xs text-slate-400 font-mono">
            Valor de Fechamento Atualizado via Yahoo Finance
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">Ativo</th>
                <th className="py-3 px-4">Qtd.</th>
                <th className="py-3 px-4">Preço Médio</th>
                <th className="py-3 px-4">Preço Atual</th>
                <th className="py-3 px-4">Valor Total</th>
                <th className="py-3 px-4">Lucro / Prejuízo</th>
                <th className="py-3 px-4">Peso</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium">
              {positions.map((pos) => {
                const q = quotesMap[pos.symbol];
                const curPrice = q?.regularMarketPrice ?? pos.buyPrice;
                const totalVal = pos.shares * curPrice;
                const cost = pos.shares * pos.buyPrice;
                const gain = totalVal - cost;
                const gainPct = cost > 0 ? (gain / cost) * 100 : 0;
                const weightPct = totalCurrentValue > 0 ? (totalVal / totalCurrentValue) * 100 : 0;

                return (
                  <tr
                    key={pos.id}
                    className="hover:bg-slate-800/50 transition cursor-pointer"
                    onClick={() => onSelectSymbol(pos.symbol)}
                  >
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-white text-sm">{pos.symbol}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                        {q?.shortName || pos.notes || 'Ação'}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-200">{pos.shares}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">${pos.buyPrice.toFixed(2)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-white">${curPrice.toFixed(2)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-white">${totalVal.toFixed(2)}</td>
                    <td className="py-3 px-4 font-mono">
                      <div
                        className={`flex items-center gap-1 font-bold ${
                          gain >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {gain >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {gain >= 0 ? '+' : ''}${gain.toFixed(2)} ({gainPct >= 0 ? '+' : ''}{gainPct.toFixed(2)}%)
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {weightPct.toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleRemovePosition(pos.id)}
                        className="text-slate-600 hover:text-rose-400 p-1 rounded transition"
                        title="Remover posição"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
