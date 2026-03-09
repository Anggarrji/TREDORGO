import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, AlertTriangle, Play, Square, XCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard({ accountData, activeTrades, aiSignal }: any) {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Mock chart data for visual representation
    const data = Array.from({ length: 20 }).map((_, i) => ({
      time: new Date(Date.now() - (20 - i) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price: 1.0500 + (Math.random() - 0.5) * 0.0050
    }));
    setChartData(data);
  }, []);

  useEffect(() => {
    if (chartData.length > 0) {
      const interval = setInterval(() => {
        setChartData(prev => {
          const newData = [...prev.slice(1), {
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            price: prev[prev.length - 1].price + (Math.random() - 0.5) * 0.0010
          }];
          return newData;
        });
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [chartData]);

  const handleManualTrade = async (type: string) => {
    await fetch('/api/trade/manual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, pair: 'EURUSD', lotSize: 0.1 })
    });
  };

  const handleCloseTrade = async (id: string) => {
    await fetch('/api/trade/close', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
  };

  const handleCloseAll = async () => {
    await fetch('/api/trade/close-all', { method: 'POST' });
  };

  return (
    <div className="space-y-6">
      {/* Account Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Balance', value: `$${accountData.balance.toFixed(2)}`, color: 'text-white' },
          { label: 'Equity', value: `$${accountData.equity.toFixed(2)}`, color: accountData.equity >= accountData.balance ? 'text-emerald-400' : 'text-rose-400' },
          { label: 'Margin', value: `$${accountData.margin.toFixed(2)}`, color: 'text-slate-300' },
          { label: 'Free Margin', value: `$${accountData.freeMargin.toFixed(2)}`, color: 'text-slate-300' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
            <div className="text-sm font-medium text-slate-400 mb-2">{stat.label}</div>
            <div className={`text-3xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Area */}
        <div className="lg:col-span-2 bg-[#111827] border border-slate-800 rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">EUR/USD Live Chart</h2>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs text-emerald-400 font-medium">LIVE</span>
            </div>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={['auto', 'auto']} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val.toFixed(4)} width={60} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Line type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Signal & Manual Trading */}
        <div className="space-y-6">
          {/* AI Signal */}
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              AI Market Analyzer
            </h2>
            {aiSignal ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Pair</span>
                  <span className="font-bold text-white">{aiSignal.pair}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Signal</span>
                  <span className={`font-bold px-3 py-1 rounded-full text-sm ${
                    aiSignal.signal === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 
                    aiSignal.signal === 'SELL' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {aiSignal.signal}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Probability</span>
                  <span className="font-bold text-white">{aiSignal.probability}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full ${aiSignal.signal === 'BUY' ? 'bg-emerald-500' : aiSignal.signal === 'SELL' ? 'bg-rose-500' : 'bg-slate-500'}`} 
                    style={{ width: `${aiSignal.probability}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 py-4">Waiting for AI analysis...</div>
            )}
          </div>

          {/* Manual Trading */}
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Manual Execution</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button 
                onClick={() => handleManualTrade('BUY')}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <TrendingUp className="w-5 h-5" /> BUY
              </button>
              <button 
                onClick={() => handleManualTrade('SELL')}
                className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <TrendingDown className="w-5 h-5" /> SELL
              </button>
            </div>
            <button 
              onClick={handleCloseAll}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <XCircle className="w-5 h-5" /> Close All Trades
            </button>
          </div>
        </div>
      </div>

      {/* Active Positions */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white">Active Positions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Pair</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Lot</th>
                <th className="p-4 font-medium">Entry</th>
                <th className="p-4 font-medium">Current</th>
                <th className="p-4 font-medium">PnL</th>
                <th className="p-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {activeTrades.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">No active positions</td>
                </tr>
              ) : (
                activeTrades.map((trade: any) => (
                  <tr key={trade.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="p-4 font-bold text-white">{trade.pair}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${trade.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {trade.type}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300">{trade.lotSize}</td>
                    <td className="p-4 font-mono text-slate-300">{trade.entryPrice.toFixed(4)}</td>
                    <td className="p-4 font-mono text-slate-300">{trade.currentPrice.toFixed(4)}</td>
                    <td className={`p-4 font-mono font-bold ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleCloseTrade(trade.id)}
                        className="text-slate-400 hover:text-rose-400 transition-colors"
                        title="Close Position"
                      >
                        <XCircle className="w-5 h-5 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
