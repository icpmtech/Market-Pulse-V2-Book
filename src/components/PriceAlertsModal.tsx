import React, { useState, useEffect } from 'react';
import { PriceAlert, StockQuote } from '../types/finance';
import { StorageService, formatCurrency } from '../services/storageService';
import {
  Bell,
  Plus,
  Trash2,
  X,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface PriceAlertsModalProps {
  currentQuote: StockQuote;
  isOpen: boolean;
  onClose: () => void;
}

export const PriceAlertsModal: React.FC<PriceAlertsModalProps> = ({
  currentQuote,
  isOpen,
  onClose,
}) => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [targetPrice, setTargetPrice] = useState<string>(
    (currentQuote.regularMarketPrice * 1.05).toFixed(2)
  );
  const [condition, setCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');

  useEffect(() => {
    if (isOpen) {
      setAlerts(StorageService.getAlerts());
      setTargetPrice((currentQuote.regularMarketPrice * (condition === 'ABOVE' ? 1.05 : 0.95)).toFixed(2));
    }
  }, [isOpen, currentQuote]);

  if (!isOpen) return null;

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) return;

    const updated = StorageService.addAlert({
      symbol: currentQuote.symbol,
      targetPrice: price,
      condition,
    });
    setAlerts([...updated]);
  };

  const handleDeleteAlert = (id: string) => {
    const updated = StorageService.deleteAlert(id);
    setAlerts([...updated]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Alertas de Preço</h2>
              <p className="text-xs text-slate-400">
                Receba notificações quando o ticker atingir seu alvo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Create Alert Box */}
          <form onSubmit={handleCreateAlert} className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Novo Alerta para:</span>
              <span className="font-mono font-bold text-sky-400">
                {currentQuote.symbol} (${currentQuote.regularMarketPrice.toFixed(2)})
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Condição:</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-hidden"
                >
                  <option value="ABOVE">Subir Acima De (≥)</option>
                  <option value="BELOW">Cair Abaixo De (≤)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Preço Alvo ($):</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 rounded-lg shadow-md shadow-blue-500/20 transition"
            >
              <Plus className="w-4 h-4" /> Criar Alerta de Preço
            </button>
          </form>

          {/* Active Alerts List */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Alertas Ativos ({alerts.length})
            </h4>

            {alerts.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                Nenhum alerta cadastrado no momento.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {alerts.map((alt) => {
                  const isCurrent = alt.symbol === currentQuote.symbol;
                  const isTriggered =
                    (alt.condition === 'ABOVE' && currentQuote.regularMarketPrice >= alt.targetPrice && isCurrent) ||
                    (alt.condition === 'BELOW' && currentQuote.regularMarketPrice <= alt.targetPrice && isCurrent);

                  return (
                    <div
                      key={alt.id}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                        isTriggered
                          ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-white text-sm">{alt.symbol}</span>
                        <span
                          className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                            alt.condition === 'ABOVE'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {alt.condition === 'ABOVE' ? '≥ ACIMA' : '≤ ABAIXO'}
                        </span>
                        <span className="font-mono font-bold text-white">${alt.targetPrice.toFixed(2)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isTriggered && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-semibold animate-pulse">
                            🚨 Disparado!
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteAlert(alt.id)}
                          className="text-slate-600 hover:text-rose-400 p-1 rounded transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
