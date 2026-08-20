import React, { useState, useEffect } from 'react';
import { MarketSummaryItem } from '../types/finance';
import { get_market_indices } from '../services/yahooFinanceService';
import {
  Activity,
  Search,
  Terminal,
  FileText,
  Star,
  Globe,
  Sun,
  Moon,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
} from 'lucide-react';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenSkillsConsole: () => void;
  onOpenFeaturesDoc: () => void;
  onSelectTicker: (sym: string) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  currency: string;
  onCurrencyChange: (c: 'USD' | 'BRL' | 'EUR') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onOpenSkillsConsole,
  onOpenFeaturesDoc,
  onSelectTicker,
  activeTab,
  onSelectTab,
  currency,
  onCurrencyChange,
}) => {
  const [indices, setIndices] = useState<MarketSummaryItem[]>([]);

  useEffect(() => {
    get_market_indices().then(setIndices);
  }, []);

  return (
    <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40">
      {/* Top Real-time Market Ticker Tape */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-1.5 overflow-x-auto whitespace-nowrap scrollbar-none flex items-center gap-6 text-[11px]">
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400 shrink-0 uppercase tracking-wider font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Mercado Global
        </div>

        <div className="flex items-center gap-5">
          {indices.map((idx) => {
            const isUp = idx.changePercent >= 0;
            return (
              <div
                key={idx.symbol}
                onClick={() => onSelectTicker(idx.symbol)}
                className="flex items-center gap-1.5 cursor-pointer hover:text-white transition shrink-0"
              >
                <span className="font-semibold text-slate-300">{idx.name}</span>
                <span className="font-mono text-slate-400">
                  {idx.price >= 1000 ? idx.price.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) : idx.price.toFixed(2)}
                </span>
                <span
                  className={`flex items-center font-mono font-bold text-[10px] ${
                    isUp ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {isUp ? '+' : ''}{idx.changePercent.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main App Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
            <Activity className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white">
                Market<span className="text-sky-400">Pulse</span>
              </span>
              <span className="text-[10px] font-mono bg-blue-500/10 text-sky-300 border border-blue-500/30 px-1.5 py-0.2 rounded font-semibold">
                yFinance v2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Yahoo Finance Skills & Apache ECharts Terminal
            </p>
          </div>
        </div>

        {/* Middle: Spotlight Search Trigger */}
        <div className="flex-1 max-w-md mx-4">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 px-3.5 py-2 rounded-xl text-xs transition shadow-inner group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-sky-400 group-hover:scale-110 transition" />
              <span className="text-slate-400 font-medium">Buscar Tickers, Ações, Cripto...</span>
            </div>
            <kbd className="hidden sm:inline-block bg-slate-950 border border-slate-800 text-[10px] text-slate-400 font-mono px-2 py-0.5 rounded shadow">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Quick Action Modals & Preferences */}
        <div className="flex items-center gap-2">
          {/* Skills Console Button */}
          <button
            onClick={onOpenSkillsConsole}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition"
            title="Abrir Console de Skills yFinance"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Skills Console</span>
          </button>

          {/* Features.md Doc Button */}
          <button
            onClick={onOpenFeaturesDoc}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition"
            title="Ver documentação features.md"
          >
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline">features.md</span>
          </button>

          {/* Currency Switcher */}
          <div className="flex bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-xs font-mono">
            {(['USD', 'BRL', 'EUR'] as const).map((c) => (
              <button
                key={c}
                onClick={() => onCurrencyChange(c)}
                className={`px-2 py-1 rounded-lg transition ${
                  currency === c ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
