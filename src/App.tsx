import React, { useState, useEffect } from 'react';
import { Activity, Settings, History, LayoutDashboard, LogOut, Menu, X, Wallet, TrendingUp, AlertCircle, Play, Square, ShieldAlert } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Components
import Dashboard from './components/Dashboard';
import Accounts from './components/Accounts';
import BotSettings from './components/BotSettings';
import TradeHistory from './components/TradeHistory';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [accountData, setAccountData] = useState({ balance: 0, equity: 0, margin: 0, freeMargin: 0 });
  const [activeTrades, setActiveTrades] = useState([]);
  const [aiSignal, setAiSignal] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Connect to WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'INIT') {
        setAccountData(data.accountData);
        setActiveTrades(data.activeTrades);
      } else if (data.type === 'MARKET_UPDATE') {
        setAccountData(data.accountData);
        setActiveTrades(data.activeTrades);
        setAiSignal(data.aiSignal);
      } else if (data.type === 'TRADE_OPENED') {
        addNotification(`Trade Opened: ${data.trade.type} ${data.trade.pair}`);
      } else if (data.type === 'TRADE_CLOSED') {
        addNotification(`Trade Closed: ${data.trade.pair} | PnL: $${data.trade.pnl.toFixed(2)}`);
      }
    };

    return () => ws.close();
  }, []);

  const addNotification = (msg: string) => {
    setNotifications(prev => [{ id: Date.now(), msg }, ...prev].slice(0, 5));
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'accounts', label: 'MT5 Accounts', icon: Wallet },
    { id: 'settings', label: 'Bot Settings', icon: Settings },
    { id: 'history', label: 'Trade History', icon: History },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f16] text-slate-300 font-sans flex overflow-hidden">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-[#111827] border-r border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xl tracking-tight">
            <Activity className="w-6 h-6" />
            TREDORGO AI
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-emerald-500/10 text-emerald-400" 
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className={cn("w-2 h-2 rounded-full", isConnected ? "bg-emerald-500" : "bg-rose-500")} />
            <span className="text-sm font-medium text-slate-400">
              {isConnected ? 'MT5 Connected' : 'MT5 Disconnected'}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-[#111827]/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex-1" />
          
          <div className="flex items-center gap-4">
            {/* Notifications Dropdown (Simplified) */}
            <div className="relative group">
              <button className="p-2 text-slate-400 hover:text-white relative">
                <AlertCircle className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
                )}
              </button>
              <div className="absolute right-0 mt-2 w-80 bg-[#1f2937] border border-slate-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="p-3 border-b border-slate-700 font-medium text-white">Recent Alerts</div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-sm text-slate-400 text-center">No new notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="p-3 border-b border-slate-700/50 text-sm hover:bg-slate-800/50">
                        {n.msg}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-sm">
              TR
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && <Dashboard accountData={accountData} activeTrades={activeTrades} aiSignal={aiSignal} />}
          {activeTab === 'accounts' && <Accounts isConnected={isConnected} setIsConnected={setIsConnected} />}
          {activeTab === 'settings' && <BotSettings />}
          {activeTab === 'history' && <TradeHistory />}
        </div>
      </main>
    </div>
  );
}
