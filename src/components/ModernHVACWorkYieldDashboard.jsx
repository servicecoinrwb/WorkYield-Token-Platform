import React, { useState, useEffect, useCallback, createContext, useContext, useMemo } from 'react';
import { 
  DollarSign, TrendingUp, Wrench, ArrowUpRight, ExternalLink,
  BarChart3, Target, Zap, Settings, RefreshCw, Bell, Coins,
  ArrowRight, CheckCircle, Clock, AlertTriangle, Users, Calendar,
  ChevronDown, Filter, Search, MoreHorizontal, Play, Pause,
  Sparkles, Layers, Activity, Shield, Eye, TrendingDown, Plus, Wallet,
  Star, Cloud, X, Sun, Moon, Upload, FileCheck, Trash2, Ban, Link, Download,
  Home, FileText, Calculator, Hammer
} from 'lucide-react';

// --- CONFIGURATION ---
const CONTRACT_ADDRESS = "0xCb0EeE152FFc559D91DF4682f006099C33967e2c";
const CONTRACT_ABI = [
  "function mintFromWorkOrder(uint256 grossYield, string memory description) external returns (uint256)",
  "function buyTokens(uint256 amount) external payable",
  "function redeemTokens(uint256 amount) external",
  "function availableTokens() external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function contractBalance() external view returns (uint256)",
  "function totalReserveFund() external view returns (uint256)",
  "function workOrders(uint256) external view returns (tuple(uint256 id, uint256 grossYield, uint256 reserveAmount, uint256 tokensIssued, bool isActive, bool isPaid, string description, uint256 createdAt))",
  "function fundFromWorkOrderPayment(uint256 workOrderId) external payable",
  "function nextWorkOrderId() external view returns (uint256)",
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function totalSupply() external view returns (uint256)"
];

const PLUME_NETWORK = {
  chainId: '0x18222',
  chainName: 'Plume',
  nativeCurrency: { name: 'PLUME', symbol: 'PLUME', decimals: 18 },
  rpcUrls: ['https://rpc.plume.org'],
  blockExplorerUrls: ['https://explorer.plume.org/'],
};

// --- SERVICES DATA ---
const SERVICES_DATA = [
  { id: 'm1', name: 'A/C Maintenance / No Cool', category: 'Maintenance', cost: 125 },
  { id: 'm2', name: 'Furnace Maintenance / No Heat', category: 'Maintenance', cost: 125 },
  { id: 'm3', name: 'Refrigerant Recharge', category: 'Maintenance', cost: 350 },
  { id: 'm4', name: 'Drain Line Clearing', category: 'Maintenance', cost: 95 },
  { id: 'c1', name: 'Blower Motor Replacement', category: 'Major Components', cost: 750 },
  { id: 'c2', name: 'Condenser Fan Motor', category: 'Major Components', cost: 680 },
  { id: 'c3', name: 'Inducer Motor Replacement', category: 'Major Components', cost: 810 },
  { id: 'e1', name: 'Capacitor Replacement', category: 'Electrical & Controls', cost: 215 },
  { id: 'e2', name: 'Contactor Replacement', category: 'Electrical & Controls', cost: 250 },
  { id: 'e3', name: 'Thermostat Install', category: 'Electrical & Controls', cost: 300 },
];

// --- SAMPLE DATA ---
const sampleClients = [
  { id: 1, name: "Sampler Stores", address: "9750 Quivira Rd, Lenexa, KS 66215, USA", phone: "000000000" },
  { id: 2, name: "Nest Facilitate", address: "550 Crescent Blvd, Brooklawn, NJ 08030, USA", phone: "8446503721" },
  { id: 3, name: "Floor & Decor", address: "44075 West 12 Mile Rd, NOVI, MI 48377", phone: "248-675-3688" },
  { id: 4, name: "Downtown Office Complex", address: "1234 Woodward Ave, Detroit, MI 48226", phone: "(313) 555-0456" },
  { id: 5, name: "Greenfield Manufacturing", address: "5678 Industrial Blvd, Detroit, MI 48210", phone: "(313) 555-0789" },
];

const sampleWorkOrders = [
  {
    id: 'internal-001', workOrderNumber: '6725562-01', customerName: "Floor & Decor",
    locationNumber: "230", customerPhone: "248-675-3688",
    serviceAddress: "44075 West 12 Mile Rd, NOVI, MI 48377", 
    serviceType: "Mechanical Temp", priority: "urgent", category: "Heating & Cooling",
    description: "Second floor cooling is not working. Feels like the heaters are on.",
    siteInstructions: "Landlord handling Snow removal PM",
    punchList: "NEST HVAC Providers should not be replacing filters while on site.",
    estimatedCost: "12500",
    scheduleDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'completed',
    toBeTokenized: true,
    tokenizationStatus: 'awaiting-approval',
    serviceReportUrl: 'https://example.com/report-001.pdf',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isSynced: true,
  },
  {
    id: 'internal-002', workOrderNumber: '6725562-02', customerName: "Downtown Office Complex",
    locationNumber: "101", customerPhone: "(313) 555-0456",
    serviceAddress: "1234 Woodward Ave, Detroit, MI 48226", 
    serviceType: "installation", priority: "medium", category: "HVAC Systems",
    description: "Install new HVAC system for 5th floor expansion.",
    siteInstructions: "Check in with front desk upon arrival.",
    punchList: "",
    estimatedCost: "18750",
    scheduleDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'completed',
    toBeTokenized: true,
    tokenizationStatus: 'pending',
    serviceReportUrl: null,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    isSynced: false,
  },
];

// --- NOTIFICATION CONTEXT ---
const NotificationContext = createContext();

const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const askConfirmation = ({ message, onConfirm }) => {
    return new Promise((resolve) => {
      setConfirmation({
        message,
        onConfirm: () => {
          setConfirmation(null);
          onConfirm();
          resolve(true);
        },
        onCancel: () => {
          setConfirmation(null);
          resolve(false);
        },
      });
    });
  };

  return (
    <NotificationContext.Provider value={{ showNotification, askConfirmation }}>
      {children}
      {notification && (
        <div className={`fixed top-5 right-5 z-[100] p-4 rounded-lg shadow-lg text-white animate-fade-in-down ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {notification.message}
        </div>
      )}
      {confirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Confirm Action</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{confirmation.message}</p>
            <div className="flex justify-end gap-3">
              <button onClick={confirmation.onCancel} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold">
                Cancel
              </button>
              <button onClick={confirmation.onConfirm} className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

const useNotifier = () => useContext(NotificationContext);

// --- WALLET HOOK ---
const useWallet = () => {
  const [wallet, setWallet] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useNotifier();

  const loadEthers = useCallback(async () => {
    if (window.ethers) return window.ethers;
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/ethers/5.7.2/ethers.umd.min.js';
    document.head.appendChild(script);
    return new Promise((resolve, reject) => {
      script.onload = () => resolve(window.ethers);
      script.onerror = () => reject(new Error('Ethers.js failed to load.'));
    });
  }, []);

  const addPlumeNetwork = useCallback(async (provider) => {
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: PLUME_NETWORK.chainId }],
      });
    } catch (switchError) {
      if (switchError.code === 4902 || switchError.code === -32603) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [PLUME_NETWORK],
          });
        } catch (addError) {
          showNotification('Failed to add Plume network.', 'error');
        }
      }
    }
  }, [showNotification]);

  const connect = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      showNotification('No Web3 wallet detected. Please install one.', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const ethers = await loadEthers();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      
      if (accounts.length > 0) {
        await addPlumeNetwork(provider);
        const signer = provider.getSigner();
        setWallet({ provider, signer, account: accounts[0] });
        showNotification(`Wallet connected successfully!`, 'success');
      }
    } catch (error) {
      console.error('Connection error:', error);
      showNotification(error.code === 4001 ? 'Connection request cancelled.' : 'Failed to connect wallet.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [loadEthers, addPlumeNetwork, showNotification]);

  const disconnect = useCallback(() => {
    setWallet(null);
    showNotification('Wallet disconnected.', 'success');
  }, [showNotification]);

  return { wallet, connect, disconnect, isLoading };
};

// --- CONTRACT DATA HOOK ---
const useContractData = (wallet) => {
  const [data, setData] = useState({
    availableTokens: '0', contractBalance: '0', userBalance: '0',
    totalReserve: '0', totalSupply: '0', nextWorkOrderId: '1'
  });
  const [isLoading, setIsLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!wallet) return;
    setIsLoading(true);
    try {
      const { provider, account } = wallet;
      const ethers = window.ethers;
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      const [availableTokens, contractBalance, userBalance, totalReserve, totalSupply, nextWorkOrderId] = await Promise.all([
        contract.availableTokens(), contract.contractBalance(), contract.balanceOf(account),
        contract.totalReserveFund(), contract.totalSupply(), contract.nextWorkOrderId()
      ]);

      setData({
        availableTokens: ethers.utils.formatEther(availableTokens),
        contractBalance: ethers.utils.formatEther(contractBalance),
        userBalance: ethers.utils.formatEther(userBalance),
        totalReserve: ethers.utils.formatEther(totalReserve),
        totalSupply: ethers.utils.formatEther(totalSupply),
        nextWorkOrderId: nextWorkOrderId.toString()
      });
    } catch (error) {
      console.error('Failed to load contract data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [wallet]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { contractData: data, loadContractData: loadData, isLoadingContract: isLoading };
};

// --- PDF GENERATION UTILITY ---
const generatePdf = (jobState) => {
  if (!window.jspdf) {
    alert("PDF generation library is not loaded yet. Please try again in a moment.");
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const { customerInfo, units, subtotal, customerPrice, pdfOption } = jobState;
  let y = 20;

  doc.setFontSize(20);
  doc.text("HVAC Service Department", 105, y, { align: 'center' });
  y += 8;
  doc.setFontSize(10);
  doc.text("Powered by Service Coin", 105, y, { align: 'center' });
  y += 15;

  doc.setFontSize(12);
  doc.text("Customer Information", 14, y);
  doc.line(14, y + 2, 196, y + 2);
  y += 8;
  doc.setFontSize(10);
  doc.text(`Name: ${customerInfo.name}`, 14, y);
  doc.text(`Contact: ${customerInfo.contact}`, 80, y);
  y += 6;
  doc.text(`Address: ${customerInfo.address}`, 14, y);
  y += 15;

  doc.setFontSize(12);
  doc.text("Work Performed", 14, y);
  doc.line(14, y + 2, 196, y + 2);
  y += 8;
  doc.setFontSize(10);

  units.forEach(unit => {
    doc.setFont(undefined, 'bold');
    doc.text(`Unit: ${unit.name} (${unit.type}) - ${unit.brand}`, 14, y);
    doc.setFont(undefined, 'normal');
    y += 6;
    unit.services.forEach(service => {
      const priceString = pdfOption === 't&m' ? ` - $${service.cost}` : '';
      doc.text(`- ${service.name}${priceString}`, 20, y);
      y += 6;
    });
    y += 4;
  });
  y += 10;

  doc.setFontSize(12);
  doc.text("Billing Summary", 14, y);
  doc.line(14, y + 2, 196, y + 2);
  y += 10;
  doc.setFont(undefined, 'bold');
  doc.setFontSize(14);

  if (pdfOption === 'flatRate') {
    doc.text("Total Investment:", 14, y);
    doc.text(customerPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' }), 196, y, { align: 'right' });
  } else if (pdfOption === 't&m') {
    doc.setFontSize(10);
    doc.text("Subtotal (Total Cost):", 14, y);
    doc.text(subtotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' }), 196, y, { align: 'right' });
    y += 10;
    doc.setFont(undefined, 'bold');
    doc.setFontSize(14);
    doc.text("Total Investment:", 14, y);
    doc.text(customerPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' }), 196, y, { align: 'right' });
  }

  doc.save(`Quote-${customerInfo.name || 'Service'}.pdf`);
};

// --- MAIN APP COMPONENT ---
const AppContent = () => {
  const { wallet, connect, disconnect, isLoading: isWalletLoading } = useWallet();
  const { contractData, loadContractData, isLoadingContract } = useContractData(wallet);
  const { showNotification, askConfirmation } = useNotifier();
  
  const [currentView, setCurrentView] = useState('dashboard');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [workOrders, setWorkOrders] = useState(sampleWorkOrders);
  const [clients, setClients] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');

  const isLoading = isWalletLoading || isLoadingContract;

  useEffect(() => {
    document.documentElement.classList.add('dark');
    setClients(sampleClients);
    
    // Load jsPDF script
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const filteredWorkOrders = useMemo(() => {
    if (statusFilter === 'All') {
      return workOrders;
    }
    return workOrders.filter(order => order.status === statusFilter);
  }, [workOrders, statusFilter]);

  const handleCreateWorkOrder = async (newWorkOrder) => {
    const internalId = `internal-${Date.now()}`;
    const newEntry = { 
      ...newWorkOrder, 
      id: internalId,
      status: 'scheduled', 
      tokenizationStatus: newWorkOrder.toBeTokenized ? 'pending' : 'not-applicable',
      serviceReportUrl: null,
      createdAt: new Date().toISOString(),
      isSynced: false,
    };
    
    setWorkOrders(prev => [newEntry, ...prev]);
    setShowCreateModal(false);
    showNotification(`Work Order ${newWorkOrder.workOrderNumber} created!`, 'success');
  };

  const handleUpdateStatus = (workOrderId, newStatus) => {
    setWorkOrders(prev => prev.map(wo => wo.id === workOrderId ? { 
      ...wo, 
      status: newStatus, 
      updatedAt: new Date().toISOString(), 
      completedAt: newStatus === 'completed' ? new Date().toISOString() : wo.completedAt 
    } : wo));
    showNotification('Job status updated.', 'success');
  };

  const handleCancelOrDelete = async (workOrder) => {
    if (workOrder.status === 'cancelled') {
      const confirmed = await askConfirmation({ message: 'This will permanently delete the work order. Continue?' });
      if (confirmed) {
        setWorkOrders(prev => prev.filter(wo => wo.id !== workOrder.id));
        showNotification('Work order permanently deleted.', 'success');
      }
    } else {
      const confirmed = await askConfirmation({ message: 'Are you sure you want to cancel this work order?' });
      if (confirmed) {
        handleUpdateStatus(workOrder.id, 'cancelled');
        showNotification('Work order cancelled.', 'success');
      }
    }
  };

  const handleUploadReport = (workOrderId) => {
    if (!wallet) return showNotification('Please connect your wallet to upload a report.', 'error');
    const reportUrl = prompt("Enter the URL of the service report:", "https://example.com/report.pdf");
    if (reportUrl) {
      setWorkOrders(prev => prev.map(wo => wo.id === workOrderId ? { 
        ...wo, 
        serviceReportUrl: reportUrl,
        tokenizationStatus: 'awaiting-approval'
      } : wo));
      showNotification('Service report uploaded. Ready for approval.', 'success');
    }
  };

  const mintTokens = async (item) => {
    if (!wallet) return showNotification('Please connect your wallet first!', 'error');
    const yieldAmount = (parseFloat(item.estimatedCost) / 1000).toFixed(3);
    const description = `Work Order ${item.workOrderNumber}`;

    try {
      const ethers = window.ethers;
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet.signer);
      const grossYieldWei = ethers.utils.parseEther(yieldAmount.toString());
      const tx = await contract.mintFromWorkOrder(grossYieldWei, description);
      await tx.wait();
      setWorkOrders(prev => prev.map(wo => wo.id === item.id ? { 
        ...wo, 
        tokenizationStatus: 'tokenized', 
        tokenizedAt: new Date().toISOString() 
      } : wo));
      await loadContractData();
      showNotification('Successfully tokenized!', 'success');
    } catch (error) {
      console.error("Tokenization failed:", error);
      showNotification(error.reason || 'Tokenization failed.', 'error');
    }
  };

  const handleApproveAndTokenize = async (item) => {
    if (!wallet) return showNotification('Please connect your wallet to approve tokenization.', 'error');
    const confirmed = await askConfirmation({ message: 'You are about to approve this and mint tokens on the blockchain. This is irreversible. Continue?' });
    if (confirmed) {
      await mintTokens(item);
    }
  };

  const viewDetails = (workOrder) => {
    setSelectedWorkOrder(workOrder);
    setShowDetailsModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 font-sans text-gray-200 flex flex-col">
      <Header 
        wallet={wallet} 
        isLoading={isLoading}
        onConnect={connect}
        onDisconnect={disconnect}
        currentView={currentView}
        onViewChange={setCurrentView}
      />
      
      <main className="px-8 py-8 relative z-10 flex-grow">
        {currentView === 'dashboard' && (
          <>
            <DashboardMetrics 
              wallet={wallet}
              contractData={contractData}
              items={workOrders}
            />
            <TradingInterface 
              wallet={wallet}
              contractData={contractData}
              loadContractData={loadContractData}
              showNotification={showNotification}
            />
            <ManagementSection
              wallet={wallet}
              items={filteredWorkOrders}
              onShowCreate={() => setShowCreateModal(true)}
              onCancelOrDelete={handleCancelOrDelete}
              onUpdateStatus={handleUpdateStatus}
              onUploadReport={handleUploadReport}
              onApproveAndTokenize={handleApproveAndTokenize}
              onViewDetails={viewDetails}
              isLoading={isLoading}
              currentFilter={statusFilter}
              onSetFilter={setStatusFilter}
            />
          </>
        )}
        
        {currentView === 'quoting' && (
          <FieldQuotingTool 
            onCreateWorkOrder={handleCreateWorkOrder}
            onCancel={() => setCurrentView('dashboard')}
          />
        )}
        
        {currentView === 'work-orders' && (
          <ManagementSection
            wallet={wallet}
            items={filteredWorkOrders}
            onShowCreate={() => setShowCreateModal(true)}
            onCancelOrDelete={handleCancelOrDelete}
            onUpdateStatus={handleUpdateStatus}
            onUploadReport={handleUploadReport}
            onApproveAndTokenize={handleApproveAndTokenize}
            onViewDetails={viewDetails}
            isLoading={isLoading}
            currentFilter={statusFilter}
            onSetFilter={setStatusFilter}
          />
        )}
      </main>
      
      <Footer />

      {showCreateModal && (
        <CreateWorkOrderModal
          clients={clients}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateWorkOrder}
        />
      )}

      {showDetailsModal && selectedWorkOrder && (
        <WorkOrderDetailsModal
          workOrder={selectedWorkOrder}
          onClose={() => setShowDetailsModal(false)}
          onApproveAndTokenize={handleApproveAndTokenize}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

// --- UI COMPONENTS ---

const Header = ({ wallet, isLoading, onConnect, onDisconnect, currentView, onViewChange }) => (
  <header className="sticky top-0 z-50 backdrop-blur-xl bg-gray-900/80 border-b border-gray-700 shadow-lg">
    <div className="px-8 py-6 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
            <Wrench className="w-7 h-7 text-white" />
          </div>
          <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full ${wallet ? 'bg-green-500' : 'bg-gray-400'} animate-pulse shadow-md border-2 border-gray-900`}></div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-blue-200">WorkYield Platform</h1>
          <p className="text-blue-400 text-sm font-medium">
            {wallet ? `🟢 Connected: ${wallet.account.slice(0,6)}...${wallet.account.slice(-4)}` : '🔵 Professional HVAC Tokenization Platform'}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <nav className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1">
          <button 
            onClick={() => onViewChange('dashboard')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${currentView === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}
          >
            <Home className="w-4 h-4" />
            Dashboard
          </button>
          <button 
            onClick={() => onViewChange('quoting')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${currentView === 'quoting' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}
          >
            <Calculator className="w-4 h-4" />
            Field Quoting
          </button>
          <button 
            onClick={() => onViewChange('work-orders')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${currentView === 'work-orders' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}
          >
            <FileText className="w-4 h-4" />
            Work Orders
          </button>
        </nav>
        
        <button onClick={wallet ? onDisconnect : onConnect} disabled={isLoading} className={`px-8 py-3 rounded-full font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg ${wallet ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-900/50' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/50'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {isLoading ? 'Connecting...' : wallet ? 'Disconnect' : 'Connect Wallet'}
        </button>
      </div>
    </div>
  </header>
);

const DashboardMetrics = ({ wallet, contractData, items }) => (
  <div className="mb-12">
    <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-6 mb-8 text-white shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Platform Live</h2>
          <p className="text-blue-100">HVAC Service Dispatch and Tokenization</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">{items.length}</div>
          <div className="text-blue-200">Active Work Orders</div>
        </div>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <CleanMetricCard title="Available Tokens" value={wallet ? `${parseFloat(contractData.availableTokens).toLocaleString()} WYT` : '---'} change="Live on-chain" trend="up" icon={Coins} color="blue" subtitle="Ready for trading" />
      <CleanMetricCard title="Your Balance" value={wallet ? `${parseFloat(contractData.userBalance).toFixed(2)} WYT` : '---'} change="Your portfolio" trend="up" icon={Wallet} color="indigo" subtitle={wallet ? `≈ ${(parseFloat(contractData.userBalance) * 0.9).toFixed(2)} PLUME` : "Connect wallet"} />
      <CleanMetricCard title="Contract PLUME" value={wallet ? `${parseFloat(contractData.contractBalance).toFixed(3)} PLUME` : '---'} change="Total liquidity" trend="up" icon={DollarSign} color="sky" subtitle="Platform reserves" />
      <CleanMetricCard title="Reserve Fund" value={wallet ? `${parseFloat(contractData.totalReserve).toFixed(3)} PLUME` : '---'} change="5% protected" trend="up" icon={Shield} color="cyan" subtitle="Security buffer" />
    </div>
  </div>
);

const TradingInterface = ({ wallet, contractData, loadContractData, showNotification }) => {
  const [buyAmount, setBuyAmount] = useState('');
  const [redeemAmount, setRedeemAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!wallet) {
    return (
      <div className="text-center mb-12 p-8 bg-gray-800/50 rounded-2xl border border-gray-700">
        <Wallet className="w-12 h-12 text-blue-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-200">Trading is Disabled</h3>
        <p className="text-gray-400">Please connect your wallet to buy and redeem tokens.</p>
      </div>
    );
  }
  
  const handleTx = async (action, ...args) => {
    setIsLoading(true);
    try {
      const ethers = window.ethers;
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet.signer);
      const tx = await contract[action](...args);
      await tx.wait();
      await loadContractData();
      showNotification('Transaction successful!', 'success');
      return true;
    } catch (error) {
      console.error(`${action} failed:`, error);
      showNotification(error.reason || 'Transaction failed.', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuy = async () => {
    const amount = parseFloat(buyAmount);
    if (!amount || amount <= 0) return showNotification('Invalid amount.', 'error');
    const amountWei = window.ethers.utils.parseEther(buyAmount);
    if (await handleTx('buyTokens', amountWei, { value: amountWei })) { setBuyAmount(''); }
  };

  const handleRedeem = async () => {
    const amount = parseFloat(redeemAmount);
    if (!amount || amount <= 0) return showNotification('Invalid amount.', 'error');
    if (amount > parseFloat(contractData.userBalance)) return showNotification('Insufficient balance.', 'error');
    const amountWei = window.ethers.utils.parseEther(redeemAmount);
    if (await handleTx('redeemTokens', amountWei)) { setRedeemAmount(''); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      <div className="bg-gray-800/50 rounded-3xl border border-gray-700 shadow-lg p-8">
        <h3 className="text-xl font-bold text-blue-200 mb-6 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-blue-400" />Buy Tokens</h3>
        <div className="space-y-4">
          <input type="number" placeholder="Enter amount to buy" value={buyAmount} onChange={(e) => setBuyAmount(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
          <button onClick={handleBuy} disabled={isLoading || !buyAmount} className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all">
            {isLoading ? 'Processing...' : 'Buy Tokens'}
          </button>
        </div>
      </div>
      <div className="bg-gray-800/50 rounded-3xl border border-gray-700 shadow-lg p-8">
        <h3 className="text-xl font-bold text-indigo-200 mb-6 flex items-center gap-2"><ArrowRight className="w-5 h-5 text-indigo-400" />Redeem Tokens</h3>
        <div className="space-y-4">
          <input type="number" placeholder="Enter amount to redeem" value={redeemAmount} onChange={(e) => setRedeemAmount(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-100" />
          <button onClick={handleRedeem} disabled={isLoading || !redeemAmount} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all">
            {isLoading ? 'Processing...' : 'Redeem Tokens'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ManagementSection = ({ wallet, items, onShowCreate, onCancelOrDelete, onUpdateStatus, onUploadReport, onApproveAndTokenize, onViewDetails, isLoading, currentFilter, onSetFilter }) => (
  <div>
    <div className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-2xl font-bold text-blue-200">Work Order Management</h2>
        <p className="text-gray-400 mt-1">Manage your HVAC service calls.</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={currentFilter}
            onChange={(e) => onSetFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg p-2 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="in-progress">In-Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button onClick={onShowCreate} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors">
          <Plus className="w-5 h-5" />Create Work Order
        </button>
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {items.length === 0 ? (
        <div className="col-span-full text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
          <Wrench className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400">No Work Orders Found</h3>
          <p className="text-gray-500">No work orders match the current filter.</p>
        </div>
      ) : (
        items.map(item => (
          <WorkOrderCard 
            key={item.id} 
            workOrder={item} 
            wallet={wallet}
            onUpdateStatus={(status) => onUpdateStatus(item.id, status)} 
            onCancelOrDelete={() => onCancelOrDelete(item)} 
            onViewDetails={() => onViewDetails(item)} 
            onUploadReport={() => onUploadReport(item.id)}
            onApproveAndTokenize={() => onApproveAndTokenize(item)}
            isLoading={isLoading} 
          />
        ))
      )}
    </div>
  </div>
);

const CleanMetricCard = ({ title, value, change, trend, icon: Icon, color, subtitle }) => {
  const colorClasses = {
    blue: { bg: 'from-blue-500 to-blue-600', text: 'text-blue-200', border: 'border-blue-800' },
    indigo: { bg: 'from-indigo-500 to-indigo-600', text: 'text-indigo-200', border: 'border-indigo-800' },
    sky: { bg: 'from-sky-500 to-sky-600', text: 'text-sky-200', border: 'border-sky-800' },
    cyan: { bg: 'from-cyan-500 to-cyan-600', text: 'text-cyan-200', border: 'border-cyan-800' }
  };
  const colors = colorClasses[color];

  return (
    <div className={`group relative overflow-hidden bg-gray-800/50 rounded-3xl border ${colors.border} shadow-lg p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colors.bg} flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${trend === 'up' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
          {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {change}
        </div>
      </div>
      <div>
        <p className={`${colors.text} text-sm font-semibold mb-1`}>{title}</p>
        <p className={`text-2xl font-bold ${colors.text} mb-1`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
    </div>
  );
};

const WorkOrderCard = ({ workOrder, wallet, onUpdateStatus, onCancelOrDelete, onViewDetails, onUploadReport, onApproveAndTokenize, isLoading }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const getStatusPill = (status, type) => {
    const base = "px-2 py-1 rounded-full text-xs font-medium border";
    let colors = "", text = "";
    if (type === 'job') {
      switch (status) {
        case 'scheduled': colors = 'bg-orange-500/20 text-orange-300 border-orange-500/30'; text = 'Scheduled'; break;
        case 'in-progress': colors = 'bg-blue-500/20 text-blue-300 border-blue-500/30'; text = 'In Progress'; break;
        case 'completed': colors = 'bg-green-500/20 text-green-300 border-green-500/30'; text = 'Completed'; break;
        case 'cancelled': colors = 'bg-red-500/20 text-red-300 border-red-500/30'; text = 'Cancelled'; break;
        default: colors = 'bg-gray-700 text-gray-300 border-gray-600'; text = status;
      }
    } else {
       switch (status) {
          case 'pending': colors = 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'; text = 'Pending'; break;
          case 'awaiting-approval': colors = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'; text = 'Awaiting Approval'; break;
          case 'tokenized': colors = 'bg-purple-500/20 text-purple-300 border-purple-500/30'; text = 'Tokenized'; break;
          case 'not-applicable': colors = 'bg-gray-700 text-gray-400 border-gray-600'; text = 'N/A'; break;
          default: colors = 'bg-gray-700 text-gray-300 border-gray-600'; text = status;
      }
    }
    return <span className={`${base} ${colors}`}>{text}</span>;
  };

  const isTokenizationDisabled = !wallet;
  const isCancelled = workOrder.status === 'cancelled';

  return (
    <div className={`bg-gray-800/50 rounded-xl border border-gray-700 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col ${isCancelled ? 'opacity-60' : ''}`}>
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-start justify-between">
          <div>
            <h3 className={`font-bold text-gray-100 ${isCancelled ? 'line-through' : ''}`}>{workOrder.workOrderNumber}</h3>
            <p className="text-sm text-gray-400">{workOrder.customerName}</p>
          </div>
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-500 hover:text-gray-300"><MoreHorizontal className="w-5 h-5" /></button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-700 border border-gray-600 rounded-md shadow-lg z-10">
                <button onClick={() => { onCancelOrDelete(); setMenuOpen(false); }} disabled={workOrder.tokenizationStatus === 'tokenized'} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                  {isCancelled ? <Trash2 size={16} /> : <Ban size={16} />}
                  {isCancelled ? 'Delete Permanently' : 'Cancel Order'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="p-4 space-y-3 flex-grow">
        <p className="text-sm text-gray-300 line-clamp-2">{workOrder.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-300">Job Status</span>
          {getStatusPill(workOrder.status, 'job')}
        </div>
        {workOrder.toBeTokenized && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Tokenization</span>
            {getStatusPill(workOrder.tokenizationStatus, 'tokenization')}
          </div>
        )}
      </div>
      <div className="p-4 border-t border-gray-700/50 space-y-2">
        {workOrder.toBeTokenized && workOrder.status === 'completed' && workOrder.tokenizationStatus === 'pending' && (
          <button onClick={onUploadReport} disabled={isLoading || isTokenizationDisabled} title={isTokenizationDisabled ? "Connect wallet to upload" : ""} className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed">
            <Upload className="w-4 h-4" /> {isLoading ? '...' : 'Upload Report'}
          </button>
        )}
        {workOrder.toBeTokenized && workOrder.tokenizationStatus === 'awaiting-approval' && (
           <button onClick={onApproveAndTokenize} disabled={isLoading || isTokenizationDisabled} title={isTokenizationDisabled ? "Connect wallet to approve" : ""} className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed">
              <CheckCircle className="w-4 h-4" /> {isLoading ? 'Processing...' : 'Approve & Tokenize'}
          </button>
        )}
        {workOrder.toBeTokenized && workOrder.tokenizationStatus === 'tokenized' && (
          <div className="text-center text-purple-400 font-semibold text-sm py-2">✅ Minted Successfully</div>
        )}
        
        <div className="flex space-x-2">
          <button onClick={onViewDetails} className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 py-2 rounded-lg text-sm">Details</button>
          {!isCancelled && workOrder.status === 'scheduled' && <button onClick={() => onUpdateStatus('in-progress')} className="flex-1 bg-blue-500/20 text-blue-300 py-2 rounded-lg text-sm">Start Job</button>}
          {!isCancelled && workOrder.status === 'in-progress' && <button onClick={() => onUpdateStatus('completed')} className="flex-1 bg-green-500/20 text-green-300 py-2 rounded-lg text-sm">Complete Job</button>}
        </div>
      </div>
    </div>
  );
};

// --- FIELD QUOTING TOOL COMPONENTS ---

const CustomerInfoForm = ({ customerInfo, onUpdate }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onUpdate(name, value);
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 shadow-lg">
      <h3 className="text-lg font-bold mb-4 text-gray-100">Customer Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="md:col-span-2">
          <label className="block mb-1 font-medium text-gray-300">Service Address</label>
          <input name="address" value={customerInfo.address} onChange={handleChange} placeholder="123 Main St, Anytown, USA" className="p-3 border border-gray-600 rounded-lg w-full text-gray-100 bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-300">Name</label>
          <input name="name" value={customerInfo.name} onChange={handleChange} placeholder="John Doe" className="p-3 border border-gray-600 rounded-lg w-full text-gray-100 bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-300">Contact (Phone/Email)</label>
          <input name="contact" value={customerInfo.contact} onChange={handleChange} placeholder="555-123-4567" className="p-3 border border-gray-600 rounded-lg w-full text-gray-100 bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
        </div>
      </div>
    </div>
  );
};

const ServiceCatalog = ({ onAddService, activeUnitId }) => {
  const servicesByCategory = React.useMemo(() => {
    return SERVICES_DATA.reduce((acc, service) => {
      (acc[service.category] = acc[service.category] || []).push(service);
      return acc;
    }, {});
  }, []);

  const handleServiceClick = (service) => {
    if (!activeUnitId) {
      alert("Please select or add a unit first!");
      return;
    }
    onAddService(service, activeUnitId);
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 shadow-lg h-full">
      <h3 className="text-lg font-bold mb-4 text-gray-100">Service Catalog</h3>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        {Object.entries(servicesByCategory).map(([category, services]) => (
          <div key={category}>
            <h4 className="font-semibold text-gray-200 border-b border-gray-600 pb-1 mb-2">{category}</h4>
            <ul className="space-y-1">
              {services.map(service => (
                <li key={service.id}>
                  <button onClick={() => handleServiceClick(service)} className="w-full text-left p-3 rounded-lg text-sm text-gray-300 hover:bg-blue-600/20 hover:text-blue-300 transition-colors border border-transparent hover:border-blue-500/30">
                    <div className="flex justify-between items-center">
                      <span>{service.name}</span>
                      <span className="text-xs text-gray-400">${service.cost}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

const UnitManager = ({ units, activeUnitId, onAddUnit, onRemoveUnit, onSelectUnit, onUpdateUnit }) => {
  const activeUnit = units.find(u => u.id === activeUnitId);

  const handleChange = (e) => {
    const { name, value } = e.target;
    onUpdateUnit(activeUnitId, name, value);
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-100">Units on Job Site</h3>
        <div className="space-x-2">
          <button onClick={onAddUnit} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">+ Add Unit</button>
          <button onClick={() => onRemoveUnit(activeUnitId)} disabled={units.length <= 1} className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors">Remove Active</button>
        </div>
      </div>
      <div className="flex border-b border-gray-600 mb-4">
        {units.map(unit => (
          <button key={unit.id} onClick={() => onSelectUnit(unit.id)} className={`py-2 px-4 text-sm font-medium transition-colors ${activeUnitId === unit.id ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}>
            {unit.name}
          </button>
        ))}
      </div>
      {activeUnit && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <input name="name" value={activeUnit.name} onChange={handleChange} placeholder="Unit Name" className="p-3 border border-gray-600 rounded-lg text-gray-100 bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
          <input name="type" value={activeUnit.type} onChange={handleChange} placeholder="Unit Type (e.g., RTU)" className="p-3 border border-gray-600 rounded-lg text-gray-100 bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
          <input name="brand" value={activeUnit.brand} onChange={handleChange} placeholder="Brand" className="p-3 border border-gray-600 rounded-lg text-gray-100 bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
          <input name="model" value={activeUnit.model} onChange={handleChange} placeholder="Model #" className="p-3 border border-gray-600 rounded-lg text-gray-100 bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
          <input name="serial" value={activeUnit.serial} onChange={handleChange} placeholder="Serial #" className="p-3 border border-gray-600 rounded-lg text-gray-100 bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
        </div>
      )}
      
      {activeUnit && activeUnit.services.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold text-gray-200 mb-3">Services for {activeUnit.name}</h4>
          <div className="space-y-2">
            {activeUnit.services.map((service, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-700/50 rounded-lg">
                <span className="text-gray-300 text-sm">{service.name}</span>
                <span className="text-gray-400 text-sm">${service.cost}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const BillingSummary = ({ costs, onUpdateCost, onUpdateMargin, onSubmit, pdfOption, onPdfOptionChange }) => {
  const handleCostChange = (e) => {
    const { name, value } = e.target;
    onUpdateCost(name, parseFloat(value) || 0);
  };
  const handleMarginChange = (e) => onUpdateMargin(parseFloat(e.target.value) || 0);

  return (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 shadow-lg text-gray-100">
      <h3 className="text-lg font-bold mb-4">Job-Wide Summary & Costing</h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm mb-6">
        <div className="flex justify-between items-center">
          <label className="text-gray-300">Delivery / Shipping</label>
          <input type="number" name="delivery" value={costs.additionalCosts.delivery} onChange={handleCostChange} className="p-2 border border-gray-600 rounded-lg w-24 text-right text-gray-100 bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
        </div>
        <div className="flex justify-between items-center">
          <label className="text-gray-300">Equipment Rental</label>
          <input type="number" name="rental" value={costs.additionalCosts.rental} onChange={handleCostChange} className="p-2 border border-gray-600 rounded-lg w-24 text-right text-gray-100 bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
        </div>
        <div className="flex justify-between items-center">
          <label className="text-gray-300">Truck / Trip</label>
          <input type="number" name="trip" value={costs.additionalCosts.trip} onChange={handleCostChange} className="p-2 border border-gray-600 rounded-lg w-24 text-right text-gray-100 bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
        </div>
        <div className="flex justify-between items-center">
          <label className="text-gray-300">Consumables</label>
          <input type="number" name="consumables" value={costs.additionalCosts.consumables} onChange={handleCostChange} className="p-2 border border-gray-600 rounded-lg w-24 text-right text-gray-100 bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
        </div>
      </div>
      <div className="bg-slate-900 text-white p-4 rounded-lg border border-slate-700">
        <h3 className="font-semibold text-lg mb-3 text-slate-200">Billing Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-base font-bold border-t border-slate-600 mt-2 pt-2">
            <span>Subtotal (Total Cost):</span>
            <span className="font-mono">{costs.subtotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
          </div>
          <hr className="border-slate-700 my-2" />
          <div className="flex items-center justify-between">
            <label className="text-sm">Margin:</label>
            <div className="flex items-center">
              <input type="number" value={costs.margin} onChange={handleMarginChange} className="p-1 border border-gray-600 rounded-lg w-20 text-center bg-slate-200 text-black" />
              <span className="ml-2">%</span>
            </div>
          </div>
          <div className="flex justify-between text-xl font-bold text-sky-300 mt-2 pt-2">
            <span>Customer Price:</span>
            <span className="font-mono">{costs.customerPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-300 mb-1">PDF Pricing Display</label>
        <select value={pdfOption} onChange={e => onPdfOptionChange(e.target.value)} className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-100">
          <option value="flatRate">Show Flat Rate Only</option>
          <option value="t&m">Show T&M Breakdown</option>
          <option value="hide">Hide All Pricing</option>
        </select>
      </div>
      <button onClick={onSubmit} className="w-full mt-6 py-3 px-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition duration-200">Generate & Sync to Dashboard</button>
    </div>
  );
};

const FieldQuotingTool = ({ onCreateWorkOrder, onCancel }) => {
  const [jobState, setJobState] = React.useState({
    customerInfo: { name: '', contact: '', address: '' },
    units: [{ id: 1, name: 'Unit 1', type: 'RTU', brand: 'Carrier', model: '', serial: '', notes: '', photos: [], services: [] }],
    additionalCosts: { delivery: 0, rental: 0, trip: 45, consumables: 45 },
    labor: { hours: 0, rate: 125 },
    margin: 30,
    subtotal: 0,
    customerPrice: 0,
    activeUnitId: 1,
    pdfOption: 'flatRate',
  });

  React.useEffect(() => {
    const partsCost = jobState.units.reduce((total, unit) => total + unit.services.reduce((serviceTotal, service) => serviceTotal + service.cost, 0), 0);
    const laborCost = jobState.labor.hours * jobState.labor.rate;
    const miscCost = Object.values(jobState.additionalCosts).reduce((sum, val) => sum + Number(val), 0);
    const subtotal = partsCost + laborCost + miscCost;
    const customerPrice = subtotal > 0 ? subtotal / (1 - jobState.margin / 100) : 0;
    setJobState(prevState => ({ ...prevState, subtotal, customerPrice }));
  }, [jobState.units, jobState.additionalCosts, jobState.labor, jobState.margin]);

  const handleAddService = (service, unitId) => setJobState(prev => ({ ...prev, units: prev.units.map(u => u.id === unitId ? { ...u, services: [...u.services, service] } : u) }));
  
  const handleAddUnit = () => {
    const newUnitId = Date.now();
    const newUnit = { id: newUnitId, name: `Unit ${jobState.units.length + 1}`, type: '', brand: '', model: '', serial: '', services: [] };
    setJobState(prev => ({ ...prev, units: [...prev.units, newUnit], activeUnitId: newUnitId }));
  };
  
  const handleRemoveUnit = (unitIdToRemove) => setJobState(prev => {
    const newUnits = prev.units.filter(u => u.id !== unitIdToRemove);
    return { ...prev, units: newUnits, activeUnitId: (prev.activeUnitId === unitIdToRemove) ? (newUnits[0]?.id || null) : prev.activeUnitId };
  });
  
  const handleSelectUnit = (unitId) => setJobState(prev => ({ ...prev, activeUnitId: unitId }));
  const handleUpdateUnit = (unitId, fieldName, value) => setJobState(prev => ({ ...prev, units: prev.units.map(u => u.id === unitId ? { ...u, [fieldName]: value } : u) }));
  const handleCustomerInfoChange = (fieldName, value) => setJobState(prev => ({ ...prev, customerInfo: { ...prev.customerInfo, [fieldName]: value } }));
  const handleCostChange = (fieldName, value) => setJobState(prev => ({ ...prev, additionalCosts: { ...prev.additionalCosts, [fieldName]: value } }));
  const handleMarginChange = (value) => setJobState(prev => ({ ...prev, margin: value }));
  const handlePdfOptionChange = (value) => setJobState(prev => ({ ...prev, pdfOption: value }));

  const handleCreateAndSync = () => {
    generatePdf(jobState);
    const workOrderData = {
      workOrderNumber: `WO-${Date.now()}`,
      customerName: jobState.customerInfo.name,
      serviceAddress: jobState.customerInfo.address,
      customerPhone: jobState.customerInfo.contact,
      description: `Generated from field tool. Includes ${jobState.units.reduce((p,c) => p + c.services.length, 0)} service items.`,
      estimatedCost: jobState.customerPrice.toFixed(2),
      toBeTokenized: true,
    };
    onCreateWorkOrder(workOrderData);
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-blue-200">Field Quoting Tool</h2>
          <p className="text-gray-400 mt-1">Create detailed quotes and sync to work orders</p>
        </div>
        <button onClick={onCancel} className="text-gray-400 hover:text-blue-400 font-semibold flex items-center gap-2">
          <ArrowUpRight className="w-4 h-4 rotate-180" />
          Back to Dashboard
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ServiceCatalog onAddService={handleAddService} activeUnitId={jobState.activeUnitId} />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <CustomerInfoForm customerInfo={jobState.customerInfo} onUpdate={handleCustomerInfoChange} />
          <UnitManager 
            units={jobState.units} 
            activeUnitId={jobState.activeUnitId} 
            onAddUnit={handleAddUnit} 
            onRemoveUnit={handleRemoveUnit} 
            onSelectUnit={handleSelectUnit} 
            onUpdateUnit={handleUpdateUnit} 
          />
          <BillingSummary 
            costs={jobState} 
            pdfOption={jobState.pdfOption} 
            onUpdateCost={handleCostChange} 
            onUpdateMargin={handleMarginChange} 
            onPdfOptionChange={handlePdfOptionChange} 
            onSubmit={handleCreateAndSync} 
          />
        </div>
      </div>
    </div>
  );
};

// --- MODAL COMPONENTS ---

const Modal = ({ children, title, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
    <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-gray-700">
      <div className="p-6 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-100">{title}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-300"><X /></button>
      </div>
      <div className="p-6 space-y-6 overflow-y-auto">
        {children}
      </div>
    </div>
  </div>
);

const ModalInput = ({ name, value, onChange, placeholder, type = 'text' }) => (
  <input name={name} value={value} onChange={onChange} placeholder={placeholder} type={type} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
);

const ModalTextArea = ({ name, value, onChange, placeholder, rows = 3 }) => (
  <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} rows={rows} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
);

const CreateWorkOrderModal = ({ clients, onClose, onCreate }) => {
  const [workOrder, setWorkOrder] = useState({ 
    workOrderNumber: '', customerName: '', locationNumber: '', serviceAddress: '', customerPhone: '',
    serviceType: 'Mechanical Temp', priority: 'urgent', category: 'Heating & Cooling', scheduleDate: '',
    description: '', siteInstructions: '', punchList: '', estimatedCost: '',
    toBeTokenized: true
  });
  
  const handleClientSelect = (e) => {
    const clientId = e.target.value;
    const selectedClient = clients.find(c => c.id.toString() === clientId);
    if (selectedClient) {
      setWorkOrder(prev => ({
        ...prev,
        customerName: selectedClient.name,
        serviceAddress: selectedClient.address,
        customerPhone: selectedClient.phone,
      }));
    } else {
       setWorkOrder(prev => ({
        ...prev,
        customerName: '', serviceAddress: '', customerPhone: '',
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setWorkOrder(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateClick = () => {
    if (!workOrder.workOrderNumber || !workOrder.customerName || !workOrder.serviceAddress || !workOrder.description || !workOrder.estimatedCost) {
      alert("Please fill in all required fields (*).");
      return;
    }
    onCreate(workOrder);
  };

  return (
    <Modal title="Create New Work Order" onClose={onClose}>
      <fieldset className="border border-gray-600 rounded-lg p-4">
        <legend className="px-2 font-semibold text-gray-300">Client & Job ID</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ModalInput name="workOrderNumber" value={workOrder.workOrderNumber} onChange={handleChange} placeholder="Client Work Order # *" />
          <div>
            <label className="text-sm font-medium text-gray-400 mb-2 block">Select Existing Client</label>
            <select onChange={handleClientSelect} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
              <option value="">-- Or Enter New Client Below --</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>
          <ModalInput name="customerName" value={workOrder.customerName} onChange={handleChange} placeholder="Client Name *" />
          <ModalInput name="serviceAddress" value={workOrder.serviceAddress} onChange={handleChange} placeholder="Service Address *" />
        </div>
      </fieldset>
       <fieldset className="border border-gray-600 rounded-lg p-4">
        <legend className="px-2 font-semibold text-gray-300">Work Details</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ModalInput name="serviceType" value={workOrder.serviceType} onChange={handleChange} placeholder="Service Type" />
          <ModalInput name="priority" value={workOrder.priority} onChange={handleChange} placeholder="Priority" />
          <ModalInput name="category" value={workOrder.category} onChange={handleChange} placeholder="Category" />
          <ModalInput name="scheduleDate" value={workOrder.scheduleDate} onChange={handleChange} placeholder="Schedule Date" type="date" />
        </div>
      </fieldset>
      <fieldset className="border border-gray-600 rounded-lg p-4">
        <legend className="px-2 font-semibold text-gray-300">Descriptions</legend>
        <div className="space-y-4">
          <ModalTextArea name="description" value={workOrder.description} onChange={handleChange} placeholder="Service Description *" />
          <ModalTextArea name="siteInstructions" value={workOrder.siteInstructions} onChange={handleChange} placeholder="Site Instructions" />
          <ModalTextArea name="punchList" value={workOrder.punchList} onChange={handleChange} placeholder="Punch List / Special Notes" />
        </div>
      </fieldset>
       <fieldset className="border border-gray-600 rounded-lg p-4">
        <legend className="px-2 font-semibold text-gray-300">Financial & Tokenization</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <ModalInput name="estimatedCost" type="number" value={workOrder.estimatedCost} onChange={handleChange} placeholder="Estimated Cost ($) *" />
          <div className="flex items-center gap-4 bg-gray-700 p-3 rounded-lg">
            <label htmlFor="toBeTokenized" className="font-medium text-gray-300">Tokenize this Project?</label>
            <button onClick={() => setWorkOrder(p => ({...p, toBeTokenized: !p.toBeTokenized}))} className={`w-12 h-6 rounded-full transition-colors ${workOrder.toBeTokenized ? 'bg-blue-500' : 'bg-gray-400'}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${workOrder.toBeTokenized ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
            </button>
          </div>
        </div>
      </fieldset>
      <div className="flex gap-4 pt-4 border-t border-gray-700">
        <button onClick={onClose} className="flex-1 bg-gray-600 hover:bg-gray-500 text-gray-200 py-3 rounded-lg font-semibold">Cancel</button>
        <button onClick={handleCreateClick} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold">Create & Sync Work Order</button>
      </div>
    </Modal>
  );
};

const WorkOrderDetailsModal = ({ workOrder, onClose, onApproveAndTokenize, isLoading }) => {
  const { showNotification } = useNotifier();

  const generateWorkOrderPdf = () => {
    if (!window.jspdf) {
      showNotification('PDF generation library is not loaded. Please refresh.', 'error');
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text("Work Order", 105, 20, null, null, "center");
    doc.setFontSize(16);
    doc.text(workOrder.workOrderNumber, 105, 28, null, null, "center");

    // Client & Work Details
    doc.setFontSize(12);
    doc.text("Client Details", 14, 40);
    doc.line(14, 42, 196, 42);
    doc.text(`Client: ${workOrder.customerName}`, 14, 50);
    doc.text(`Address: ${workOrder.serviceAddress}`, 14, 57);
    doc.text(`Phone: ${workOrder.customerPhone}`, 14, 64);
    
    doc.text("Work Details", 105, 40);
    doc.text(`Priority: ${workOrder.priority}`, 105, 50);
    doc.text(`Category: ${workOrder.category}`, 105, 57);
    doc.text(`Scheduled: ${workOrder.scheduleDate}`, 105, 64);

    // Service Description
    doc.text("Service Description", 14, 80);
    doc.line(14, 82, 196, 82);
    doc.setFontSize(10);
    const descLines = doc.splitTextToSize(workOrder.description, 182);
    doc.text(descLines, 14, 90);

    doc.save(`WorkOrder-${workOrder.workOrderNumber}.pdf`);
  };

  return (
    <Modal title={`Details for Work Order: ${workOrder.workOrderNumber}`} onClose={onClose}>
       <div className="space-y-4 text-gray-300">
        <p><span className="font-semibold text-gray-100">Customer:</span> {workOrder.customerName}</p>
        <p><span className="font-semibold text-gray-100">Address:</span> {workOrder.serviceAddress}</p>
        <p><span className="font-semibold text-gray-100">Description:</span> {workOrder.description}</p>
        <p><span className="font-semibold text-gray-100">Cost:</span> ${parseFloat(workOrder.estimatedCost).toLocaleString()}</p>
        <p><span className="font-semibold text-gray-100">Job Status:</span> {workOrder.status}</p>
        <p><span className="font-semibold text-gray-100">Tokenization Status:</span> {workOrder.toBeTokenized ? workOrder.tokenizationStatus : 'Not Applicable'}</p>
        {workOrder.serviceReportUrl && <p><span className="font-semibold text-gray-100">Service Report:</span> <a href={workOrder.serviceReportUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">View Report</a></p>}
       </div>
       <div className="pt-4 mt-4 border-t border-gray-700 flex gap-3">
        {workOrder.tokenizationStatus === 'awaiting-approval' && (
          <button onClick={() => onApproveAndTokenize(workOrder)} disabled={isLoading} className="bg-purple-600 text-white px-4 py-2 rounded-lg">Approve & Tokenize</button>
        )}
        <button onClick={generateWorkOrderPdf} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Download size={16} /> Download PDF
        </button>
        <button onClick={onClose} className="bg-gray-600 text-gray-200 px-4 py-2 rounded-lg">Close</button>
       </div>
    </Modal>
  );
};

const Footer = () => (
  <footer className="text-center py-4 border-t border-gray-700">
    <p className="text-gray-500 text-sm">Powered by Service Coin v1.1</p>
  </footer>
);

const App = () => (
  <NotificationProvider>
    <AppContent />
  </NotificationProvider>
);

export default App;
