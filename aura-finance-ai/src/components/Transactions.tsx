import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Camera, 
  Search, 
  Filter, 
  Trash2, 
  Check, 
  X,
  CreditCard,
  ShoppingBag,
  Pizza,
  Bus,
  Activity,
  Zap,
  MoreHorizontal,
  UploadCloud,
  FileText
} from 'lucide-react';
import { useFinance } from '../hooks/useFinance';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { TransactionType } from '../types/finance';
import { aiService } from '../services/aiService';

const Transactions: React.FC = () => {
  const { transactions, addTransaction, deleteTransaction } = useFinance();
  const { profile } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newTx, setNewTx] = useState({
    amount: '',
    description: '',
    category: 'Shopping',
    type: 'expense' as TransactionType,
    date: format(new Date(), 'yyyy-MM-dd')
  });

  const categories = ['Shopping', 'Food', 'Transport', 'Health', 'Utilities', 'Entertainment', 'Income', 'Other'];

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || t.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addTransaction({
      amount: parseFloat(newTx.amount),
      description: newTx.description,
      category: newTx.category,
      type: newTx.type,
      date: new Date(newTx.date).toISOString(),
      createdAt: new Date().toISOString()
    });
    setIsAdding(false);
    setNewTx({ amount: '', description: '', category: 'Shopping', type: 'expense', date: format(new Date(), 'yyyy-MM-dd') });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result?.toString().split(',')[1];
      if (base64) {
        try {
          const result = await aiService.analyzeTicket(base64, profile.uid);
          if (result.amount) {
            await addTransaction({
              amount: result.amount,
              description: result.description || 'Gasto desde Ticket',
              category: result.category || 'Other',
              type: 'expense',
              date: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              smartNotes: result.smartNotes
            });
          }
        } catch (error) {
          console.error("AI Analysis failed", error);
        }
      }
      setIsAnalyzing(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar comercios, categorías..." 
            className="aura-input w-full pl-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <select 
            className="aura-input py-2"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="All">Categorías (Todas)</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button 
            onClick={() => setIsAdding(true)}
            className="aura-button aura-button-primary flex items-center gap-2"
          >
            <Plus size={18} /> Nuevo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Transaction List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-white/2">
              <h3 className="font-display font-bold">Historial de Transacciones</h3>
            </div>
            <div className="max-h-[600px] overflow-y-auto no-scrollbar">
              {filteredTransactions.map((t) => (
                <div key={t.id} className="p-4 border-b border-white/5 flex items-center justify-between hover:bg-white/2 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-white/5 text-aura-accent">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="font-medium">{t.description}</p>
                      <p className="text-xs text-slate-500">{t.category} • {format(new Date(t.date), 'dd/MM/yyyy')}</p>
                      {t.smartNotes && <p className="text-[10px] text-aura-success mt-1 italic font-mono">✨ {t.smartNotes}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className={`font-mono font-bold ${t.type === 'income' ? 'text-aura-success' : 'text-white'}`}>
                      {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                    </p>
                    <button 
                      onClick={() => t.id && deleteTransaction(t.id)}
                      className="p-2 text-slate-600 hover:text-aura-danger transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {filteredTransactions.length === 0 && (
                <div className="p-12 text-center text-slate-500">No se encontraron movimientos.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right: AI Tools & Realtime Balance */}
        <div className="space-y-6">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="glass-card p-6 bg-gradient-to-br from-aura-accent/20 to-aura-success/10 border-aura-accent/30"
          >
            <h4 className="font-display font-bold mb-4 flex items-center gap-2">
              <Camera size={18} className="text-aura-accent" />
              Escanear Ticket
            </h4>
            <p className="text-sm text-slate-400 mb-6">Sube una foto de tu factura y Aura AI la clasificará automáticamente por ti.</p>
            
            <input 
              type="file" 
              accept="image/*" 
              hidden 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
            />
            
            <button 
              disabled={isAnalyzing}
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-8 border-2 border-dashed border-aura-accent/30 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-aura-accent/5 transition-all text-aura-accent"
            >
              {isAnalyzing ? (
                <>
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  >
                    <Zap size={32} />
                  </motion.div>
                  <span className="text-sm font-medium animate-pulse">Analizando con Aura AI...</span>
                </>
              ) : (
                <>
                  <UploadCloud size={32} />
                  <span className="text-sm font-medium">Subir Imagen o Usar Cámara</span>
                </>
              )}
            </button>
          </motion.div>

          <div className="glass-card p-6">
            <h4 className="font-display font-bold mb-4">Balance en Tiempo Real</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Ingreso Mensual</span>
                <span className="font-mono text-aura-success">${profile?.monthlyIncome?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Gastos Acumulados</span>
                <span className="font-mono text-aura-danger">-${transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0).toLocaleString()}</span>
              </div>
              <div className="h-px bg-white/5 my-2" />
              <div className="flex justify-between items-center">
                <span className="font-bold">Restante</span>
                <span className="text-xl font-display font-bold text-aura-accent">
                  ${((profile?.monthlyIncome || 0) - transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0)).toLocaleString()}
                </span>
              </div>
              
              <div className="mt-4 w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0) / (profile?.monthlyIncome || 1)) * 100)}%` }}
                  className={`h-full ${
                    (transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0) / (profile?.monthlyIncome || 1)) > 0.8 
                      ? 'bg-aura-danger' : 'bg-aura-accent'
                  }`}
                />
              </div>
              <p className="text-[10px] text-center text-slate-500 uppercase tracking-widest mt-1">Consumo del presupuesto mensual</p>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Entry Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-aura-bg/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card w-full max-w-md p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-display font-bold">Añadir Transacción</h3>
                <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-white/5 rounded-full"><X size={20} /></button>
              </div>

              <form onSubmit={handleManualAdd} className="space-y-4">
                <div className="flex gap-2 p-1 bg-white/5 rounded-2xl mb-4">
                  {['expense', 'income'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewTx({ ...newTx, type: t as TransactionType })}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                        newTx.type === t ? 'bg-aura-accent text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {t === 'expense' ? 'Gasto' : 'Ingreso'}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-xs text-slate-500 mb-1 block px-2 uppercase">Monto</label>
                  <input 
                    type="number" 
                    required 
                    placeholder="0.00" 
                    className="aura-input w-full text-2xl font-display font-bold"
                    value={newTx.amount}
                    onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500 mb-1 block px-2 uppercase">Descripción</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Ej. Almuerzo, Uber, Sueldo..." 
                    className="aura-input w-full"
                    value={newTx.description}
                    onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block px-2 uppercase">Categoría</label>
                    <select 
                      className="aura-input w-full"
                      value={newTx.category}
                      onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block px-2 uppercase">Fecha</label>
                    <input 
                      type="date" 
                      required 
                      className="aura-input w-full"
                      value={newTx.date}
                      onChange={(e) => setNewTx({ ...newTx, date: e.target.value })}
                    />
                  </div>
                </div>

                <button type="submit" className="aura-button aura-button-primary w-full mt-4 flex items-center justify-center gap-2">
                  <Check size={18} /> Guardar Transacción
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Transactions;
