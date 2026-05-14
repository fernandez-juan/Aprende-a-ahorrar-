import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  ChevronRight,
  Info,
  DollarSign,
  Sparkles
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useFinance } from '../hooks/useFinance';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { FinancialInsight } from '../types/finance';
import { aiService } from '../services/aiService';

const Dashboard: React.FC = () => {
  const { transactions, goals, isLoading } = useFinance();
  const { profile, updateProfile } = useAuth();

  const [isSettingIncome, setIsSettingIncome] = useState(false);
  const [newIncome, setNewIncome] = useState('');
  const [insights, setInsights] = useState<FinancialInsight[]>([]);

  useEffect(() => {
    if (profile && profile.monthlyIncome === 0) {
      setIsSettingIncome(true);
    }
  }, [profile]);

  useEffect(() => {
    const fetchInsights = async () => {
      if (transactions.length > 5 && profile && profile.monthlyIncome > 0) {
        try {
          const data = await aiService.getInsights({
            transactions,
            income: profile.monthlyIncome,
            goals
          });
          setInsights(data);
        } catch (e) {
          console.error("Failed to fetch insights", e);
        }
      }
    };
    fetchInsights();
  }, [transactions.length, profile?.monthlyIncome]);

  const handleSaveIncome = async () => {
    if (newIncome) {
      await updateProfile({ monthlyIncome: parseFloat(newIncome) });
      setIsSettingIncome(false);
    }
  };

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);
  
  const totalIncome = (profile?.monthlyIncome || 0) + transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const categoryData = Object.entries(
    transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  const recentActivity = transactions.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div whileHover={{ y: -5 }} className="glass-card p-6 border-l-4 border-aura-accent">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-aura-accent/10 rounded-2xl text-aura-accent"><Wallet size={24} /></div>
            <span className="text-xs font-mono text-aura-success bg-aura-success/10 px-2 py-1 rounded-lg">Balance Vivo</span>
          </div>
          <p className="text-slate-400 text-sm mb-1">Balance Disponible</p>
          <h3 className="text-3xl font-display font-bold text-white">${balance.toLocaleString()}</h3>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="glass-card p-6 border-l-4 border-aura-success">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-aura-success/10 rounded-2xl text-aura-success"><TrendingUp size={24} /></div>
          </div>
          <p className="text-slate-400 text-sm mb-1">Ingresos Totales (Mes)</p>
          <h3 className="text-3xl font-display font-bold text-white">${totalIncome.toLocaleString()}</h3>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="glass-card p-6 border-l-4 border-aura-danger">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-aura-danger/10 rounded-2xl text-aura-danger"><TrendingDown size={24} /></div>
          </div>
          <p className="text-slate-400 text-sm mb-1">Gastos Totales (Mes)</p>
          <h3 className="text-3xl font-display font-bold text-white">${totalExpenses.toLocaleString()}</h3>
        </motion.div>
      </div>

      {/* AI Insights Bar */}
      {insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((insight, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              key={i}
              className={`p-4 rounded-2xl border flex gap-3 ${
                insight.impact === 'positive' ? 'bg-aura-success/5 border-aura-success/20' : 
                insight.impact === 'negative' ? 'bg-aura-danger/5 border-aura-danger/20' : 
                'bg-aura-accent/5 border-aura-accent/20'
              }`}
            >
              <div className="shrink-0 p-2 rounded-lg bg-white/5">
                <Sparkles size={16} className={insight.impact === 'positive' ? 'text-aura-success' : 'text-aura-accent'} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-tight text-white/80">{insight.title}</p>
                <p className="text-[11px] text-slate-400 mt-1 leading-tight">{insight.message}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 h-[400px] flex flex-col">
          <h4 className="font-display font-bold flex items-center gap-2 mb-6">
            <Calendar size={18} className="text-aura-accent" />
            Flujo de Caja Real
          </h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={transactions.slice().reverse().slice(-10)}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => val ? format(new Date(val), 'MMM d') : ''} 
                  stroke="#64748b" 
                  fontSize={10}
                />
                <YAxis stroke="#64748b" fontSize={10} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 h-[400px] flex flex-col">
          <h4 className="font-display font-bold flex items-center gap-2 mb-6">
            <TrendingUp size={18} className="text-aura-accent" />
            Análisis de Categorías
          </h4>
          <div className="flex-1 flex flex-col items-center">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 italic opacity-50">
                <Info size={40} className="mb-2" />
                <p>Sin datos suficientes</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4 w-full">
              {categoryData.slice(0, 4).map((cat, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px]">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-slate-400 truncate w-24">{cat.name}</span>
                  <span className="ml-auto font-mono text-white">${cat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity */}
      <div className="glass-card p-6">
        <h4 className="font-display font-bold mb-6">Movimientos Críticos</h4>
        <div className="space-y-4">
          {recentActivity.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/2 border border-white/5">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${t.type === 'income' ? 'bg-aura-success/10 text-aura-success' : 'bg-aura-accent/10 text-aura-accent'}`}>
                  {t.type === 'income' ? <TrendingUp size={20} /> : <Wallet size={20} />}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.description}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">{t.category}</p>
                </div>
              </div>
              <p className="font-display font-bold">${t.amount.toLocaleString()}</p>
            </div>
          ))}
          {recentActivity.length === 0 && <div className="py-12 text-center text-slate-500 italic text-sm">Tu historial financiero aparecerá aquí.</div>}
        </div>
      </div>

      {/* Income Modal */}
      <AnimatePresence>
        {isSettingIncome && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-aura-bg/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card max-w-sm w-full p-8 text-center ring-2 ring-aura-accent/20">
              <div className="w-16 h-16 rounded-2xl bg-aura-accent/20 text-aura-accent flex items-center justify-center mx-auto mb-6"><DollarSign size={32} /></div>
              <h3 className="text-2xl font-display font-bold mb-2">Bienvenido a Aura</h3>
              <p className="text-sm text-slate-400 mb-8">Define tu ingreso mensual para que Aura empiece a predecir tu futuro financiero.</p>
              <div className="relative mb-6">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                <input type="number" autoFocus placeholder="Sueldo base..." className="aura-input w-full pl-8" value={newIncome} onChange={(e) => setNewIncome(e.target.value)} />
              </div>
              <button onClick={handleSaveIncome} disabled={!newIncome} className="aura-button aura-button-primary w-full shadow-lg shadow-aura-accent/20">
                Inicializar Aura
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
