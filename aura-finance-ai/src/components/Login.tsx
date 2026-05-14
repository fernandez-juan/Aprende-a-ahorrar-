import React from 'react';
import { motion } from 'motion/react';
import { Bot, Shield, Zap, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const { login } = useAuth();

  return (
    <div className="h-screen w-screen flex items-center justify-center p-4 relative overflow-hidden bg-aura-bg">
      {/* Decorative Background Elements */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-aura-accent/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-aura-success/10 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card max-w-md w-full p-8 md:p-12 relative z-10 text-center"
      >
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-aura-accent flex items-center justify-center shadow-2xl shadow-aura-accent/40">
            <Bot size={40} className="text-white" />
          </div>
        </div>

        <h1 className="text-4xl font-display font-bold mb-4 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
          Aura Finance AI
        </h1>
        <p className="text-slate-400 mb-10">
          Toma el control de tu futuro financiero con el poder de la inteligencia artificial adaptativa.
        </p>

        <div className="space-y-4 mb-10">
          {[
            { icon: Shield, text: "Seguridad de nivel bancario" },
            { icon: Zap, text: "Análisis en tiempo real" },
            { icon: TrendingUp, text: "Proyecciones inteligentes" }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="flex items-center gap-3 text-sm text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5"
            >
              <item.icon size={16} className="text-aura-accent" />
              <span>{item.text}</span>
            </motion.div>
          ))}
        </div>

        <button 
          onClick={login}
          className="aura-button aura-button-primary w-full flex items-center justify-center gap-3 py-4 text-lg"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
          Iniciar con Google
        </button>

        <p className="mt-8 text-xs text-slate-500">
          Al continuar, aceptas nuestros términos de servicio y políticas de privacidad diseñadas para el futuro.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
