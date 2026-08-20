import React, { useState, useMemo, useRef, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import type { ECharts } from 'echarts';
import {
  PriceHistoryItem,
  TechnicalIndicators,
  StockQuote,
} from '../types/finance';
import {
  TrendingUp,
  Maximize2,
  Minimize2,
  Camera,
  Layers,
  Activity,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface StockChartProps {
  quote: StockQuote;
  history: PriceHistoryItem[];
  indicators?: TechnicalIndicators | null;
  period: string;
  onPeriodChange: (p: string) => void;
  interval: string;
  onIntervalChange: (i: string) => void;
  isLoading?: boolean;
}

export const StockChart: React.FC<StockChartProps> = ({
  quote,
  history,
  indicators,
  period,
  onPeriodChange,
  interval,
  onIntervalChange,
  isLoading = false,
}) => {
  const chartRef = useRef<ReactECharts>(null);
  const [chartType, setChartType] = useState<'candlestick' | 'line' | 'area'>('candlestick');
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(true);
  const [showSMA200, setShowSMA200] = useState(false);
  const [showBollinger, setShowBollinger] = useState(false);
  const [bottomOscillator, setBottomOscillator] = useState<'rsi' | 'macd' | 'none'>('rsi');
  const [isLogScale, setIsLogScale] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Resize on fullscreen change or window resize
  useEffect(() => {
    const handleResize = () => {
      chartRef.current?.getEchartsInstance().resize();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const periods = [
    { label: '1D', value: '1d' },
    { label: '5D', value: '5d' },
    { label: '1M', value: '1mo' },
    { label: '6M', value: '6mo' },
    { label: '1A', value: '1y' },
    { label: '5A', value: '5y' },
    { label: 'MÁX', value: 'max' },
  ];

  const chartOption = useMemo(() => {
    if (!history || history.length === 0) {
      return {};
    }

    const dates = history.map((item) => item.date);
    // ECharts Candlestick format: [Open, Close, Lowest, Highest]
    const candleData = history.map((item) => [item.open, item.close, item.low, item.high]);
    const closePrices = history.map((item) => item.close);
    const volumes = history.map((item) => item.volume);

    const hasOscillator = bottomOscillator !== 'none' && indicators;

    // Grid layout calculations
    const grid = [
      {
        left: '4%',
        right: '4%',
        top: '6%',
        height: hasOscillator ? '50%' : '66%',
      },
      {
        left: '4%',
        right: '4%',
        top: hasOscillator ? '58%' : '74%',
        height: hasOscillator ? '14%' : '18%',
      },
    ];

    if (hasOscillator) {
      grid.push({
        left: '4%',
        right: '4%',
        top: '74%',
        height: '16%',
      });
    }

    const xAxis = [
      {
        type: 'category',
        data: dates,
        gridIndex: 0,
        scale: true,
        boundaryGap: false,
        axisLine: { onZero: false, lineStyle: { color: '#475569' } },
        splitLine: { show: true, lineStyle: { color: '#1e293b', type: 'dashed' } },
        axisLabel: { show: !hasOscillator, color: '#94a3b8', fontSize: 11 },
        min: 'dataMin',
        max: 'dataMax',
      },
      {
        type: 'category',
        gridIndex: 1,
        data: dates,
        scale: true,
        boundaryGap: false,
        axisLine: { onZero: false, lineStyle: { color: '#475569' } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        min: 'dataMin',
        max: 'dataMax',
      },
    ];

    if (hasOscillator) {
      xAxis.push({
        type: 'category',
        gridIndex: 2,
        data: dates,
        scale: true,
        boundaryGap: false,
        axisLine: { onZero: false, lineStyle: { color: '#475569' } },
        splitLine: { show: true, lineStyle: { color: '#1e293b', type: 'dashed' } },
        axisLabel: { color: '#94a3b8', fontSize: 11 },
        min: 'dataMin',
        max: 'dataMax',
      });
    }

    const yAxis = [
      {
        scale: true,
        gridIndex: 0,
        type: isLogScale ? 'log' : 'value',
        splitArea: { show: false },
        splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } },
        axisLabel: {
          color: '#94a3b8',
          fontSize: 11,
          formatter: (val: number) => `${quote.currency === 'BRL' ? 'R$' : '$'}${val >= 100 ? val.toFixed(1) : val.toFixed(2)}`,
        },
      },
      {
        scale: true,
        gridIndex: 1,
        splitNumber: 2,
        axisLabel: {
          show: true,
          color: '#64748b',
          fontSize: 10,
          formatter: (val: number) => (val >= 1000000 ? `${(val / 1000000).toFixed(0)}M` : `${(val / 1000).toFixed(0)}K`),
        },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
      },
    ];

    if (hasOscillator) {
      if (bottomOscillator === 'rsi') {
        yAxis.push({
          scale: true,
          gridIndex: 2,
          min: 0,
          max: 100,
          splitNumber: 2,
          splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } },
          axisLabel: { color: '#94a3b8', fontSize: 10 },
        });
      } else {
        yAxis.push({
          scale: true,
          gridIndex: 2,
          splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } },
          axisLabel: { color: '#94a3b8', fontSize: 10 },
        });
      }
    }

    const series: any[] = [];

    // Main Chart Type
    if (chartType === 'candlestick') {
      series.push({
        name: quote.symbol,
        type: 'candlestick',
        data: candleData,
        xAxisIndex: 0,
        yAxisIndex: 0,
        itemStyle: {
          color: '#10b981', // Up color
          color0: '#ef4444', // Down color
          borderColor: '#059669',
          borderColor0: '#dc2626',
        },
      });
    } else if (chartType === 'line') {
      series.push({
        name: quote.symbol,
        type: 'line',
        data: closePrices,
        xAxisIndex: 0,
        yAxisIndex: 0,
        smooth: 0.1,
        showSymbol: false,
        lineStyle: { width: 2.2, color: '#38bdf8' },
      });
    } else {
      series.push({
        name: quote.symbol,
        type: 'line',
        data: closePrices,
        xAxisIndex: 0,
        yAxisIndex: 0,
        smooth: 0.1,
        showSymbol: false,
        lineStyle: { width: 2, color: '#38bdf8' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(56, 189, 248, 0.45)' },
              { offset: 1, color: 'rgba(56, 189, 248, 0.0)' },
            ],
          },
        },
      });
    }

    // Moving Averages Overlays
    if (showSMA20 && indicators?.sma20) {
      series.push({
        name: 'SMA 20',
        type: 'line',
        data: indicators.sma20,
        xAxisIndex: 0,
        yAxisIndex: 0,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 1.5, color: '#fbbf24' },
      });
    }

    if (showSMA50 && indicators?.sma50) {
      series.push({
        name: 'SMA 50',
        type: 'line',
        data: indicators.sma50,
        xAxisIndex: 0,
        yAxisIndex: 0,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 1.5, color: '#a855f7' },
      });
    }

    if (showSMA200 && indicators?.sma200) {
      series.push({
        name: 'SMA 200',
        type: 'line',
        data: indicators.sma200,
        xAxisIndex: 0,
        yAxisIndex: 0,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 1.8, color: '#f97316' },
      });
    }

    // Bollinger Bands
    if (showBollinger && indicators?.bollingerBands) {
      series.push(
        {
          name: 'BB Superior',
          type: 'line',
          data: indicators.bollingerBands.upper,
          xAxisIndex: 0,
          yAxisIndex: 0,
          showSymbol: false,
          lineStyle: { width: 1, color: '#38bdf8', type: 'dashed' },
        },
        {
          name: 'BB Média',
          type: 'line',
          data: indicators.bollingerBands.middle,
          xAxisIndex: 0,
          yAxisIndex: 0,
          showSymbol: false,
          lineStyle: { width: 1, color: '#94a3b8' },
        },
        {
          name: 'BB Inferior',
          type: 'line',
          data: indicators.bollingerBands.lower,
          xAxisIndex: 0,
          yAxisIndex: 0,
          showSymbol: false,
          lineStyle: { width: 1, color: '#38bdf8', type: 'dashed' },
        }
      );
    }

    // Volume Bar Series
    series.push({
      name: 'Volume',
      type: 'bar',
      xAxisIndex: 1,
      yAxisIndex: 1,
      data: volumes.map((v, idx) => ({
        value: v,
        itemStyle: {
          color:
            idx > 0 && history[idx].close >= history[idx - 1].close
              ? 'rgba(16, 185, 129, 0.65)'
              : 'rgba(239, 68, 68, 0.65)',
        },
      })),
    });

    // Oscillator Sub-chart Series
    if (bottomOscillator === 'rsi' && indicators?.rsi14) {
      series.push({
        name: 'RSI (14)',
        type: 'line',
        xAxisIndex: 2,
        yAxisIndex: 2,
        data: indicators.rsi14,
        showSymbol: false,
        lineStyle: { width: 1.8, color: '#ec4899' },
        markLine: {
          symbol: 'none',
          data: [
            { yAxis: 70, lineStyle: { color: '#ef4444', type: 'dashed' } },
            { yAxis: 30, lineStyle: { color: '#10b981', type: 'dashed' } },
          ],
        },
      });
    } else if (bottomOscillator === 'macd' && indicators?.macd) {
      series.push(
        {
          name: 'MACD',
          type: 'line',
          xAxisIndex: 2,
          yAxisIndex: 2,
          data: indicators.macd.macdLine,
          showSymbol: false,
          lineStyle: { width: 1.5, color: '#38bdf8' },
        },
        {
          name: 'Signal',
          type: 'line',
          xAxisIndex: 2,
          yAxisIndex: 2,
          data: indicators.macd.signalLine,
          showSymbol: false,
          lineStyle: { width: 1.5, color: '#f59e0b' },
        },
        {
          name: 'Histogram',
          type: 'bar',
          xAxisIndex: 2,
          yAxisIndex: 2,
          data: indicators.macd.histogram.map((val) => ({
            value: val,
            itemStyle: {
              color: val >= 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)',
            },
          })),
        }
      );
    }

    return {
      animation: false,
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          lineStyle: { color: '#64748b', width: 1, type: 'dashed' },
        },
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        borderColor: '#334155',
        borderWidth: 1,
        textStyle: { color: '#f8fafc', fontSize: 12 },
        formatter: (params: any[]) => {
          if (!params || params.length === 0) return '';
          const p0 = params[0];
          const date = p0.axisValue;
          let html = `<div class="font-bold text-slate-200 border-b border-slate-700 pb-1 mb-1">${quote.symbol} • ${date}</div>`;

          params.forEach((p) => {
            if (p.seriesName === quote.symbol && Array.isArray(p.value)) {
              // Candlestick: [open, close, low, high]
              const [o, c, l, h] = p.value.slice(1);
              const change = c - o;
              const chgPct = (change / o) * 100;
              const isUp = change >= 0;
              html += `<div class="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
                <span class="text-slate-400">Abertura:</span> <span class="font-mono text-right">$${Number(o).toFixed(2)}</span>
                <span class="text-slate-400">Máxima:</span> <span class="font-mono text-right text-emerald-400">$${Number(h).toFixed(2)}</span>
                <span class="text-slate-400">Mínima:</span> <span class="font-mono text-right text-rose-400">$${Number(l).toFixed(2)}</span>
                <span class="text-slate-400">Fechamento:</span> <span class="font-mono font-bold text-right ${isUp ? 'text-emerald-400' : 'text-rose-400'}">$${Number(c).toFixed(2)} (${isUp ? '+' : ''}${chgPct.toFixed(2)}%)</span>
              </div>`;
            } else if (p.seriesName === 'Volume') {
              const vol = typeof p.value === 'object' ? p.value.value : p.value;
              html += `<div class="text-xs text-slate-300 mt-1 flex justify-between">
                <span>Volume:</span> <span class="font-mono font-semibold">${Number(vol).toLocaleString()}</span>
              </div>`;
            } else if (p.value !== undefined && !isNaN(p.value)) {
              const val = typeof p.value === 'object' ? p.value.value : p.value;
              html += `<div class="text-xs flex justify-between gap-3 text-slate-300">
                <span style="color:${p.color}">${p.seriesName}:</span> <span class="font-mono">${Number(val).toFixed(2)}</span>
              </div>`;
            }
          });
          return html;
        },
      },
      axisPointer: {
        link: [{ xAxisIndex: 'all' }],
        label: { backgroundColor: '#334155' },
      },
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: hasOscillator ? [0, 1, 2] : [0, 1],
          start: history.length > 60 ? 45 : 0,
          end: 100,
        },
        {
          show: true,
          xAxisIndex: hasOscillator ? [0, 1, 2] : [0, 1],
          type: 'slider',
          bottom: '1%',
          height: 18,
          borderColor: '#1e293b',
          backgroundColor: '#0f172a',
          fillerColor: 'rgba(56, 189, 248, 0.15)',
          handleStyle: { color: '#38bdf8' },
          textStyle: { color: '#64748b', fontSize: 10 },
        },
      ],
      grid,
      xAxis,
      yAxis,
      series,
    };
  }, [
    history,
    quote,
    indicators,
    chartType,
    showSMA20,
    showSMA50,
    showSMA200,
    showBollinger,
    bottomOscillator,
    isLogScale,
  ]);

  const handleDownloadSnapshot = () => {
    const instance = chartRef.current?.getEchartsInstance();
    if (instance) {
      const url = instance.getDataURL({
        type: 'png',
        pixelRatio: 2,
        backgroundColor: '#090d16',
      });
      const link = document.createElement('a');
      link.download = `${quote.symbol}_chart_${period}_${Date.now()}.png`;
      link.href = url;
      link.click();
    }
  };

  return (
    <div className={`geometric-card rounded-2xl p-4 shadow-xl flex flex-col ${isFullscreen ? 'fixed inset-4 z-50 bg-[#030712] p-6' : ''}`}>
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-800/80 overflow-x-auto scrollbar-none touch-pan-x">
        {/* Left & Middle: Timeframe pills & Chart controls */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none whitespace-nowrap shrink-0">
          {/* Timeframe pills */}
          <div className="flex items-center bg-slate-950/90 p-1 rounded-xl border border-slate-800/80 shadow-inner shrink-0">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => onPeriodChange(p.value)}
                className={`px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-lg transition-all min-h-[32px] ${
                  period === p.value
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Chart Type Buttons */}
          <div className="flex bg-slate-950/90 p-1 rounded-xl border border-slate-800/80 text-xs shadow-inner shrink-0">
            <button
              onClick={() => setChartType('candlestick')}
              className={`px-2.5 py-1 rounded-lg font-medium transition min-h-[32px] ${
                chartType === 'candlestick' ? 'bg-slate-800 text-emerald-400 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Velas Japonesas (Candlestick)"
            >
              🕯️ Velas
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-2.5 py-1 rounded-lg font-medium transition min-h-[32px] ${
                chartType === 'line' ? 'bg-slate-800 text-sky-400 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Linha Simples"
            >
              📈 Linha
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`px-2.5 py-1 rounded-lg font-medium transition min-h-[32px] ${
                chartType === 'area' ? 'bg-slate-800 text-sky-300 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Área com Gradiente"
            >
              🏔️ Área
            </button>
          </div>

          {/* Indicators Overlays Toggle */}
          <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800/80 text-xs shadow-inner shrink-0">
            <button
              onClick={() => setShowSMA20(!showSMA20)}
              className={`px-2 py-1 rounded-lg font-mono transition min-h-[32px] ${
                showSMA20 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Média Móvel 20 períodos"
            >
              SMA 20
            </button>
            <button
              onClick={() => setShowSMA50(!showSMA50)}
              className={`px-2 py-1 rounded-lg font-mono transition min-h-[32px] ${
                showSMA50 ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Média Móvel 50 períodos"
            >
              SMA 50
            </button>
            <button
              onClick={() => setShowSMA200(!showSMA200)}
              className={`px-2 py-1 rounded-lg font-mono transition min-h-[32px] ${
                showSMA200 ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Média Móvel 200 períodos"
            >
              SMA 200
            </button>
            <button
              onClick={() => setShowBollinger(!showBollinger)}
              className={`px-2 py-1 rounded-lg font-mono transition min-h-[32px] ${
                showBollinger ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Bandas de Bollinger (20, 2σ)"
            >
              Bollinger
            </button>
          </div>

          {/* Sub-oscillator selector */}
          <div className="flex items-center bg-slate-950/90 p-1 rounded-xl border border-slate-800/80 text-xs shadow-inner shrink-0">
            <button
              onClick={() => setBottomOscillator(bottomOscillator === 'rsi' ? 'none' : 'rsi')}
              className={`px-2.5 py-1 rounded-lg font-mono transition min-h-[32px] ${
                bottomOscillator === 'rsi' ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              RSI 14
            </button>
            <button
              onClick={() => setBottomOscillator(bottomOscillator === 'macd' ? 'none' : 'macd')}
              className={`px-2.5 py-1 rounded-lg font-mono transition min-h-[32px] ${
                bottomOscillator === 'macd' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              MACD
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center justify-end gap-1.5 shrink-0">
          <button
            onClick={() => setIsLogScale(!isLogScale)}
            className={`p-1.5 rounded-lg border text-xs font-mono transition min-h-[32px] px-2 ${
              isLogScale ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300' : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Alternar Escala Logarítmica / Linear"
          >
            LOG
          </button>
          <button
            onClick={handleDownloadSnapshot}
            className="p-1.5 bg-slate-950/80 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition min-h-[32px] px-2"
            title="Baixar Imagem PNG do Gráfico"
          >
            <Camera className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 bg-slate-950/80 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition min-h-[32px] px-2"
            title={isFullscreen ? 'Sair de Tela Cheia' : 'Expandir Tela Cheia'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Chart Canvas */}
      <div className={`relative w-full ${isFullscreen ? 'flex-1 min-h-[550px]' : 'h-[440px] md:h-[500px]'}`}>
        {isLoading && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-10">
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-700 px-4 py-2 rounded-xl shadow-xl">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium text-slate-200">Atualizando velas OHLCV...</span>
            </div>
          </div>
        )}

        <ReactECharts
          ref={chartRef}
          option={chartOption}
          style={{ height: '100%', width: '100%' }}
          notMerge={true}
          lazyUpdate={true}
        />
      </div>

      {/* Bottom Chart Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-4 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Apache ECharts v5 Engine</span>
          </span>
          <span>Intervalo: <span className="text-slate-200">{interval.toUpperCase()}</span></span>
          <span>Pontos: <span className="text-slate-200">{history.length} velas</span></span>
        </div>

        <div className="flex items-center gap-3">
          {indicators && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Sinal Técnico:</span>
              <span
                className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                  indicators.summary.overallSignal.includes('BUY')
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : indicators.summary.overallSignal.includes('SELL')
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-slate-700/50 text-slate-300 border border-slate-600'
                }`}
              >
                {indicators.summary.overallSignal.replace('_', ' ')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
