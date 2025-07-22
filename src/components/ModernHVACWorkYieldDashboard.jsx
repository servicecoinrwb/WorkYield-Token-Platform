import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, Wrench, ArrowUpRight, ExternalLink,
  BarChart3, Target, Zap, Settings, RefreshCw, Bell, Coins,
  ArrowRight, CheckCircle, Clock, AlertTriangle, Users, Calendar,
  ChevronDown, Filter, Search, MoreHorizontal, Play, Pause,
  Sparkles, Layers, Activity, Shield, Eye, TrendingDown, Plus
} from 'lucide-react';

const ModernHVACWorkYieldDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [notifications, setNotifications] = useState(3);

  // Live data with animations
  const [liveData, setLiveData] = useState({
    totalRevenue: 284750,
    tokenRevenue: 68450,
    activeTokens: 15420,
    availableTokens: 6890,
    platformFees: 8230,
    activeOrders: 7,
    completedToday: 3,
    reserveFund: 12850,
    liveInvestors: 89,
    avgYield: 12.8
  });

  // Simulate live updates
  useEffect(() => {
    if (isLiveMode) {
      const interval = setInterval(() => {
        setLiveData(prev => ({
          ...prev,
          tokenRevenue: prev.tokenRevenue + Math.floor(Math.random() * 100),
          liveInvestors: prev.liveInvestors + (Math.random() > 0.7 ? 1 : 0),
          availableTokens: prev.availableTokens - Math.floor(Math.random() * 10)
        }));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isLiveMode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Modern Glass Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/10 border-b border-white/20">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  HVAC Finance Suite
                </h1>
                <p className="text-gray-400 text-sm">WorkYield Token Platform • Real-time Operations</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <div className={`w-2 h-2 rounded-full ${isLiveMode ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-white text-sm font-medium">
                  {isLiveMode ? 'Live' : 'Paused'}
                </span>
                <button 
                  onClick={() => setIsLiveMode(!isLiveMode)}
                  className="ml-2 text-white/80 hover:text-white"
                >
                  {isLiveMode ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              </div>
              
              <button className="relative bg-white/10 backdrop-blur-sm rounded-full p-3 border border-white/20 hover:bg-white/20 transition-all">
                <Bell className="w-5 h-5 text-white" />
                {notifications > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                    {notifications}
                  </div>
                )}
              </button>
              
              <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-blue-500/25">
                <ExternalLink className="w-4 h-4 inline mr-2" />
                Open Trading
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Modern Navigation */}
      <nav className="px-8 py-4">
        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-2xl p-2 border border-white/10">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'tokenization', label: 'Tokenization', icon: Coins },
            { id: 'trading', label: 'Trading Hub', icon: TrendingUp },
            { id: 'analytics', label: 'Analytics', icon: Activity }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeSection === item.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="px-8 pb-8">
        {activeSection === 'overview' && <ModernOverview liveData={liveData} />}
        {activeSection === 'tokenization' && <ModernTokenization />}
        {activeSection === 'trading' && <ModernTradingHub liveData={liveData} />}
        {activeSection === 'analytics' && <ModernAnalytics liveData={liveData} />}
      </div>
    </div>
  );
};

// Modern Overview Section
const ModernOverview = ({ liveData }) => {
  return (
    <div className="space-y-8">
      {/* Hero Metrics with Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`$${liveData.totalRevenue.toLocaleString()}`}
          change="+18.2%"
          trend="up"
          icon={DollarSign}
          gradient="from-green-400 to-emerald-600"
        />
        <MetricCard
          title="Token Revenue"
          value={`$${liveData.tokenRevenue.toLocaleString()}`}
          change="+24.1%"
          trend="up"
          icon={Coins}
          gradient="from-blue-400 to-cyan-600"
        />
        <MetricCard
          title="Active Tokens"
          value={liveData.activeTokens.toLocaleString()}
          change="+12.5%"
          trend="up"
          icon={Target}
          gradient="from-purple-400 to-pink-600"
        />
        <MetricCard
          title="Live Investors"
          value={liveData.liveInvestors}
          change="+8"
          trend="up"
          icon={Users}
          gradient="from-orange-400 to-red-600"
        />
      </div>

      {/* Advanced Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RealtimeChart />
        </div>
        <div>
          <LiveActivity />
        </div>
      </div>

      {/* Work Orders with Modern Design */}
      <ModernWorkOrders />
    </div>
  );
};

// Glassmorphism Metric Card
const MetricCard = ({ title, value, change, trend, icon: Icon, gradient }) => {
  return (
    <div className="group relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20"></div>
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
            trend === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change}
          </div>
        </div>
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
        
        {/* Subtle hover effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
      </div>
    </div>
  );
};

// Real-time Chart Component
const RealtimeChart = () => {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20"></div>
      <div className="relative p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Revenue Analytics</h3>
            <p className="text-gray-400 text-sm">Real-time performance tracking</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm transition-colors border border-white/20">
              24H
            </button>
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl text-sm">
              7D
            </button>
          </div>
        </div>
        
        {/* Simulated Chart Area */}
        <div className="h-64 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-purple-500/20 rounded-2xl"></div>
          <div className="absolute inset-4 flex items-end justify-between">
            {[65, 78, 82, 95, 88, 92, 100, 85, 90, 96, 89, 94].map((height, index) => (
              <div
                key={index}
                className="w-6 bg-gradient-to-t from-blue-400 to-purple-500 rounded-t-lg animate-pulse"
                style={{ height: `${height}%`, animationDelay: `${index * 0.1}s` }}
              ></div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t border-white/10">
          <div>
            <p className="text-gray-400 text-sm">Today's Revenue</p>
            <p className="text-xl font-bold text-white">$24,580</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Token Sales</p>
            <p className="text-xl font-bold text-green-400">$8,420</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Platform Fees</p>
            <p className="text-xl font-bold text-purple-400">$1,240</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Live Activity Feed
const LiveActivity = () => {
  const activities = [
    { type: 'token_sale', message: 'Sarah M. bought 500 WYT', time: '2 min ago', amount: '+$500' },
    { type: 'work_order', message: 'New HVAC installation tokenized', time: '5 min ago', amount: '8,500 WYT' },
    { type: 'redemption', message: 'Investor redeemed 1,200 WYT', time: '8 min ago', amount: '-$1,200' },
    { type: 'completion', message: 'Work order WO-2025-003 completed', time: '15 min ago', amount: '+$5,300' },
    { type: 'token_sale', message: 'Mike J. bought 750 WYT', time: '22 min ago', amount: '+$750' }
  ];

  return (
    <div className="relative overflow-hidden h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20"></div>
      <div className="relative p-6 h-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-400" />
            Live Activity
          </h3>
          <button className="text-gray-400 hover:text-white">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                activity.type === 'token_sale' ? 'bg-green-400' :
                activity.type === 'work_order' ? 'bg-blue-400' :
                activity.type === 'redemption' ? 'bg-purple-400' :
                'bg-orange-400'
              } animate-pulse`}></div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm">{activity.message}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-gray-400 text-xs">{activity.time}</p>
                  <p className={`text-xs font-medium ${
                    activity.amount.startsWith('+') ? 'text-green-400' : 
                    activity.amount.startsWith('-') ? 'text-red-400' : 'text-blue-400'
                  }`}>
                    {activity.amount}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Modern Work Orders
const ModernWorkOrders = () => {
  const workOrders = [
    {
      id: 'WO-2025-001',
      client: 'Metro Business Center',
      service: 'HVAC Installation - 5 Units',
      status: 'In Progress',
      progress: 75,
      profit: 8500,
      tokenized: true,
      priority: 'high'
    },
    {
      id: 'WO-2025-002',
      client: 'City General Hospital',
      service: 'Emergency ICU Repair',
      status: 'Active',
      progress: 30,
      profit: 6000,
      tokenized: false,
      priority: 'urgent'
    },
    {
      id: 'WO-2025-003',
      client: 'QuickMart Chain',
      service: 'Maintenance Contract',
      status: 'Completed',
      progress: 100,
      profit: 5300,
      tokenized: true,
      priority: 'medium'
    }
  ];

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20"></div>
      <div className="relative p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Active Work Orders</h3>
          <div className="flex items-center gap-3">
            <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm transition-colors border border-white/20">
              <Filter className="w-4 h-4 inline mr-2" />
              Filter
            </button>
            <button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl text-sm hover:shadow-lg transition-all">
              <Plus className="w-4 h-4 inline mr-2" />
              New Order
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          {workOrders.map((order) => (
            <div key={order.id} className="group p-6 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 border border-white/10 hover:from-white/10 hover:to-white/15 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${
                    order.priority === 'urgent' ? 'bg-red-400 animate-pulse' :
                    order.priority === 'high' ? 'bg-orange-400' :
                    'bg-green-400'
                  }`}></div>
                  <div>
                    <h4 className="text-white font-semibold">{order.id}</h4>
                    <p className="text-gray-400 text-sm">{order.client}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {order.tokenized ? (
                    <div className="flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-medium">
                      <Coins className="w-3 h-3" />
                      Tokenized
                    </div>
                  ) : (
                    <button className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-1 rounded-full text-xs font-medium transition-colors">
                      Tokenize
                    </button>
                  )}
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                    order.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-orange-500/20 text-orange-400'
                  }`}>
                    {order.status}
                  </div>
                </div>
              </div>
              
              <p className="text-gray-300 text-sm mb-4">{order.service}</p>
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm">Progress</span>
                <span className="text-white text-sm font-medium">{order.progress}%</span>
              </div>
              
              <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    order.progress === 100 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                    'bg-gradient-to-r from-blue-400 to-purple-500'
                  }`}
                  style={{ width: `${order.progress}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs">Estimated Profit</p>
                  <p className="text-green-400 font-bold">${order.profit.toLocaleString()}</p>
                </div>
                {order.tokenized && (
                  <div className="text-right">
                    <p className="text-gray-400 text-xs">Tokens Issued</p>
                    <p className="text-blue-400 font-bold">{(order.profit * 0.95).toLocaleString()} WYT</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Modern Tokenization Section
const ModernTokenization = () => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
          Tokenization Center
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Transform your HVAC work orders into tradeable tokens. Create instant liquidity from future profits.
        </p>
      </div>
      
      <TokenizationInterface />
    </div>
  );
};

// Modern Trading Hub
const ModernTradingHub = ({ liveData }) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
          Trading Hub
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Buy and sell WorkYield tokens with real-time pricing and instant execution.
        </p>
      </div>
      
      <TradingInterface liveData={liveData} />
    </div>
  );
};

// Modern Analytics
const ModernAnalytics = ({ liveData }) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
          Analytics Dashboard
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Deep insights into your tokenization performance and business metrics.
        </p>
      </div>
      
      <AdvancedAnalytics liveData={liveData} />
    </div>
  );
};

// Tokenization Interface
const TokenizationInterface = () => {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20"></div>
      <div className="relative p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-6">Create New Token</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Work Order ID</label>
                <input 
                  type="text" 
                  placeholder="WO-2025-XXX"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Expected Profit</label>
                <input 
                  type="number" 
                  placeholder="8500"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Description</label>
                <textarea 
                  placeholder="HVAC Installation - Commercial Building"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                />
              </div>
              <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-blue-500/25">
                <Zap className="w-5 h-5 inline mr-2" />
                Tokenize Work Order
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-white mb-6">Tokenization Preview</h3>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Gross Profit</span>
                  <span className="text-white font-semibold">$8,500</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Reserve Fund (5%)</span>
                  <span className="text-purple-400 font-semibold">$425</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Tokens to Issue</span>
                  <span className="text-green-400 font-semibold">8,075 WYT</span>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30">
                <h4 className="text-white font-semibold mb-2">Token Details</h4>
                <p className="text-gray-300 text-sm">Each token represents $1 of expected profit. Investors can purchase tokens at face value and redeem them for actual profit when the work order completes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Trading Interface
const TradingInterface = ({ liveData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl rounded-3xl border border-green-500/20"></div>
        <div className="relative p-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Buy Tokens
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Amount (WYT)</label>
              <input 
                type="number" 
                placeholder="1000"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="p-4 bg-white/5 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Cost (1:1 ratio)</span>
                <span className="text-white font-semibold">$1,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Available</span>
                <span className="text-green-400 font-semibold">{liveData.availableTokens.toLocaleString()} WYT</span>
              </div>
            </div>
            <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-green-500/25">
              Buy Tokens
            </button>
          </div>
        </div>
      </div>
      
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-3xl border border-purple-500/20"></div>
        <div className="relative p-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-purple-400" />
            Redeem Tokens
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Amount (WYT)</label>
              <input 
                type="number" 
                placeholder="500"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="p-4 bg-white/5 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">You Receive</span>
                <span className="text-white font-semibold">$450</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Platform Fee (10%)</span>
                <span className="text-purple-400 font-semibold">$50</span>
              </div>
            </div>
            <button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-purple-500/25">
              Redeem Tokens
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Advanced Analytics
const AdvancedAnalytics = ({ liveData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20"></div>
        <div className="relative p-8">
          <h3 className="text-xl font-bold text-white mb-6">Performance Metrics</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <p className="text-3xl font-bold text-green-400">{liveData.avgYield}%</p>
                <p className="text-gray-400 text-sm">Avg Yield</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <p className="text-3xl font-bold text-blue-400">23</p>
                <p className="text-gray-400 text-sm">Avg Hold Days</p>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl">
              <h4 className="text-white font-semibold mb-2">ROI Analysis</h4>
              <p className="text-gray-300 text-sm">Platform generating 285% ROI compared to traditional factoring solutions.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20"></div>
        <div className="relative p-8">
          <h3 className="text-xl font-bold text-white mb-6">Market Insights</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
              <span className="text-gray-300">Token Velocity</span>
              <span className="text-green-400 font-semibold">High</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
              <span className="text-gray-300">Demand Score</span>
              <span className="text-blue-400 font-semibold">8.7/10</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
              <span className="text-gray-300">Liquidity Index</span>
              <span className="text-purple-400 font-semibold">94%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernHVACWorkYieldDashboard;