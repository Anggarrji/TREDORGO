import express from 'express';
import { createServer as createViteServer } from 'vite';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';

async function startServer() {
  const app = express();
  const PORT = 3000;
  const server = http.createServer(app);

  app.use(express.json());

  // In-memory state
  let accountConnected = false;
  let accountData = {
    balance: 10000,
    equity: 10000,
    margin: 0,
    freeMargin: 10000,
    marginLevel: 0,
  };
  
  let activeTrades: any[] = [];
  let tradeHistory: any[] = [];
  let botSettings = {
    mode: 'Balanced',
    lotSize: 0.1,
    takeProfit: 50,
    stopLoss: 30,
    maxOpenPositions: 5,
    dailyLossLimit: 500,
    maxDrawdown: 20,
    autoTrailingStop: true,
  };

  // API Routes
  app.post('/api/connect', (req, res) => {
    const { login, server: mt5Server, password } = req.body;
    if (login && mt5Server && password) {
      accountConnected = true;
      res.json({ success: true, message: 'Connected to MT5 successfully.' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid credentials.' });
    }
  });

  app.post('/api/disconnect', (req, res) => {
    accountConnected = false;
    res.json({ success: true, message: 'Disconnected.' });
  });

  app.get('/api/account', (req, res) => {
    if (!accountConnected) return res.status(401).json({ error: 'Not connected' });
    res.json(accountData);
  });

  app.get('/api/trades/active', (req, res) => {
    res.json(activeTrades);
  });

  app.get('/api/trades/history', (req, res) => {
    res.json(tradeHistory);
  });

  app.get('/api/settings', (req, res) => {
    res.json(botSettings);
  });

  app.post('/api/settings', (req, res) => {
    botSettings = { ...botSettings, ...req.body };
    res.json({ success: true, settings: botSettings });
  });

  app.post('/api/trade/manual', (req, res) => {
    if (!accountConnected) return res.status(401).json({ error: 'Not connected' });
    const { type, pair, lotSize } = req.body;
    
    const newTrade = {
      id: Math.random().toString(36).substr(2, 9),
      pair,
      type,
      lotSize,
      entryPrice: type === 'BUY' ? 1.0500 : 1.0498, // Mock price
      currentPrice: type === 'BUY' ? 1.0500 : 1.0498,
      tp: 0,
      sl: 0,
      pnl: 0,
      openTime: new Date().toISOString(),
    };
    
    activeTrades.push(newTrade);
    broadcast({ type: 'TRADE_OPENED', trade: newTrade });
    res.json({ success: true, trade: newTrade });
  });

  app.post('/api/trade/close', (req, res) => {
    const { id } = req.body;
    const index = activeTrades.findIndex(t => t.id === id);
    if (index !== -1) {
      const trade = activeTrades[index];
      trade.closeTime = new Date().toISOString();
      tradeHistory.push(trade);
      activeTrades.splice(index, 1);
      
      accountData.balance += trade.pnl;
      accountData.equity = accountData.balance;
      
      broadcast({ type: 'TRADE_CLOSED', trade });
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Trade not found' });
    }
  });

  app.post('/api/trade/close-all', (req, res) => {
    const closed = [...activeTrades];
    closed.forEach(trade => {
      trade.closeTime = new Date().toISOString();
      accountData.balance += trade.pnl;
      tradeHistory.push(trade);
    });
    accountData.equity = accountData.balance;
    activeTrades = [];
    
    broadcast({ type: 'ALL_TRADES_CLOSED', count: closed.length });
    res.json({ success: true, count: closed.length });
  });

  // WebSocket Server
  const wss = new WebSocketServer({ server });
  
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);
    
    ws.send(JSON.stringify({ type: 'INIT', accountData, activeTrades }));

    ws.on('close', () => {
      clients.delete(ws);
    });
  });

  function broadcast(data: any) {
    const message = JSON.stringify(data);
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  }

  // Simulate Market Data & AI Signals
  setInterval(() => {
    if (!accountConnected) return;

    // Simulate price movement
    activeTrades.forEach(trade => {
      const move = (Math.random() - 0.5) * 0.0010; // 10 pips max move
      trade.currentPrice += move;
      
      // Calculate mock PnL (1 lot = $10 per pip roughly, simplified)
      const pips = (trade.type === 'BUY' ? trade.currentPrice - trade.entryPrice : trade.entryPrice - trade.currentPrice) * 10000;
      trade.pnl = pips * trade.lotSize * 10;
    });

    // Update equity
    const totalPnl = activeTrades.reduce((sum, t) => sum + t.pnl, 0);
    accountData.equity = accountData.balance + totalPnl;
    
    // Simulate AI Signal
    const pairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD'];
    const signals = ['BUY', 'SELL', 'WAIT'];
    const randomPair = pairs[Math.floor(Math.random() * pairs.length)];
    const randomSignal = signals[Math.floor(Math.random() * signals.length)];
    const probability = Math.floor(Math.random() * 30) + 60; // 60-90%

    broadcast({
      type: 'MARKET_UPDATE',
      accountData,
      activeTrades,
      aiSignal: {
        pair: randomPair,
        signal: randomSignal,
        probability,
        timestamp: new Date().toISOString()
      }
    });

  }, 2000);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
