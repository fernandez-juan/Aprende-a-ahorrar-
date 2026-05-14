import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Plus, 
  ArrowUpRight, 
  PieChart as PieIcon, 
  BarChart3, 
  Activity,
  DollarSign,
  Globe,
  Briefcase,
  TrendingDown
} from 'lucide-react';
import { useFinance } from '../hooks/useFinance';

const Investments: React.FC = () => {
  const { investments, addInvestment } = useFinance();
  const [isAdding, setIsAdding] = useState(false);
  const [newInv, setNewInv] = useState({
    assetName: '',
    symbol: '',
    initialValue: '',
    currentValue: '',
    type: 'Stocks'
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addInvestment({
      assetName: newInv.assetName,
      symbol: newInv.symbol,
      initialValue: parseFloat(newInv.initialValue),
      currentValue: parseFloat(newInv.currentValue),
      purchaseDate: new Date().toISOString(),
      type: newInv.type
    });
    setIsAdding(false);
    setNewInv({ assetName: '', symbol: '', initialValue: '', currentValue: '', type: 'Stocks' });
  };

  const totalValue = investments.reduce((acc, inv) => acc + inv.currentValue, 0);
  const totalGain = investments.reduce((acc, inv) => acc + (inv.currentValue - inv.initialValue), 0);
  const gainPercentage = totalValue > 0 ? (totalGain / (totalValue - totalGain)) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Portfolio Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 bg-gradient-to-br from-aura-accent/10 to-transparent">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Valor Total Portafolio</p>
          <div className="flex items-center gap-3">
            <h3 className="text-4xl font-display font-bold text-white">${totalValue.toLocaleString()}</h3>
            <div className={`flex items-center text-xs px-2 py-1 rounded-full ${totalGain >= 0 ? 'bg-aura-success/10 text-aura-success' : 'bg-aura-danger/10 text-aura-danger'}`}>
              <ArrowUpRight size={12} className="mr-1" />
              {gainPercentage.toFixed(2)}%
            </div>
          </div>
        </div>
        <div className="glass-card p-6">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Plusvalía Total</p>
          <h3 className={`text-3xl font-display font-bold ${totalGain >= 0 ? 'text-aura-success' : 'text-aura-danger'}`}>
            {totalGain >= 0 ? '+' : ''}${totalGain.toLocaleString()}
          </h3>
        </div>
        <div className="glass-card p-6 flex items-center justify-center">
          <button 
            onClick={() => setIsAdding(true)}
            className="aura-button aura-button-primary w-full max-w-xs flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Registrar Activo
          </button>
        </div>
      </div>

      {/* Asset List */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 bg-white/2 border-b border-white/5 flex justify-between items-center">
          <h4 className="font-display font-bold">Mis Activos</h4>
          <div className="flex gap-2">
            <button className="p-2 bg-white/5 rounded-lg text-aura-accent"><BarChart3 size={18} /></button>
            <button className="p-2 bg-white/5 rounded-lg text-slate-400"><PieIcon size={18} /></button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase text-slate-500 border-b border-white/5">
                <th className="px-6 py-4 font-medium">Activo</th>
                <th className="px-6 py-4 font-medium">Tipo</th>
                <th className="px-6 py-4 font-medium text-right">Inversión</th>
                <th className="px-6 py-4 font-medium text-right">Valor Actual</th>
                <th className="px-6 py-4 font-medium text-right">Retorno (%)</th>
              </tr>
            </thead>
            <tbody>
              {investments.map((inv, i) => {
                const gain = inv.currentValue - inv.initialValue;
                const perc = (gain / inv.initialValue) * 100;
                
                return (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    key={inv.id} 
                    className="border-b border-white/5 hover:bg-white/2 transition-all cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-aura-accent border border-white/10 font-bold">
                          {inv.symbol.slice(0, 3)}
                        </div>
                        <div>
                          <p className="font-medium">{inv.assetName}</p>
                          <p className="text-xs text-slate-500">{inv.symbol}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                        {inv.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono">${inv.initialValue.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-mono font-bold">${inv.currentValue.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className={`flex items-center justify-end font-mono font-bold ${gain >= 0 ? 'text-aura-success' : 'text-aura-danger'}`}>
                        {gain >= 0 ? <ArrowUpRight size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                        {perc.toFixed(2)}%
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
              {investments.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-500 italic">
                    No tienes activos registrados. Empieza a construir tu portafolio hoy.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Asset Dialog */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-aura-bg/80 backdrop-blur-sm px-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card w-full max-w-lg p-8"
          >
            <h3 className="text-xl font-display font-bold mb-6">Registrar Activo</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 uppercase px-2 mb-1 block">Nombre del Activo</label>
                  <input required className="aura-input w-full" placeholder="Ej. Apple Inc" value={newInv.assetName} onChange={e => setNewInv({ ...newInv, assetName: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase px-2 mb-1 block">Símbolo</label>
                  <input required className="aura-input w-full uppercase" placeholder="AAPL" value={newInv.symbol} onChange={e => setNewInv({ ...newInv, symbol: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 uppercase px-2 mb-1 block">Inversión Inicial</label>
                  <input type="number" required className="aura-input w-full font-mono" value={newInv.initialValue} onChange={e => setNewInv({ ...newInv, initialValue: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase px-2 mb-1 block">Valor Actual</label>
                  <input type="number" required className="aura-input w-full font-mono" value={newInv.currentValue} onChange={e => setNewInv({ ...newInv, currentValue: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase px-2 mb-1 block">Tipo de Activo</label>
                <select className="aura-input w-full" value={newInv.type} onChange={e => setNewInv({ ...newInv, type: e.target.value })}>
                  <option value="Stocks">Acciones (Stocks)</option>
                  <option value="Crypto">Criptomonedas</option>
                  <option value="ETF">ETFs / Fondos</option>
                  <option value="Real Estate">Bienes Raíces</option>
                  <option value="Other">Otros</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all font-medium">Cancelar</button>
                <button type="submit" className="flex-1 aura-button aura-button-primary">Confirmar</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Investments;
