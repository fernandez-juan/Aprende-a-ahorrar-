import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Target, 
  Plus, 
  TrendingUp, 
  Plane, 
  Home, 
  Car, 
  Gift, 
  Smartphone,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { useFinance } from '../hooks/useFinance';

const Goals: React.FC = () => {
  const { goals, addGoal, updateGoalProgress } = useFinance();
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    targetAmount: '',
    icon: 'Plane',
    category: 'Travel'
  });

  const icons: any = { Plane, Home, Car, Gift, Smartphone, Target };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addGoal({
      title: newGoal.title,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: 0,
      deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
      category: newGoal.category,
      icon: newGoal.icon
    });
    setIsAdding(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-display font-bold">Mis Metas de Ahorro</h3>
          <p className="text-sm text-slate-500">Visualiza el progreso hacia tus sueños</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="aura-button aura-button-primary py-2.5 flex items-center gap-2"
        >
          <Plus size={18} /> Nueva Meta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal, i) => {
          const Icon = icons[goal.icon] || Target;
          const progress = (goal.currentAmount / goal.targetAmount) * 100;

          return (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={goal.id} 
              className="glass-card p-6 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-aura-accent/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-aura-accent/10 transition-all" />
              
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-aura-accent/10 text-aura-accent">
                  <Icon size={24} />
                </div>
                <div>
                  <h4 className="font-display font-bold text-lg">{goal.title}</h4>
                  <p className="text-xs text-slate-500 uppercase tracking-widest">{goal.category}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Progreso</span>
                  <span className="font-mono font-bold text-white">{Math.round(progress)}%</span>
                </div>
                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-aura-accent to-aura-success shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                  />
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase">Recaudado</p>
                    <p className="font-display font-bold text-aura-success">${goal.currentAmount.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase">Meta</p>
                    <p className="font-display font-bold text-white">${goal.targetAmount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <label className="text-[10px] text-slate-500 uppercase mb-2 block">Actualizar Progreso</label>
                  <input 
                    type="range" 
                    min="0" 
                    max={goal.targetAmount} 
                    value={goal.currentAmount}
                    onChange={(e) => goal.id && updateGoalProgress(goal.id, parseFloat(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-aura-accent"
                  />
                </div>
              </div>
            </motion.div>
          );
        })}

        {goals.length === 0 && !isAdding && (
          <div 
            onClick={() => setIsAdding(true)}
            className="lg:col-span-3 py-20 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-slate-500 hover:bg-white/2 cursor-pointer transition-all"
          >
            <Plus size={40} className="mb-4 opacity-20" />
            <p className="font-display font-medium text-lg">No tienes metas activas</p>
            <p className="text-sm">Empieza por establecer un objetivo para este año</p>
          </div>
        )}
      </div>

      {/* Add Goal Dialog */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-aura-bg/80 backdrop-blur-sm px-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card w-full max-w-md p-8"
          >
            <h3 className="text-xl font-display font-bold mb-6">Crear Nueva Meta</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 uppercase px-2 mb-1 block">Título</label>
                <input 
                  required 
                  className="aura-input w-full" 
                  placeholder="Ej. Vacaciones 2026"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 uppercase px-2 mb-1 block">Monto Meta</label>
                  <input 
                    type="number" 
                    required 
                    className="aura-input w-full font-mono"
                    value={newGoal.targetAmount}
                    onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase px-2 mb-1 block">Icono</label>
                  <select 
                    className="aura-input w-full"
                    value={newGoal.icon}
                    onChange={(e) => setNewGoal({ ...newGoal, icon: e.target.value })}
                  >
                    {Object.keys(icons).map(key => <option key={key} value={key}>{key}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all font-medium">Cancelar</button>
                <button type="submit" className="flex-1 aura-button aura-button-primary">Crear Meta</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Goals;
