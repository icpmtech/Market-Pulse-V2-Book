import { PriceHistoryItem, TechnicalIndicators } from '../types/finance';

/**
 * Calculates Simple Moving Average (SMA)
 */
export function calculateSMA(data: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j];
      }
      result.push(Number((sum / period).toFixed(2)));
    }
  }
  return result;
}

/**
 * Calculates Exponential Moving Average (EMA)
 */
export function calculateEMA(data: number[], period: number): number[] {
  const result: number[] = [];
  const k = 2 / (period + 1);

  let emaPrev = 0;
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else if (i === period - 1) {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[j];
      }
      emaPrev = sum / period;
      result.push(Number(emaPrev.toFixed(2)));
    } else {
      const emaCurrent = data[i] * k + emaPrev * (1 - k);
      emaPrev = emaCurrent;
      result.push(Number(emaCurrent.toFixed(2)));
    }
  }
  return result;
}

/**
 * Calculates Relative Strength Index (RSI 14)
 */
export function calculateRSI(closes: number[], period: number = 14): number[] {
  const rsi: number[] = [];
  if (closes.length < period + 1) {
    return closes.map(() => 50);
  }

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = 0; i < period; i++) {
    rsi.push(NaN);
  }

  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  rsi.push(Number((100 - 100 / (1 + rs)).toFixed(2)));

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const val = 100 - 100 / (1 + rs);
    rsi.push(Number(val.toFixed(2)));
  }

  return rsi;
}

/**
 * Calculates MACD (12, 26, 9)
 */
export function calculateMACD(
  closes: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
) {
  const emaFast = calculateEMA(closes, fastPeriod);
  const emaSlow = calculateEMA(closes, slowPeriod);
  const macdLine: number[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (isNaN(emaFast[i]) || isNaN(emaSlow[i])) {
      macdLine.push(NaN);
    } else {
      macdLine.push(Number((emaFast[i] - emaSlow[i]).toFixed(2)));
    }
  }

  // Calculate signal line from valid macd values
  const validMacdIndices = macdLine.map((val, idx) => (!isNaN(val) ? idx : -1)).filter((idx) => idx !== -1);
  const validMacdValues = validMacdIndices.map((idx) => macdLine[idx]);
  const validSignalValues = calculateEMA(validMacdValues, signalPeriod);

  const signalLine: number[] = closes.map(() => NaN);
  const histogram: number[] = closes.map(() => NaN);

  validMacdIndices.forEach((origIdx, validIdx) => {
    const sigVal = validSignalValues[validIdx];
    signalLine[origIdx] = sigVal;
    if (!isNaN(sigVal) && !isNaN(macdLine[origIdx])) {
      histogram[origIdx] = Number((macdLine[origIdx] - sigVal).toFixed(2));
    }
  });

  return { macdLine, signalLine, histogram };
}

/**
 * Calculates Bollinger Bands (20, 2 std dev)
 */
export function calculateBollingerBands(closes: number[], period: number = 20, multiplier: number = 2) {
  const upper: number[] = [];
  const middle: number[] = [];
  const lower: number[] = [];

  const sma = calculateSMA(closes, period);

  for (let i = 0; i < closes.length; i++) {
    if (isNaN(sma[i])) {
      upper.push(NaN);
      middle.push(NaN);
      lower.push(NaN);
    } else {
      middle.push(sma[i]);
      let sumSquares = 0;
      for (let j = 0; j < period; j++) {
        sumSquares += Math.pow(closes[i - j] - sma[i], 2);
      }
      const stdDev = Math.sqrt(sumSquares / period);
      upper.push(Number((sma[i] + multiplier * stdDev).toFixed(2)));
      lower.push(Number((sma[i] - multiplier * stdDev).toFixed(2)));
    }
  }

  return { upper, middle, lower };
}

/**
 * Calculates Stochastic Oscillator (%K, %D)
 */
export function calculateStochastic(
  highs: number[],
  lows: number[],
  closes: number[],
  periodK: number = 14,
  periodD: number = 3
) {
  const kLine: number[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < periodK - 1) {
      kLine.push(NaN);
    } else {
      let highestHigh = -Infinity;
      let lowestLow = Infinity;
      for (let j = 0; j < periodK; j++) {
        if (highs[i - j] > highestHigh) highestHigh = highs[i - j];
        if (lows[i - j] < lowestLow) lowestLow = lows[i - j];
      }
      const range = highestHigh - lowestLow;
      const k = range === 0 ? 50 : ((closes[i] - lowestLow) / range) * 100;
      kLine.push(Number(k.toFixed(2)));
    }
  }

  const dLine = calculateSMA(
    kLine.map((v) => (isNaN(v) ? 50 : v)),
    periodD
  );

  return { k: kLine, d: dLine };
}

/**
 * Calculates Average True Range (ATR 14)
 */
export function calculateATR(highs: number[], lows: number[], closes: number[], period: number = 14): number {
  if (closes.length < 2) return 0;
  const trueRanges: number[] = [];

  for (let i = 1; i < closes.length; i++) {
    const tr = Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    );
    trueRanges.push(tr);
  }

  const recentTR = trueRanges.slice(-period);
  if (recentTR.length === 0) return 0;
  const sum = recentTR.reduce((acc, val) => acc + val, 0);
  return Number((sum / recentTR.length).toFixed(2));
}

/**
 * Calculates Pivot Points (Classic Floor Pivots)
 */
export function calculatePivotPoints(high: number, low: number, close: number) {
  const pivot = (high + low + close) / 3;
  const r1 = 2 * pivot - low;
  const s1 = 2 * pivot - high;
  const r2 = pivot + (high - low);
  const s2 = pivot - (high - low);
  const r3 = high + 2 * (pivot - low);
  const s3 = low - 2 * (high - pivot);

  return {
    pivot: Number(pivot.toFixed(2)),
    r1: Number(r1.toFixed(2)),
    r2: Number(r2.toFixed(2)),
    r3: Number(r3.toFixed(2)),
    s1: Number(s1.toFixed(2)),
    s2: Number(s2.toFixed(2)),
    s3: Number(s3.toFixed(2)),
  };
}

/**
 * Computes complete technical indicators & scoring
 */
export function computeTechnicalIndicators(history: PriceHistoryItem[]): TechnicalIndicators {
  if (!history || history.length === 0) {
    throw new Error('History data is required for technical analysis');
  }

  const closes = history.map((item) => item.close);
  const highs = history.map((item) => item.high);
  const lows = history.map((item) => item.low);

  const sma20 = calculateSMA(closes, 20);
  const sma50 = calculateSMA(closes, 50);
  const sma200 = calculateSMA(closes, Math.min(200, Math.max(20, Math.floor(closes.length * 0.8))));
  const ema9 = calculateEMA(closes, 9);
  const ema21 = calculateEMA(closes, 21);
  const rsi14 = calculateRSI(closes, 14);
  const macd = calculateMACD(closes, 12, 26, 9);
  const bollingerBands = calculateBollingerBands(closes, 20, 2);
  const stochastic = calculateStochastic(highs, lows, closes, 14, 3);
  const atr14 = calculateATR(highs, lows, closes, 14);

  const lastItem = history[history.length - 1];
  const lastHigh = lastItem.high;
  const lastLow = lastItem.low;
  const lastClose = lastItem.close;
  const pivotPoints = calculatePivotPoints(lastHigh, lastLow, lastClose);

  // Technical Scoring
  let buyCount = 0;
  let neutralCount = 0;
  let sellCount = 0;

  const currentPrice = lastClose;
  const latestRsi = rsi14[rsi14.length - 1] ?? 50;
  const latestMacdHist = macd.histogram[macd.histogram.length - 1] ?? 0;
  const latestSma20 = sma20[sma20.length - 1] ?? currentPrice;
  const latestSma50 = sma50[sma50.length - 1] ?? currentPrice;
  const latestSma200 = sma200[sma200.length - 1] ?? currentPrice;
  const latestEma9 = ema9[ema9.length - 1] ?? currentPrice;
  const latestEma21 = ema21[ema21.length - 1] ?? currentPrice;
  const latestBollingerLower = bollingerBands.lower[bollingerBands.lower.length - 1] ?? currentPrice;
  const latestBollingerUpper = bollingerBands.upper[bollingerBands.upper.length - 1] ?? currentPrice;
  const latestStochK = stochastic.k[stochastic.k.length - 1] ?? 50;

  // 1. Price vs SMA 20
  if (currentPrice > latestSma20) buyCount++;
  else if (currentPrice < latestSma20) sellCount++;
  else neutralCount++;

  // 2. Price vs SMA 50
  if (currentPrice > latestSma50) buyCount++;
  else if (currentPrice < latestSma50) sellCount++;
  else neutralCount++;

  // 3. Price vs SMA 200
  if (currentPrice > latestSma200) buyCount++;
  else if (currentPrice < latestSma200) sellCount++;
  else neutralCount++;

  // 4. EMA 9 vs EMA 21 (Short trend)
  if (latestEma9 > latestEma21) buyCount++;
  else if (latestEma9 < latestEma21) sellCount++;
  else neutralCount++;

  // 5. RSI 14
  if (latestRsi < 30) buyCount += 2; // Oversold -> strong buy signal
  else if (latestRsi > 70) sellCount += 2; // Overbought -> sell signal
  else if (latestRsi >= 50 && latestRsi <= 65) buyCount++;
  else if (latestRsi >= 35 && latestRsi < 50) neutralCount++;
  else sellCount++;

  // 6. MACD Histogram
  if (latestMacdHist > 0) buyCount++;
  else if (latestMacdHist < 0) sellCount++;
  else neutralCount++;

  // 7. Bollinger Bands position
  if (currentPrice <= latestBollingerLower) buyCount += 1.5;
  else if (currentPrice >= latestBollingerUpper) sellCount += 1.5;
  else neutralCount++;

  // 8. Stochastic %K
  if (latestStochK < 20) buyCount++;
  else if (latestStochK > 80) sellCount++;
  else neutralCount++;

  const totalPoints = buyCount + sellCount + neutralCount;
  const score = Math.min(100, Math.max(0, Math.round((buyCount / Math.max(1, buyCount + sellCount)) * 100)));

  let overallSignal: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL' = 'NEUTRAL';
  if (score >= 75) overallSignal = 'STRONG_BUY';
  else if (score >= 58) overallSignal = 'BUY';
  else if (score <= 25) overallSignal = 'STRONG_SELL';
  else if (score <= 42) overallSignal = 'SELL';
  else overallSignal = 'NEUTRAL';

  const goldenCross = latestSma50 > latestSma200 && (sma50[sma50.length - 5] ?? 0) <= (sma200[sma200.length - 5] ?? 0);
  const deathCross = latestSma50 < latestSma200 && (sma50[sma50.length - 5] ?? 0) >= (sma200[sma200.length - 5] ?? 0);

  const rsiStatus: 'OVERSOLD' | 'NEUTRAL' | 'OVERBOUGHT' =
    latestRsi < 30 ? 'OVERSOLD' : latestRsi > 70 ? 'OVERBOUGHT' : 'NEUTRAL';

  return {
    sma20,
    sma50,
    sma200,
    ema9,
    ema21,
    rsi14,
    macd,
    bollingerBands,
    stochastic,
    atr14,
    pivotPoints,
    summary: {
      overallSignal,
      score,
      buyCount: Math.round(buyCount),
      neutralCount: Math.round(neutralCount),
      sellCount: Math.round(sellCount),
      goldenCross,
      deathCross,
      rsiStatus,
    },
  };
}
