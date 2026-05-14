import { AuthProvider, useAuth } from './context/AuthContext';
import { useFinance } from './hooks/useFinance';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Receipt, 
  Target, 
  TrendingUp, 
  Wallet, 
  LogOut, 
  User as UserIcon,
  Bot,
  Plus,
  Camera,
  MessageSquare,
  ChevronRight,
  TrendingDown,
  Info
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Goals from './components/Goals';
import Investments from './components/Investments';
import AuraAssistant from './components/AuraAssistant';
import Login from './components/Login';

const AppContent = () => {
  const { user, profile, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-aura-bg">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-16 h-16 rounded-full bg-aura-accent blur-xl"
        />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Panel' },
    { id: 'transactions', icon: Receipt, label: 'Gastos' },
    { id: 'goals', icon: Target, label: 'Metas' },
    { id: 'investments', icon: TrendingUp, label: 'Inversiones' },
  ];

  return (
    <div className="flex h-screen bg-aura-bg overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-20 md:w-64 flex flex-col items-center py-8 border-r border-white/5 bg-white/2 backdrop-blur-sm">
        <div className="mb-12 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-aura-accent to-aura-success flex items-center justify-center shadow-lg shadow-aura-accent/20">
            <Bot className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-display font-bold hidden md:block bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Aura AI</h1>
        </div>

        <nav className="flex-1 w-full px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-aura-accent/10 border border-aura-accent/20 text-aura-accent' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium hidden md:block">{item.label}</span>
              {activeTab === item.id && (
                <motion.div layoutId="nav-glow" className="ml-auto w-1.5 h-1.5 rounded-full bg-aura-accent shadow-[0_0_8px_currentColor] hidden md:block" />
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto w-full px-4 pt-8 border-t border-white/5">
          <div className="flex items-center gap-3 p-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/10">
              {user.photoURL ? <img src={user.photoURL} alt="User" /> : <UserIcon size={20} />}
            </div>
            <div className="hidden md:block overflow-hidden">
              <p className="text-sm font-medium truncate">{profile?.displayName || user.displayName}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-400 hover:bg-aura-danger/10 hover:text-aura-danger transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium hidden md:block">Salir</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto no-scrollbar">
        <header className="sticky top-0 z-40 w-full px-8 py-6 flex justify-between items-center bg-aura-bg/80 backdrop-blur-md">
          <div>
            <h2 className="text-2xl font-display font-bold">
              {navItems.find(i => i.id === activeTab)?.label}
            </h2>
            <p className="text-sm text-slate-500">Gestión inteligente de tu capital</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsAssistantOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-medium"
            >
              <Bot size={18} className="text-aura-accent" />
              <span className="hidden sm:inline">Hablar con Aura</span>
            </button>
          </div>
        </header>

        <div className="px-8 pb-32">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'transactions' && <Transactions />}
              {activeTab === 'goals' && <Goals />}
              {activeTab === 'investments' && <Investments />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Aura Assistant Sidebar */}
        <AuraAssistant isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

