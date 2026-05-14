import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  X, 
  Mic, 
  Send, 
  Loader2, 
  User as UserIcon,
  Sparkles,
  Volume2,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useFinance } from '../hooks/useFinance';
import { useAuth } from '../context/AuthContext';
import { aiService } from '../services/aiService';

interface Message {
  id: string;
  role: 'user' | 'aura';
  content: string;
  type?: 'text' | 'chart' | 'alert';
}

interface AuraAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuraAssistant: React.FC<AuraAssistantProps> = ({ isOpen, onClose }) => {
  const { transactions, goals } = useFinance();
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'aura', content: 'Hola, soy Aura. Estoy lista para analizar tus finanzas. ¿En qué puedo ayudarte hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await aiService.getFinancialAdvice(input, {
        transactions,
        income: profile?.monthlyIncome || 0
      });

      const auraMsg: Message = { id: (Date.now() + 1).toString(), role: 'aura', content: response };
      setMessages(prev => [...prev, auraMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { id: 'error', role: 'aura', content: 'Lo siento, he tenido un problema procesando tu solicitud.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-aura-bg/20 backdrop-blur-sm md:bg-transparent"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md z-50 glass-card rounded-none md:rounded-l-3xl border-l border-white/10 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Assistant Header */}
            <div className="p-6 border-b border-white/5 bg-aura-accent/5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-aura-accent flex items-center justify-center shadow-lg shadow-aura-accent/20">
                    <Bot className="text-white w-6 h-6" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-aura-success rounded-full border-2 border-aura-bg animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display font-bold">Asistente Aura</h3>
                  <p className="text-[10px] text-aura-success uppercase tracking-widest font-bold">Inteligencia Adaptativa Activa</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-400"><X size={20} /></button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar" ref={scrollRef}>
              {messages.map((msg) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-2xl border ${
                    msg.role === 'user' 
                      ? 'bg-aura-accent text-white border-aura-accent shadow-lg shadow-aura-accent/10 rounded-tr-none' 
                      : 'bg-white/5 text-slate-200 border-white/10 rounded-tl-none'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/10 flex gap-1">
                    <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-aura-accent rounded-full" />
                    <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-aura-accent rounded-full" />
                    <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-aura-accent rounded-full" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-white/5 bg-white/2">
              <div className="bg-white/5 border border-white/10 rounded-3xl flex items-center p-1.5 focus-within:border-aura-accent/30 transition-all">
                <button className="p-3 text-slate-400 hover:text-aura-accent transition-colors"><Mic size={20} /></button>
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Pregúntame algo sobre tus finanzas..." 
                  className="flex-1 bg-transparent px-2 text-sm outline-none text-white border-none focus:ring-0"
                />
                <button 
                  onClick={handleSend}
                  disabled={isTyping || !input.trim()}
                  className="p-3 bg-aura-accent rounded-full text-white hover:shadow-lg hover:shadow-aura-accent/20 transition-all disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] text-slate-500 text-center uppercase tracking-tighter">
                 <button onClick={() => setInput('¿Cuánto gasté en hamburguesas?')} className="p-2 border border-white/5 rounded-xl hover:bg-white/5 truncate">Gasto en Comida</button>
                 <button onClick={() => setInput('¿Podré llegar a mi meta de vacaciones?')} className="p-2 border border-white/5 rounded-xl hover:bg-white/5 truncate">Mi Meta Proyectada</button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuraAssistant;
