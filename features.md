# Market Pulse - Documentação de Funcionalidades & Evolução Futura

O **Market Pulse** é uma plataforma financeira moderna e robusta para análise de mercado acionário, criptomoedas, forex e índices globais, integrando a **Yahoo Finance API (yFinance)**, gráficos avançados em **Apache ECharts**, e motores dedicados de **Análise Técnica** e **Análise Fundamentalista**.

---

## 🎯 Arquitetura de Skills Implementadas

### 1. `get_stock_quote`
- **Descrição**: Obtém a cotação em tempo real / último fechamento do ativo selecionado.
- **Dados Retornados**:
  - Preço atual, variação nominal e percentual (`regularMarketPrice`, `regularMarketChange`, `regularMarketChangePercent`).
  - Preço de abertura, máxima e mínima diária (`regularMarketOpen`, `regularMarketDayHigh`, `regularMarketDayLow`).
  - Volume diário e volume médio de 10/30 dias.
  - Intervalo de 52 semanas (mínima e máxima histórica do ano).
  - Capitalização de Mercado (Market Cap), Valor da Empresa (Enterprise Value).
  - Múltiplos básicos: P/L (Trailing & Forward P/E), P/VP (Price to Book), Beta, Dividend Yield, LPA (EPS).
  - Moeda, bolsa de valores (Exchange) e horário da última negociação.

### 2. `get_price_history`
- **Descrição**: Extrai séries temporais históricas de velas OHLCV (Open, High, Low, Close, Volume).
- **Períodos Suportados**: `1d`, `5d`, `1mo`, `3mo`, `6mo`, `1y`, `2y`, `5y`, `ytd`, `max`.
- **Intervalos Suportados**: `1m`, `2m`, `5m`, `15m`, `30m`, `60m`, `1d`, `1wk`, `1mo`.
- **Integração Gráfica**: Alimenta os gráficos de velas japonesas (Candlestick), gráficos de linha e barras de volume no Apache ECharts.

### 3. `get_analyst_insights`
- **Descrição**: Coleta o consenso e projeções de analistas de Wall Street e bancos de investimento globais.
- **Dados Retornados**:
  - Consenso de Recomendação: *Strong Buy* (Compra Forte), *Buy* (Compra), *Hold* (Manter), *Underperform* (Desempenho Inferior), *Sell* (Venda).
  - Preços-alvo (Price Targets): Preço Alvo Médio, Máximo e Mínimo, com cálculo automático de potencial de valorização (*Upside/Downside %*).
  - Histórico de Surpresas de Lucro (Earnings Surprise % dos últimos 4 trimestres).
  - Estimativas de Receita e Lucro por Ação (EPS Forecast).
  - Histórico recente de Upgrades e Downgrades das principais casas de análise.

---

## 📊 Motor de Gráficos (Apache ECharts)

- **Tipos de Gráficos**: Candlestick (Velas Japonesas), Linha de Fechamento, Área com Gradiente e Montanha.
- **Painéis Acoplados**:
  - Painel Superior: Candlestick + Médias Móveis (SMA 20, SMA 50, SMA 200, EMA 20) + Bandas de Bollinger (20, 2σ).
  - Painel Intermediário: Volume com coloração de alta/baixa e Média Móvel de Volume (Vol SMA 20).
  - Painel Inferior: Osciladores selecionáveis (RSI 14 com níveis 70/30, MACD 12/26/9 com histograma e linha de sinal).
- **Recursos Interativos**:
  - Zoom de alta precisão com controle deslizante (*DataZoom*) e scroll do mouse.
  - Crosshair / Cursor sincronizado com tooltip flutuante detalhado (Data, O, H, L, C, Vol, Var %).
  - Alternância entre escala Linear e Logarítmica.
  - Exportação de snapshots em imagem PNG de alta resolução.
  - Tema escuro de terminal de trading (Dark Pro) e tema claro moderno.

---

## 🔍 Análise Técnica (Technical Analysis Engine)

1. **Indicadores de Tendência**:
   - Médias Móveis Simples (SMA 20, 50, 100, 200).
   - Médias Móveis Exponenciais (EMA 9, 21, 50).
   - Detecção de Cruzamento Dourado (*Golden Cross*) e Cruzamento da Morte (*Death Cross*).
2. **Osciladores e Momentum**:
   - Índice de Força Relativa (RSI 14) com interpretação de sobrecompra / sobrevenda.
   - MACD (Convergência/Divergência de Médias Móveis).
   - Oscilador Estocástico (%K, %D).
3. **Volatilidade e Canais**:
   - Bandas de Bollinger (Largura de banda e teste de bandas).
   - Average True Range (ATR 14) para dimensionamento de stop loss.
4. **Pontos de Pivô (Suporte & Resistência)**:
   - Níveis de Suporte (S1, S2, S3) e Resistência (R1, R2, R3) via fórmulas Clássica e Fibonacci.
5. **Score Geral Técnico**:
   - Termômetro / Medidor unificado de Compra Forte, Compra, Neutro, Venda, Venda Forte baseado em ponderação de 12 indicadores.

---

## 📑 Análise Fundamentalista (Fundamental Analysis Engine)

1. **Valuation**:
   - P/L (Preço / Lucro), P/VP (Preço / Valor Patrimonial), EV/EBITDA, PEG Ratio.
   - Estimativa de Preço Justo aproximado (Modelo de Graham e Múltiplos).
2. **Eficiência e Rentabilidade**:
   - Margem Bruta, Margem Operacional e Margem Líquida.
   - ROE (Retorno sobre Patrimônio Líquido) e ROA (Retorno sobre Ativos).
3. **Saúde Financeira e Endividamento**:
   - Dívida Líquida / EBITDA, Dívida Total / Patrimônio Líquido.
   - Liquidez Corrente e Cobertura de Juros.
4. **Proventos & Dividendos**:
   - Dividend Yield (%), Payout Ratio e histórico de pagamentos.

---

## 💼 Gestão de Tickers, Watchlists e Portfólio

- **Busca Universal com Autocomplete**: Suporte a ações dos EUA (NVDA, AAPL, MSFT, TSLA, AMZN), B3 Brasil (PETR4.SA, VALE3.SA, ITUB4.SA), Europa/Ásia, ETFs (SPY, QQQ, VOO), Criptomoedas (BTC-USD, ETH-USD, SOL-USD), Moedas/Forex (EURUSD=X, USDBRL=X) e Índices globais (^GSPC, ^IXIC, ^BVSP).
- **Múltiplas Listas de Acompanhamento (Watchlists)**: Organização por categorias personalizadas (Tecnologia, Dividendos, Cripto, Favoritos).
- **Simulador de Carteira (Portfólio Tracker)**:
  - Registro de quantidade de ações, preço médio de compra e data.
  - Cálculo em tempo real de Lucro/Prejuízo (P&L $ e %) e alocação percentual da carteira.
- **Alertas de Preço**: Notificações configuráveis quando um ticker atinge determinado patamar de preço.
- **Comparador Multi-Ticker**: Comparação simultânea de até 4 ativos lado a lado com métricas de desempenho normalizado.

---

## 🚀 Roteiro de Evolução Futura (Roadmap)

### Versão 2.0 (Próximas Entregas)
- [ ] **Integração com WebSockets em Tempo Real**: Atualização tick-by-tick durante o horário de pregão das bolsas globais.
- [ ] **Backtesting de Estratégias**: Simulador de estratégias técnicas (ex: Cruzamento de Médias Móveis, RSI 30/70 Breakout) com cálculo de Sharpe Ratio e Drawdown máximo.
- [ ] **Screener de Ações Avançado (Stock Screener)**: Filtros customizáveis por P/L < 15, Dividend Yield > 6%, RSI < 30 e Market Cap > $10B.
- [ ] **Feed de Notícias e Sentimento de Mercado**: Agregação de notícias financeiras com análise de sentimento via NLP.
- [ ] **Integração com Corretoras (Paper Trading)**: Modo de simulação de ordens de compra/venda com saldo virtual e registro de operações.
- [ ] **Exportação de Relatórios em PDF**: Geração de relatórios executivos de análise fundamentalista e técnica prontos para impressão.
- [ ] **Alertas no Telegram / Discord**: Disparo de webhooks quando alertas de preço ou sinais técnicos forem acionados.
