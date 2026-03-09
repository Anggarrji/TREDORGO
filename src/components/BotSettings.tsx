import React, { useState, useEffect } from 'react';
import { Settings, Shield, Zap, Sliders, Save, AlertTriangle } from 'lucide-react';

export default function BotSettings() {
  const [settings, setSettings] = useState({
    mode: 'Balanced',
    lotSize: 0.1,
    takeProfit: 50,
    stopLoss: 30,
    maxOpenPositions: 5,
    dailyLossLimit: 500,
    maxDrawdown: 20,
    autoTrailingStop: true,
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data));
  }, []);

  const handleSave = async () => {
    setLoading(true);
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Settings className="w-7 h-7 text-emerald-400" />
            Bot Configuration
          </h1>
          <p className="text-slate-400 mt-1">Configure AI trading parameters and risk management</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-6 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
        >
          {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trading Mode */}
        <div className="lg:col-span-3 bg-[#111827] border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Trading Strategy Mode
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'Safe', title: 'Safe Mode', desc: 'Low risk, highly selective entries', color: 'emerald' },
              { id: 'Balanced', title: 'Balanced Mode', desc: 'Optimal risk-reward ratio', color: 'blue' },
              { id: 'Aggressive', title: 'Aggressive Mode', desc: 'High frequency, higher risk', color: 'rose' }
            ].map((mode) => (
              <div 
                key={mode.id}
                onClick={() => setSettings({ ...settings, mode: mode.id })}
                className={`cursor-pointer p-5 rounded-xl border-2 transition-all ${
                  settings.mode === mode.id 
                    ? `border-${mode.color}-500 bg-${mode.color}-500/10` 
                    : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`font-bold text-${settings.mode === mode.id ? mode.color + '-400' : 'white'}`}>{mode.title}</h3>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    settings.mode === mode.id ? `border-${mode.color}-500` : 'border-slate-600'
                  }`}>
                    {settings.mode === mode.id && <div className={`w-2 h-2 rounded-full bg-${mode.color}-500`} />}
                  </div>
                </div>
                <p className="text-sm text-slate-400">{mode.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Execution Parameters */}
        <div className="lg:col-span-1 bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            Execution Params
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Lot Size (Volume)</label>
              <input 
                type="number" step="0.01" min="0.01"
                value={settings.lotSize}
                onChange={(e) => setSettings({ ...settings, lotSize: parseFloat(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Take Profit (Pips)</label>
              <input 
                type="number"
                value={settings.takeProfit}
                onChange={(e) => setSettings({ ...settings, takeProfit: parseInt(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Stop Loss (Pips)</label>
              <input 
                type="number"
                value={settings.stopLoss}
                onChange={(e) => setSettings({ ...settings, stopLoss: parseInt(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Risk Management */}
        <div className="lg:col-span-2 bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-rose-400" />
            Risk Management
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center justify-between">
                <span>Daily Loss Limit ($)</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </label>
              <input 
                type="number"
                value={settings.dailyLossLimit}
                onChange={(e) => setSettings({ ...settings, dailyLossLimit: parseInt(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 font-mono"
              />
              <p className="text-xs text-slate-500 mt-2">Bot stops trading if daily loss exceeds this amount.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Max Drawdown (%)</label>
              <input 
                type="number" max="100" min="1"
                value={settings.maxDrawdown}
                onChange={(e) => setSettings({ ...settings, maxDrawdown: parseInt(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 font-mono"
              />
              <p className="text-xs text-slate-500 mt-2">Maximum allowed account drawdown.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Max Open Positions</label>
              <input 
                type="number" min="1" max="50"
                value={settings.maxOpenPositions}
                onChange={(e) => setSettings({ ...settings, maxOpenPositions: parseInt(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-xl p-4 mt-2">
              <div>
                <div className="font-medium text-white">Auto Trailing Stop</div>
                <div className="text-xs text-slate-400 mt-1">Lock in profits automatically</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.autoTrailingStop}
                  onChange={(e) => setSettings({ ...settings, autoTrailingStop: e.target.checked })}
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
