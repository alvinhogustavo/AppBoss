
import React, { useState } from 'react';
import { LucideIcon, X, CheckCircle2, Mail, Lock, LogIn, UserPlus, AlertCircle, Loader2 } from 'lucide-react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'accent' }> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "relative px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] tracking-wide text-sm md:text-base overflow-hidden group font-sans border disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-brand-primary text-white border-transparent hover:bg-brand-primary/90 shadow-[0_1px_10px_rgba(99,102,241,0.2)]",
    secondary: "bg-[#1A1A1A] text-slate-300 border-white/5 hover:border-white/10 hover:text-white hover:bg-[#252525]",
    ghost: "bg-transparent text-slate-400 border-transparent hover:text-white hover:bg-white/5",
    accent: "bg-white text-black border-transparent hover:bg-slate-100 shadow-[0_0_20px_rgba(255,255,255,0.3)] font-bold"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {/* Subtle Shimmer for Accent Button */}
      {variant === 'accent' && (
        <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-black/5 to-transparent z-10 pointer-events-none"></div>
      )}
       {/* Subtle Shimmer for Primary Button */}
       {variant === 'primary' && (
        <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent z-10 pointer-events-none"></div>
      )}
      <span className="relative z-20 flex items-center gap-2">{children}</span>
    </button>
  );
};

export const Card: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
  noPadding?: boolean;
  overflowVisible?: boolean;
}> = ({ children, className = '', onClick, interactive = false, noPadding = false, overflowVisible = false }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        glass-panel rounded-xl 
        ${overflowVisible ? 'overflow-visible' : 'overflow-hidden'}
        ${noPadding ? '' : 'p-6'}
        ${interactive ? 'cursor-pointer glass-panel-hover transition-all duration-300 transform' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export const PageHeader: React.FC<{ title: string; subtitle: string; badge?: string }> = ({ title, subtitle, badge }) => (
  <div className="text-center mb-16 relative">
    {/* Decorative Glow - refined */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-primary/10 blur-[120px] rounded-full pointer-events-none opacity-50"></div>
    
    {badge && (
      <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[10px] font-mono font-bold tracking-widest mb-6 animate-fade-in uppercase shadow-sm">
        {badge}
      </span>
    )}
    <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 tracking-tighter animate-slide-up leading-none metallic-text drop-shadow-lg">
      {title}
    </h1>
    <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light font-sans animate-slide-up tracking-wide" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
      {subtitle}
    </p>
  </div>
);

export const IconWrapper: React.FC<{ icon: LucideIcon; color?: string; size?: number }> = ({ icon: Icon, color = "text-white", size = 28 }) => (
  <div className={`p-4 rounded-2xl w-fit shadow-inner`}>
    <Icon size={size} className={color} strokeWidth={1.5} />
  </div>
);

export const Modal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  title?: string;
  children: React.ReactNode 
}> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#000]/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-lg rounded-2xl shadow-2xl relative overflow-hidden animate-slide-up bg-[#0A0A0A]">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        
        <div className="p-8 relative z-10">
          <div className="flex justify-between items-center mb-8">
            {title && <h2 className="text-2xl font-display font-bold text-white tracking-tight">{title}</h2>}
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5">
              <X size={20} />
            </button>
          </div>
          <div className="text-slate-300 font-sans">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export const AuthModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
  onSignUp: (e: string, p: string) => Promise<any>;
  onSignIn: (e: string, p: string) => Promise<any>;
}> = ({ isOpen, onClose, onAuthSuccess, onSignUp, onSignIn }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = isLogin 
        ? await onSignIn(email, password)
        : await onSignUp(email, password);

      if (error) {
        throw error;
      }
      
      // If signup successful but check email needed
      if (!isLogin && data?.user && !data.session) {
        setError('Conta criada! Verifique seu email para confirmar.');
        setLoading(false);
        return;
      }

      onAuthSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isLogin ? "Acessar AppBoss" : "Criar Conta"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-sm flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-slate-500" size={18} />
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-[#151515] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-white/30 transition-colors"
              placeholder="seu@email.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Senha</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-slate-500" size={18} />
            <input 
              type="password" 
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-[#151515] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-white/30 transition-colors"
              placeholder="••••••••"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          variant="primary" 
          className="w-full mt-6"
          disabled={loading}
        >
          {loading ? <Loader2 className="animate-spin" /> : (isLogin ? <LogIn size={18} /> : <UserPlus size={18} />)}
          {isLogin ? 'Entrar no Sistema' : 'Criar Conta Grátis'}
        </Button>

        <div className="text-center pt-4 border-t border-white/5 mt-4">
          <button 
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-sm text-slate-400 hover:text-white underline decoration-slate-600 hover:decoration-white transition-all"
          >
            {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Fazer Login'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export const Toast: React.FC<{ message: string; isVisible: boolean }> = ({ message, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 bg-[#0A0A0A] border border-white/10 rounded-full shadow-2xl animate-slide-in-bottom min-w-[320px] overflow-hidden">
      <div className="bg-emerald-500/10 p-1.5 rounded-full text-emerald-500 border border-emerald-500/20 shrink-0">
        <CheckCircle2 size={16} strokeWidth={3} />
      </div>
      <span className="text-white font-sans font-medium text-sm tracking-wide whitespace-nowrap">{message}</span>
      
      {/* Time Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/5">
        <div className="h-full bg-emerald-500 w-full animate-progress-shrink origin-left"></div>
      </div>
    </div>
  );
};