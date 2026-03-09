import React, { useState } from 'react';
import { Server, Key, User, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';

export default function Accounts({ isConnected, setIsConnected }: any) {
  const [login, setLogin] = useState('');
  const [server, setServer] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, server, password })
      });
      const data = await res.json();
      
      if (data.success) {
        setIsConnected(true);
      } else {
        setError(data.message || 'Failed to connect');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    await fetch('/api/disconnect', { method: 'POST' });
    setIsConnected(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-emerald-500/10 rounded-xl">
            <Server className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">MT5 Connection</h1>
            <p className="text-slate-400">Connect your MetaTrader 5 account to TREDORGO AI</p>
          </div>
        </div>

        {isConnected ? (
          <div className="space-y-6">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-emerald-400 mb-1">Account Connected Successfully</h3>
                <p className="text-slate-300 text-sm">Your MT5 account is active and receiving real-time data. The AI Market Analyzer is now monitoring the markets.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="text-sm text-slate-400 mb-1">Login ID</div>
                <div className="font-mono font-bold text-white">{login || '987654321'}</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="text-sm text-slate-400 mb-1">Server</div>
                <div className="font-bold text-white">{server || 'MetaQuotes-Demo'}</div>
              </div>
            </div>

            <button 
              onClick={handleDisconnect}
              className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" /> Disconnect Account
            </button>
          </div>
        ) : (
          <form onSubmit={handleConnect} className="space-y-6">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-center gap-3 text-rose-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">MT5 Login (9 Digits)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    required
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="e.g. 123456789"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Broker Server</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Server className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    required
                    value={server}
                    onChange={(e) => setServer(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="e.g. MetaQuotes-Demo"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                'Connect to MT5'
              )}
            </button>
            
            <p className="text-xs text-center text-slate-500 mt-4">
              Your credentials are encrypted and securely transmitted via EA Bridge.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
