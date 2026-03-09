import React, { useState, useEffect } from 'react';
import { History, Download, Filter, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function TradeHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/trades/history')
      .then(res => res.json())
      .then(data => {
        setHistory(data.sort((a: any, b: any) => new Date(b.closeTime).getTime() - new Date(a.closeTime).getTime()));
        setLoading(false);
      });
  }, []);

  const totalProfit = history.reduce((sum, trade) => sum + trade.pnl, 0);
  const winRate = history.length > 0 
    ? (history.filter(t => t.pnl > 0).length / history.length * 100).toFixed(1) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <History className="w-7 h-7 text-emerald-400" />
            Trade History
          </h1>
          <p className="text-slate-400 mt-1">Review past performance and AI execution logs</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2 text-sm font-medium border border-slate-700">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2 text-sm font-bold shadow-lg shadow-emerald-500/20">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
          <div className="text-sm font-medium text-slate-400 mb-2">Total Trades</div>
          <div className="text-3xl font-bold font-mono text-white">{history.length}</div>
        </div>
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
          <div className="text-sm font-medium text-slate-400 mb-2">Total PnL</div>
          <div className={`text-3xl font-bold font-mono ${totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
          </div>
        </div>
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
          <div className="text-sm font-medium text-slate-400 mb-2">Win Rate</div>
          <div className="text-3xl font-bold font-mono text-blue-400">{winRate}%</div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Date / Time</th>
                <th className="p-4 font-medium">Pair</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Lot</th>
                <th className="p-4 font-medium">Entry</th>
                <th className="p-4 font-medium">Exit</th>
                <th className="p-4 font-medium text-right">Profit/Loss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                      Loading history...
                    </div>
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">No trading history found</td>
                </tr>
              ) : (
                history.map((trade: any) => (
                  <tr key={trade.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="p-4 text-slate-300 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        {format(new Date(trade.closeTime), 'MMM dd, yyyy HH:mm:ss')}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-white">{trade.pair}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${trade.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {trade.type}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300">{trade.lotSize}</td>
                    <td className="p-4 font-mono text-slate-400">{trade.entryPrice.toFixed(4)}</td>
                    <td className="p-4 font-mono text-slate-300">{trade.currentPrice.toFixed(4)}</td>
                    <td className={`p-4 font-mono font-bold text-right ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
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
