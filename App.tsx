
import React, { useState, useEffect, useRef } from 'react';
import { 
  Briefcase, 
  Activity, 
  TrendingUp, 
  ShoppingCart, 
  Cpu, 
  Code2, 
  ArrowRight, 
  Sparkles,
  CheckCircle2,
  Copy,
  ChevronLeft,
  Loader2,
  Rocket,
  Zap,
  Target,
  Layout,
  CalendarCheck,
  Home,
  Utensils,
  BookOpen,
  DollarSign,
  Palette,
  Smartphone,
  ExternalLink,
  Bot,
  Monitor,
  Download,
  HelpCircle,
  Lightbulb,
  Terminal,
  Grid,
  Layers,
  MousePointer2,
  Users,
  Diamond,
  Flame,
  Snowflake,
  BarChart3,
  PlusCircle,
  Play,
  Scale,
  ThumbsUp,
  AlertTriangle,
  Calculator,
  Calendar,
  MessageSquare,
  Send,
  X,
  Megaphone,
  Wand2,
  Crown,
  Trophy,
  RefreshCw,
  PieChart,
  ListTodo,
  Image as ImageIcon,
  UserCircle2,
  Cloud,
  Upload,
  LogOut,
  User,
  Lock,
  Info,
  CreditCard
} from 'lucide-react';
import { NicheOption, AppStep, AppPlanResult, SubNicheOption, ChatMessage } from './types';
import { generateSubNiches, generateAppPlan, getConsultantResponse } from './services/geminiService';
import { saveProjectToDb, supabase, signInUser, signUpUser, signOutUser, checkUserPaymentStatus } from './services/supabaseClient';
import { Button, Card, PageHeader, IconWrapper, Modal, Toast, AuthModal } from './components/UIComponents';

// Predefined main niches with COLORS and TRENDS
const MAIN_NICHES: NicheOption[] = [
  { 
    id: 'productivity', 
    title: 'Produtividade', 
    description: 'Apps para organizar tarefas, hábitos e metas.', 
    iconName: 'CalendarCheck',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    trend: 'saturated'
  },
  { 
    id: 'services', 
    title: 'Serviços Locais', 
    description: 'Conectar profissionais e clientes na sua região.', 
    iconName: 'Briefcase',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    trend: 'hot'
  },
  { 
    id: 'lifestyle', 
    title: 'Estilo de Vida', 
    description: 'Hobbies, culinária, viagens e coleções.', 
    iconName: 'Utensils',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    trend: 'rising'
  },
  { 
    id: 'education', 
    title: 'Educação', 
    description: 'Flashcards, guias rápidos e aprendizado.', 
    iconName: 'BookOpen',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    trend: 'rising'
  },
  { 
    id: 'finance', 
    title: 'Finanças', 
    description: 'Controle de gastos, assinaturas e contas.', 
    iconName: 'TrendingUp',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    trend: 'premium'
  },
  { 
    id: 'health', 
    title: 'Bem-Estar', 
    description: 'Meditação, treino em casa e saúde.', 
    iconName: 'Activity',
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/10',
    trend: 'hot'
  },
  { 
    id: 'home', 
    title: 'Gestão da Casa', 
    description: 'Manutenção, compras e organização.', 
    iconName: 'Home',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    trend: 'saturated'
  },
  { 
    id: 'creator', 
    title: 'Criadores', 
    description: 'Para influenciadores e produtores de conteúdo.', 
    iconName: 'Zap',
    color: 'text-fuchsia-400',
    bgColor: 'bg-fuchsia-500/10',
    trend: 'hot'
  },
  { 
    id: 'custom', 
    title: 'Criação Livre', 
    description: 'Sua ideia original e única.', 
    iconName: 'Wand2',
    color: 'text-white',
    bgColor: 'bg-white/10',
    trend: 'premium'
  },
];

const getIcon = (name: string) => {
  const icons: any = { 
    Briefcase, Activity, TrendingUp, ShoppingCart, Cpu, Code2, 
    CalendarCheck, Home, Utensils, BookOpen, Zap, Wand2
  };
  return icons[name] || Briefcase;
};

const SUGGESTED_QUESTIONS = [
  "Como conseguir os primeiros 100 usuários?",
  "Qual a melhor estratégia para MVP?",
  "Ideias de Growth para o TikTok?",
  "Como validar essa ideia sem gastar?"
];

const CAKTO_CHECKOUT_URL = "https://seu-link-cakto.com"; // Substitua pelo seu link real

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'radar'>('create');
  const [step, setStep] = useState<AppStep>(AppStep.SELECT_NICHE);
  const [selectedNiche, setSelectedNiche] = useState<NicheOption | null>(null);
  const [subNiches, setSubNiches] = useState<SubNicheOption[]>([]);
  const [selectedSubNiche, setSelectedSubNiche] = useState<string | null>(null);
  const [planResult, setPlanResult] = useState<AppPlanResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  // Custom Idea State
  const [showCustomIdeaModal, setShowCustomIdeaModal] = useState(false);
  const [customIdeaInput, setCustomIdeaInput] = useState("");

  // Onboarding State
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Auth State
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);

  // Toast State
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Revenue Simulator State
  const [simulatedUsers, setSimulatedUsers] = useState(50);
  const [simulatedPrice, setSimulatedPrice] = useState(29.90);

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatTyping, setIsChatTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Check payment status whenever user changes
  useEffect(() => {
    const verifyPayment = async () => {
      if (user) {
        setIsCheckingPayment(true);
        const paid = await checkUserPaymentStatus(user.id);
        setIsPaid(paid);
        setIsCheckingPayment(false);
      } else {
        setIsPaid(false);
      }
    };
    verifyPayment();
  }, [user]);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (mounted) {
          setUser(user);
          if (user) {
             const hasSeenOnboarding = localStorage.getItem('appboss_onboarding_seen');
             if (!hasSeenOnboarding) {
               setTimeout(() => setShowOnboarding(true), 1000);
             }
          }
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
      } finally {
        if (mounted) setAuthChecked(true);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        if (session?.user) {
            const hasSeenOnboarding = localStorage.getItem('appboss_onboarding_seen');
            if (!hasSeenOnboarding) {
              setTimeout(() => setShowOnboarding(true), 1000);
            }
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (planResult && planResult.revenueModels.length > 0) {
      const firstModel = planResult.revenueModels[0].title;
      const match = firstModel.match(/R\$\s*(\d+[.,]?\d*)/);
      if (match && match[1]) {
        setSimulatedPrice(parseFloat(match[1].replace(',', '.')));
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setChatMessages([
      { role: 'model', content: 'Olá! Sou seu AppBoss Advisor. Analisei seu plano e estou pronto. Quer ajuda com ideias de marketing, dúvidas técnicas ou sugestões de features?' }
    ]);
  }, [planResult]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatTyping, isChatOpen]);

  const closeOnboarding = () => {
    localStorage.setItem('appboss_onboarding_seen', 'true');
    setShowOnboarding(false);
  };

  const openOnboarding = () => {
    setShowOnboarding(true);
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleAuthSuccess = () => {
    triggerToast("Login realizado com sucesso! Bem-vindo.");
    setShowAuthModal(false);
  };
  
  const handleLogout = async () => {
    await signOutUser();
    triggerToast("Você saiu do sistema.");
    resetFlow();
  };

  const handleNicheSelect = async (niche: NicheOption) => {
    if (niche.id === 'custom') {
      setShowCustomIdeaModal(true);
      return;
    }
    
    setSelectedNiche(niche);
    setIsLoading(true);
    setLoadingMessage(`Analisando mercado de ${niche.title}...`);
    try {
      const results = await generateSubNiches(niche.title);
      setSubNiches(results);
      setStep(AppStep.SELECT_SUBNICHE);
    } catch (error: any) {
      console.error(error);
      let errorMsg = "Ocorreu um erro ao buscar sub-nichos.";
      if (error.message && error.message.includes("API Key")) {
        errorMsg = "Erro de Configuração: API Key não encontrada na Vercel.";
      }
      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubNicheSelect = async (sub: string) => {
    if (!selectedNiche) return;
    setSelectedSubNiche(sub);
    setStep(AppStep.LOADING_PLAN);
    setIsLoading(true);
    setLoadingMessage("Arquitetando solução completa...");

    try {
      const plan = await generateAppPlan(selectedNiche.title, sub);
      setPlanResult(plan);
      setStep(AppStep.VIEW_RESULT);
    } catch (error: any) {
      setStep(AppStep.SELECT_SUBNICHE);
      let errorMsg = "Erro ao gerar o plano. Tente novamente.";
      if (error.message && error.message.includes("API Key")) {
        errorMsg = "Erro Crítico: API Key não configurada. Verifique as variáveis de ambiente na Vercel.";
      }
      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomIdeaSubmit = async () => {
    if (!customIdeaInput.trim()) return;
    
    setShowCustomIdeaModal(false);
    
    const customNiche: NicheOption = {
      id: 'custom',
      title: 'Ideia Personalizada',
      description: 'Conceito original do usuário',
      iconName: 'Wand2',
      color: 'text-white',
      bgColor: 'bg-white/10',
      trend: 'rising'
    };
    
    setSelectedNiche(customNiche);
    setSelectedSubNiche(customIdeaInput);
    setStep(AppStep.LOADING_PLAN);
    setIsLoading(true);
    setLoadingMessage("Decodificando conceito original...");

    try {
      const plan = await generateAppPlan("Ideia Personalizada", customIdeaInput);
      setPlanResult(plan);
      setStep(AppStep.VIEW_RESULT);
    } catch (error) {
      setStep(AppStep.SELECT_NICHE);
      alert("Não foi possível gerar o plano para essa ideia. Tente detalhar mais.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefinePlan = async () => {
    if (!selectedNiche || !selectedSubNiche || !planResult) return;
    
    setIsLoading(true);
    setLoadingMessage("Otimizando arquitetura para Nível 10/10 (Super-Set)...");
    
    try {
      const nicheTitle = selectedNiche.id === 'custom' ? "Ideia Personalizada" : selectedNiche.title;
      const refinedPlan = await generateAppPlan(nicheTitle, selectedSubNiche, true);
      setPlanResult(refinedPlan);
      triggerToast("Blueprint reformulado com sucesso!");
    } catch (error) {
      triggerToast("Erro ao reformular. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToSupabase = async () => {
    if (!planResult || !selectedNiche) return;

    if (!user) {
      triggerToast("Faça login para salvar seus projetos!");
      setShowAuthModal(true);
      return;
    }
    
    setIsSaving(true);
    try {
      const result = await saveProjectToDb(planResult, selectedNiche.title);
      
      if (result) {
        triggerToast("Projeto salvo na nuvem com segurança!");
      } else {
        triggerToast("Erro ao salvar. Tente novamente.");
      }
    } catch (e) {
      triggerToast("Erro de conexão ao salvar.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRadarClick = async (categoryTitle: string, itemText: string) => {
    setActiveTab('create');
    
    const radarNiche: NicheOption = { 
      id: 'radar-trend', 
      title: categoryTitle, 
      description: 'Tendência de Mercado', 
      iconName: 'TrendingUp',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      trend: 'hot'
    };
    
    setSelectedNiche(radarNiche);
    setSelectedSubNiche(itemText);
    setStep(AppStep.LOADING_PLAN);
    setIsLoading(true);
    setLoadingMessage(`Inicializando protocolo para: ${itemText}...`);

    try {
      const plan = await generateAppPlan(categoryTitle, itemText);
      setPlanResult(plan);
      setStep(AppStep.VIEW_RESULT);
    } catch (error) {
      setStep(AppStep.SELECT_NICHE);
      alert("Erro ao gerar plano via Radar. Verifique a API Key.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (customMessage?: string) => {
    const messageToSend = customMessage || chatInput;
    if (!messageToSend.trim() || !planResult) return;

    const userMsg: ChatMessage = { role: 'user', content: messageToSend };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsChatTyping(true);

    try {
      const response = await getConsultantResponse(planResult, chatMessages, userMsg.content);
      setChatMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'model', content: "Erro de conexão com o Advisor." }]);
    } finally {
      setIsChatTyping(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    triggerToast("Copiado com sucesso!");
  };

  const downloadDossier = () => {
    if (!planResult) return;
    
    const content = `
# APP BOSS DOSSIER v3.0 - RELATÓRIO TÉCNICO
--------------------------------------------------
... (conteúdo do dossiê) ...
`;

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${planResult.appName.replace(/\s+/g, '_')}_Dossier.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast("Dossiê baixado com sucesso!");
  };

  const resetFlow = () => {
    setStep(AppStep.SELECT_NICHE);
    setSelectedNiche(null);
    setSelectedSubNiche(null);
    setPlanResult(null);
    setActiveTab('create');
    setChatMessages([]);
    setIsChatOpen(false);
  };

  const getTechStackUrl = () => {
    return 'https://aistudio.google.com/app/prompts/new_chat';
  };
  
  const handleLaunchAIStudio = () => {
      if (planResult) {
          navigator.clipboard.writeText(planResult.technicalPrompt);
          triggerToast("Prompt Copiado! Cole no AI Studio (Ctrl+V)");
          setTimeout(() => {
              window.open(getTechStackUrl(), '_blank');
          }, 1500);
      } else {
          window.open(getTechStackUrl(), '_blank');
      }
  };

  const renderTrendIcon = (trend: 'hot' | 'saturated' | 'rising' | 'premium') => {
      switch(trend) {
          case 'hot': return <Flame size={14} className="text-orange-500 fill-orange-500/20" />;
          case 'saturated': return <Snowflake size={14} className="text-blue-300 fill-blue-300/20" />;
          case 'rising': return <Rocket size={14} className="text-emerald-500 fill-emerald-500/20" />;
          case 'premium': return <Diamond size={14} className="text-amber-400 fill-amber-400/20" />;
          default: return null;
      }
  };

  const getTrendLabel = (trend: string) => {
      switch(trend) {
          case 'hot': return 'Em Alta';
          case 'saturated': return 'Estável';
          case 'rising': return 'Crescente';
          case 'premium': return 'Lucrativo';
          default: return '';
      }
  };

  const renderBlueprintScore = (score: number) => {
    let color = "text-emerald-400";
    let bg = "bg-emerald-500/10";
    let border = "border-emerald-500/20";
    
    if (score < 8) {
      color = "text-amber-400";
      bg = "bg-amber-500/10";
      border = "border-amber-500/20";
    }
    if (score < 6) {
      color = "text-rose-400";
      bg = "bg-rose-500/10";
      border = "border-rose-500/20";
    }

    return (
      <div className={`flex flex-col items-center justify-center p-3 rounded-xl border ${border} ${bg} min-w-[80px]`}>
        <div className="flex items-start">
          <span className={`text-2xl font-bold font-display ${color}`}>{score.toFixed(1)}</span>
          <span className={`text-[10px] font-bold mt-1 ${color}`}>/10</span>
        </div>
        <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider mt-1">Score</span>
      </div>
    );
  };

  // --- Dynamic Mockup Rendering Logic ---
  const renderMockupScreen = (plan: AppPlanResult) => {
    // Detect visual type based on keywords
    const text = (plan.appName + " " + plan.tagline).toLowerCase();
    
    let type = 'grid'; // default
    if (text.match(/finan|gasto|dinheiro|lucro|venda|invest|banco|carteira|fatura/)) type = 'dashboard';
    else if (text.match(/tarefa|lista|hábito|agenda|todo|rotina|organiza/)) type = 'list';
    else if (text.match(/social|chat|rede|comunid|grupo|conecta|amigo|feed|notícia/)) type = 'feed';

    const primaryColor = plan.colorPalette.primary;
    const secondaryColor = plan.colorPalette.secondary;
    const bgColor = plan.colorPalette.background || '#ffffff';
    const isDark = bgColor.match(/#0/i) || bgColor.match(/#1/i); // Rough check if dark mode
    const textColor = isDark ? '#ffffff' : '#1e293b';

    return (
      <div className="flex-1 flex flex-col relative z-20 overflow-hidden font-sans" style={{ backgroundColor: bgColor }}>
        {/* Dynamic App Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
           <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: secondaryColor + '20' }}>
             <UserCircle2 size={18} color={primaryColor} />
           </div>
           <span className="font-bold text-sm tracking-tight" style={{ color: textColor }}>{plan.appName}</span>
           <div className="w-8 h-8 flex items-center justify-center">
             <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
           </div>
        </div>

        {/* Dynamic Content Body */}
        <div className="flex-1 p-5 overflow-hidden relative">
           {/* Mockup content remains similar to previous implementations but using colors from plan */}
           <div className="flex items-center justify-center h-full text-center p-4">
             <div style={{color: textColor}}>
               <h3 className="font-bold text-lg mb-2">Bem-vindo ao {plan.appName}</h3>
               <p className="text-xs opacity-70">{plan.tagline}</p>
             </div>
           </div>
        </div>
        
        {/* Bottom Nav */}
        <div className="h-14 border-t px-6 flex items-center justify-between" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', backgroundColor: isDark ? '#000' : '#fff' }}>
           <Home size={20} style={{ color: primaryColor }} />
           <Grid size={20} className="opacity-30" style={{ color: textColor }} />
           <PieChart size={20} className="opacity-30" style={{ color: textColor }} />
           <UserCircle2 size={20} className="opacity-30" style={{ color: textColor }} />
        </div>
      </div>
    );
  };

  const renderPaymentWall = () => (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-rose-500/5 rounded-full blur-[120px] pointer-events-none opacity-20 animate-pulse-slow"></div>
      
      <div className="relative z-10 animate-fade-in flex flex-col items-center max-w-lg">
        <div className="w-20 h-20 bg-[#0A0A0A] border border-rose-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
          <Lock size={32} className="text-rose-500" />
        </div>

        <h1 className="text-4xl font-display font-black text-white mb-4 tracking-tight">
          Assinatura Necessária
        </h1>
        
        <p className="text-slate-400 font-light mb-8 leading-relaxed">
          Para acessar o <strong>Radar de Mercado</strong>, <strong>Gerador de Dossiês</strong> e o <strong>Advisor IA</strong>, é necessário ter uma assinatura ativa do AppBoss Enterprise.
        </p>

        <div className="flex flex-col gap-3 w-full">
          <Button 
            variant="primary" 
            onClick={() => window.open(CAKTO_CHECKOUT_URL, '_blank')} 
            className="w-full h-12 text-base bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
          >
            <CreditCard size={18} /> Assinar Agora
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={async () => {
              if (user) {
                setIsCheckingPayment(true);
                const paid = await checkUserPaymentStatus(user.id);
                setIsPaid(paid);
                setIsCheckingPayment(false);
                if (paid) triggerToast("Pagamento confirmado! Acesso liberado.");
                else triggerToast("Pagamento ainda não identificado. Tente novamente em instantes.");
              }
            }}
            className="w-full h-12 text-base"
            disabled={isCheckingPayment}
          >
            {isCheckingPayment ? <Loader2 className="animate-spin"/> : <RefreshCw size={18} />}
            Já paguei, liberar acesso
          </Button>
        </div>
        
        <p className="text-xs text-slate-500 mt-6">
          Seu acesso será liberado automaticamente após a confirmação do pagamento.
        </p>
      </div>
    </div>
  );

  const renderLandingPage = () => (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[120px] pointer-events-none opacity-20 animate-pulse-slow"></div>
      
      <div className="relative z-10 animate-fade-in flex flex-col items-center">
        <div className="w-24 h-24 bg-[#0A0A0A] border border-white/10 rounded-3xl flex items-center justify-center mb-8 shadow-2xl relative group">
          <div className="absolute inset-0 bg-white/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Lock size={40} className="text-white relative z-10" />
        </div>

        <h1 className="text-6xl md:text-8xl font-display font-black text-white mb-6 tracking-tighter metallic-text">
          APPBOSS
        </h1>
        
        <p className="text-xl text-slate-400 font-light max-w-2xl mb-12 leading-relaxed">
          Plataforma de inteligência artificial para arquitetura de software e negócios digitais.
        </p>

        <div className="flex flex-col gap-4 w-full max-w-sm">
          <Button 
            variant="accent" 
            onClick={() => setShowAuthModal(true)} 
            className="w-full h-14 text-lg"
          >
            ACESSAR SISTEMA <ArrowRight className="ml-2" />
          </Button>
          <p className="text-xs text-slate-500 font-mono uppercase tracking-widest mt-4">
            Acesso Restrito • Enterprise Edition
          </p>
        </div>
      </div>
    </div>
  );

  const renderOnboardingModal = () => (
    <Modal isOpen={showOnboarding} onClose={closeOnboarding} title="Bem-vindo ao AppBoss">
      <div className="space-y-4">
        <p>Sua jornada para criar um aplicativo de sucesso começa aqui.</p>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-300">
          <li><strong>Escolha um Nicho:</strong> Selecione uma área de mercado ou digite sua própria ideia.</li>
          <li><strong>Receba o Plano:</strong> Nossa IA gera um blueprint completo (técnico, marketing e negócios).</li>
          <li><strong>Refine & Exporte:</strong> Use o chat para tirar dúvidas e copie o prompt para o Google AI Studio.</li>
        </ol>
        <Button onClick={closeOnboarding} className="w-full mt-4">Começar Agora</Button>
      </div>
    </Modal>
  );

  const renderCustomIdeaModal = () => (
    <Modal isOpen={showCustomIdeaModal} onClose={() => setShowCustomIdeaModal(false)} title="Sua Ideia Revolucionária">
      <div className="space-y-4">
        <p className="text-sm text-slate-400">Descreva sua ideia em poucas palavras. Ex: "Uber para passeadores de cães" ou "Marketplace de aluguel de roupas de festa".</p>
        <textarea
          value={customIdeaInput}
          onChange={(e) => setCustomIdeaInput(e.target.value)}
          className="w-full h-32 bg-[#151515] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-white/30 resize-none"
          placeholder="Digite sua ideia aqui..."
        />
        <Button onClick={handleCustomIdeaSubmit} disabled={!customIdeaInput.trim()} className="w-full">
          <Wand2 size={18} /> Gerar Plano Completo
        </Button>
      </div>
    </Modal>
  );

  const renderLoading = () => (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-2 border-white/10 border-t-brand-primary animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Cpu size={24} className="text-brand-primary animate-pulse" />
        </div>
      </div>
      <h3 className="mt-8 text-2xl font-bold text-white tracking-tight animate-pulse">{loadingMessage}</h3>
      <p className="mt-2 text-slate-500 max-w-md mx-auto">Nossa IA está analisando milhões de data-points para construir a melhor estratégia.</p>
    </div>
  );

  const renderTabNavigation = () => (
    <div className="flex justify-center mb-12">
      <div className="p-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-1">
        <button
          onClick={() => setActiveTab('create')}
          className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'create' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          <Wand2 size={16} /> Modo Criador
        </button>
        <button
          onClick={() => setActiveTab('radar')}
          className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'radar' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          <Activity size={16} /> Radar de Mercado
        </button>
      </div>
    </div>
  );

  const renderMarketRadar = () => {
    // Specific radar data as requested by user with correct icons and themes
    const radarData = [
      { 
        category: "Top Lucrativos", 
        icon: Diamond, 
        color: "text-amber-400", 
        items: ["SaaS B2B para Clínicas", "Gestão de Frotas Leves", "ERP para Pequenos Varejos"] 
      },
      { 
        category: "Hype do Momento", 
        icon: Flame, 
        color: "text-orange-500", 
        items: ["Geração de Copy com IA", "Avatares para Redes Sociais", "Automação de WhatsApp"] 
      },
      { 
        category: "Tendência de Alta", 
        icon: Rocket, 
        color: "text-emerald-500", 
        items: ["Marketplace de Serviços Agro", "Educação Financeira Jovens", "Telemedicina Veterinária"] 
      },
      { 
        category: "Em Baixa / Saturado", 
        icon: Snowflake, 
        color: "text-blue-300", 
        items: ["To-Do List Simples", "App de Receitas Genérico", "Contador de Passos Básico"] 
      }
    ];

    return (
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <PageHeader title="Radar de Oportunidades" subtitle="Análise em tempo real dos nichos mais rentáveis do mês." badge="Market Intelligence" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {radarData.map((section, idx) => (
            <Card key={idx} className="h-full">
              <div className="flex items-center gap-4 mb-6">
                <IconWrapper icon={section.icon} color={section.color} />
                <h3 className="text-xl font-bold text-white">{section.category}</h3>
              </div>
              <div className="space-y-3">
                {section.items.map((item, i) => (
                  <div 
                    key={i} 
                    onClick={() => handleRadarClick(section.category, item)}
                    className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <span className="font-medium text-slate-300 group-hover:text-white">{item}</span>
                    <ArrowRight size={16} className="text-slate-600 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderNicheSelection = () => (
    <div className="max-w-7xl mx-auto px-6 pb-20">
      <div className="text-center mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-primary/10 blur-[120px] rounded-full pointer-events-none opacity-50"></div>
          <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[10px] font-mono font-bold tracking-widest mb-6 animate-fade-in uppercase shadow-sm">
            Passo 1 de 3
          </span>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 tracking-tighter animate-slide-up leading-none metallic-text drop-shadow-lg">
            Escolha seu Território
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light font-sans animate-slide-up tracking-wide" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
            Selecione um nicho de mercado para dominar com seu novo aplicativo.
          </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MAIN_NICHES.map((niche) => {
          const Icon = getIcon(niche.iconName);
          return (
            <Card 
              key={niche.id} 
              interactive 
              onClick={() => handleNicheSelect(niche)}
              className="group relative"
            >
               {selectedNiche?.id === niche.id && (
                 <div className="absolute top-4 right-4 text-brand-primary">
                    <CheckCircle2 size={24} fill="currentColor" className="text-white" />
                 </div>
               )}

               <div className="mb-6 flex justify-between items-start">
                  <div className={`p-4 rounded-2xl ${niche.bgColor} w-fit`}>
                     <Icon size={32} className={niche.color} />
                  </div>
                  {niche.trend && (
                     <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/10">
                        {renderTrendIcon(niche.trend)}
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{getTrendLabel(niche.trend)}</span>
                     </div>
                  )}
               </div>
               
               <h3 className="text-2xl font-bold text-white mb-2 font-display">{niche.title}</h3>
               <p className="text-slate-400 leading-relaxed font-light">{niche.description}</p>

               <div className="mt-6 pt-6 border-t border-white/5 flex items-center text-sm font-medium text-slate-500 group-hover:text-white transition-colors">
                  Explorar Oportunidades <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
               </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderSubNicheSelection = () => (
    <div className="max-w-6xl mx-auto px-6 pb-20">
      <button 
        onClick={() => setStep(AppStep.SELECT_NICHE)}
        className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
      >
        <ChevronLeft size={16} /> Voltar para Nichos
      </button>

      <PageHeader 
        title={`Oportunidades em ${selectedNiche?.title}`} 
        subtitle="Nossa IA detectou estas 8 micro-oportunidades inexploradas." 
        badge="Passo 2 de 3"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subNiches.map((sub, idx) => (
          <Card 
            key={idx} 
            interactive 
            onClick={() => handleSubNicheSelect(sub.title)}
            className="flex flex-col justify-center min-h-[160px]"
          >
            <div className="flex items-start gap-4">
               <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-slate-400 font-mono text-sm">
                 {idx + 1}
               </div>
               <div>
                  <h3 className="text-xl font-bold text-white mb-2">{sub.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{sub.description}</p>
               </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderResult = () => {
    if (!planResult) return null;

    return (
      <div className="max-w-7xl mx-auto px-4 pb-24 animate-fade-in">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
           <button 
            onClick={() => setStep(AppStep.SELECT_NICHE)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <ChevronLeft size={16} /> Criar Novo App
          </button>
          
          <div className="flex items-center gap-3">
             <Button variant="secondary" onClick={handleSaveToSupabase} disabled={isSaving}>
               {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
               <span className="hidden sm:inline">Salvar Projeto</span>
             </Button>
             <Button variant="primary" onClick={downloadDossier}>
               <Download size={16} /> Baixar Dossiê
             </Button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
           {/* Left: App Identity */}
           <div className="lg:col-span-2 space-y-6">
              <div className="glass-panel p-8 rounded-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-brand-primary/20 transition-all duration-1000"></div>

                 <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                       <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-bold text-white uppercase tracking-wider">
                         App Blueprint Generated
                       </span>
                       <div className="flex flex-col items-center gap-2">
                         {renderBlueprintScore(planResult.blueprintScore)}
                         <Button variant="accent" onClick={handleRefinePlan} className="h-8 text-xs px-3 py-0">
                           <Sparkles size={12} className="mr-1" /> Turbinar Score
                         </Button>
                       </div>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-display font-black text-white mb-2 tracking-tight">
                       {planResult.appName}
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-300 font-light mb-6">
                       {planResult.tagline}
                    </p>
                    
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                       <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                         <Megaphone size={14} /> Elevator Pitch
                       </h3>
                       <p className="text-lg italic text-slate-200 leading-relaxed">"{planResult.elevatorPitch}"</p>
                    </div>
                 </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <Card noPadding className="p-4 flex flex-col items-center justify-center gap-2 text-center min-h-[120px]">
                    <Target size={24} className="text-blue-400" />
                    <span className="text-xs text-slate-500 font-bold uppercase">Complexidade</span>
                    <span className="font-bold text-white">{planResult.complexity}</span>
                 </Card>
                 <Card noPadding className="p-4 flex flex-col items-center justify-center gap-2 text-center min-h-[120px]">
                    <Palette size={24} className="text-purple-400" />
                    <span className="text-xs text-slate-500 font-bold uppercase">Tecnologia</span>
                    <span className="font-bold text-white text-xs">React + Tailwind</span>
                 </Card>
                 <Card noPadding className="p-4 flex flex-col items-center justify-center gap-2 text-center min-h-[120px]">
                    <Users size={24} className="text-rose-400" />
                    <span className="text-xs text-slate-500 font-bold uppercase">Público-Alvo</span>
                    <span className="font-bold text-white text-xs leading-tight line-clamp-3" title={planResult.targetAudience}>{planResult.targetAudience}</span>
                 </Card>
                 <Card noPadding className="p-4 flex flex-col items-center justify-center gap-2 text-center bg-emerald-500/10 border-emerald-500/20 min-h-[120px]">
                    <DollarSign size={24} className="text-emerald-400" />
                    <span className="text-xs text-emerald-500/70 font-bold uppercase">Potencial</span>
                    <span className="font-bold text-emerald-400">Alto</span>
                 </Card>
              </div>
           </div>

           {/* Right: Mockup Preview */}
           <div className="lg:col-span-1">
              <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-2xl flex flex-col overflow-hidden">
                 <div className="h-[32px] w-[3px] bg-gray-800 absolute -left-[17px] top-[72px] rounded-l-lg"></div>
                 <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
                 <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
                 <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
                 {renderMockupScreen(planResult)}
              </div>
           </div>
        </div>

        {/* Deep Dive Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
           {/* SWOT Analysis */}
           <Card>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                 <Scale size={24} className="text-indigo-400" /> Análise de Viabilidade
              </h3>
              <div className="space-y-6">
                 <div>
                    <h4 className="text-emerald-400 font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                       <ThumbsUp size={16} /> Vantagens Competitivas (Pros)
                    </h4>
                    <ul className="space-y-2">
                       {planResult.pros.map((pro, i) => (
                          <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                             {pro}
                          </li>
                       ))}
                    </ul>
                 </div>
                 <div className="h-px bg-white/5"></div>
                 <div>
                    <h4 className="text-rose-400 font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                       <AlertTriangle size={16} /> Desafios (Cons)
                    </h4>
                    <ul className="space-y-2">
                       {planResult.cons.map((con, i) => (
                          <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                             <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></div>
                             {con}
                          </li>
                       ))}
                    </ul>
                 </div>
              </div>
           </Card>

           {/* Monetization */}
           <Card overflowVisible>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                 <DollarSign size={24} className="text-emerald-400" /> Estratégia de Receita
              </h3>
              <div className="space-y-4">
                 {planResult.revenueModels.map((model, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-start gap-4">
                       <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                          <DollarSign size={20} />
                       </div>
                       <div className="w-full">
                          <div className="group relative w-fit cursor-help">
                              <h4 className="font-bold text-white border-b border-dotted border-slate-500 flex items-center gap-2">
                                {model.title}
                                <Info size={14} className="text-slate-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                              </h4>
                              {model.priceReasoning && (
                                <div className="absolute bottom-full left-0 mb-2 w-56 p-3 bg-[#000] border border-white/20 rounded-lg shadow-2xl z-50 hidden group-hover:block animate-fade-in backdrop-blur-xl">
                                  <div className="text-xs text-emerald-400 font-bold mb-1 uppercase tracking-wider">Por que este preço?</div>
                                  <p className="text-xs text-slate-300 leading-relaxed">{model.priceReasoning}</p>
                                  <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-white/20"></div>
                                </div>
                              )}
                          </div>
                          <p className="text-sm text-slate-400 mt-1">{model.description}</p>
                       </div>
                    </div>
                 ))}
                 
                 {/* Simple Calculator */}
                 <div className="mt-6 pt-6 border-t border-white/5">
                    <div className="p-4 rounded-xl bg-emerald-900/10 border border-emerald-500/20">
                       <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold text-emerald-400 flex items-center gap-2"><Calculator size={16} /> Simulador de Ganhos</h4>
                          <span className="text-xs text-slate-400 bg-black/20 px-2 py-1 rounded">Base: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(simulatedPrice)}</span>
                       </div>
                       <div className="space-y-4">
                          <div className="flex justify-between text-sm">
                             <span className="text-slate-400">Usuários Pagantes:</span>
                             <span className="font-bold text-white">{simulatedUsers}</span>
                          </div>
                          <input 
                            type="range" 
                            min="10" 
                            max="1000" 
                            step="10"
                            value={simulatedUsers} 
                            onChange={(e) => setSimulatedUsers(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                          />
                          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-emerald-500/20 mt-4">
                              <div>
                                  <span className="text-xs text-slate-400 block mb-1">Faturamento Mensal</span>
                                  <span className="text-lg font-bold text-emerald-400">
                                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(simulatedUsers * simulatedPrice)}
                                  </span>
                              </div>
                              <div>
                                  <span className="text-xs text-slate-400 block mb-1">Faturamento Anual</span>
                                  <span className="text-lg font-bold text-emerald-300">
                                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(simulatedUsers * simulatedPrice * 12)}
                                  </span>
                              </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </Card>
        </div>

        {/* Roadmap */}
        <div className="mb-12">
           <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Calendar size={28} className="text-amber-400" /> Plano de Execução (4 Semanas)
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {planResult.implementationRoadmap.map((week, idx) => (
                 <Card key={idx} className="relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary to-purple-500 opacity-50"></div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">{week.week}</span>
                    <h4 className="font-bold text-white mb-4 text-lg">{week.title}</h4>
                    <ul className="space-y-3">
                       {week.tasks.map((task, tIdx) => (
                          <li key={tIdx} className="flex items-start gap-2 text-sm text-slate-300">
                             <div className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 shrink-0"></div>
                             {task}
                          </li>
                       ))}
                    </ul>
                 </Card>
              ))}
           </div>
        </div>

        {/* Marketing Strategy */}
        <div className="mb-12">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Megaphone size={28} className="text-rose-400" /> Growth Hacking
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {planResult.marketingStrategy.map((strategy, idx) => (
               <Card key={idx} className="hover:border-rose-500/30 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 font-bold">
                      {idx + 1}
                    </div>
                    <h4 className="font-bold text-white">{strategy.title}</h4>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{strategy.description}</p>
               </Card>
             ))}
           </div>
        </div>

        {/* Tech Prompt */}
        <div className="mb-12">
           <Card className="bg-[#0F0F0F] border-slate-800">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Terminal size={24} className="text-blue-400" /> Prompt de Engenharia
                 </h3>
                 <div className="flex gap-2">
                   <Button variant="secondary" onClick={() => copyToClipboard(planResult.technicalPrompt)}>
                      <Copy size={16} /> Copiar
                   </Button>
                   <Button variant="primary" onClick={handleLaunchAIStudio}>
                      <ExternalLink size={16} /> Abrir AI Studio
                   </Button>
                 </div>
              </div>
              <div className="relative">
                 <pre className="bg-black/50 p-6 rounded-xl text-slate-400 text-sm font-mono overflow-x-auto whitespace-pre-wrap max-h-[300px] border border-white/5">
                    {planResult.technicalPrompt}
                 </pre>
                 <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#0F0F0F] to-transparent pointer-events-none"></div>
              </div>
           </Card>
        </div>

        {/* Consultant Chat */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
           {isChatOpen && (
              <div className="mb-4 w-[350px] md:w-[400px] max-h-[500px] flex flex-col bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto animate-slide-up origin-bottom-right">
                 <div className="p-4 bg-[#252525] border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center">
                          <Bot size={18} className="text-white" />
                       </div>
                       <div>
                          <h4 className="font-bold text-white text-sm">AppBoss Advisor</h4>
                          <span className="text-xs text-emerald-500 font-mono flex items-center gap-1">
                             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
                          </span>
                       </div>
                    </div>
                    <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white p-1">
                       <X size={18} />
                    </button>
                 </div>

                 <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[350px] min-h-[300px]">
                    {chatMessages.map((msg, idx) => (
                       <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                             msg.role === 'user' 
                             ? 'bg-brand-primary text-white rounded-br-none' 
                             : 'bg-white/5 text-slate-200 border border-white/5 rounded-bl-none'
                          }`}>
                             {msg.content}
                          </div>
                       </div>
                    ))}
                    {isChatTyping && (
                       <div className="flex justify-start">
                          <div className="bg-white/5 p-3 rounded-2xl rounded-bl-none flex gap-1">
                             <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                             <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                             <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                          </div>
                       </div>
                    )}
                    <div ref={chatEndRef}></div>
                 </div>
                 
                 {chatMessages.length < 3 && (
                    <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                       {SUGGESTED_QUESTIONS.map((q, i) => (
                          <button 
                             key={i} 
                             onClick={() => handleSendMessage(q)}
                             className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-xs text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                          >
                             {q}
                          </button>
                       ))}
                    </div>
                 )}

                 <div className="p-4 border-t border-white/5 bg-[#252525]">
                    <div className="relative">
                       <input 
                          type="text" 
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Pergunte sobre marketing, tech..." 
                          className="w-full bg-[#151515] border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-brand-primary/50 transition-colors"
                       />
                       <button 
                          onClick={() => handleSendMessage()}
                          disabled={!chatInput.trim() || isChatTyping}
                          className="absolute right-2 top-2 p-1.5 bg-brand-primary rounded-lg text-white hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                       >
                          <Send size={16} />
                       </button>
                    </div>
                 </div>
              </div>
           )}

           <button 
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="pointer-events-auto h-14 w-14 rounded-full bg-brand-primary shadow-lg shadow-brand-primary/30 flex items-center justify-center text-white hover:scale-105 transition-transform group relative"
           >
              {isChatOpen ? <X size={24} /> : <MessageSquare size={24} />}
              {!isChatOpen && (
                 <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-[#0A0A0A]"></span>
              )}
           </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen text-slate-200 font-sans selection:bg-white/20 selection:text-white">
      {user && renderOnboardingModal()}
      {renderCustomIdeaModal()}

      <nav className="w-full border-b border-white/5 bg-[#030303]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={resetFlow} role="button">
            <div className="bg-white p-1.5 rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.3)] group-hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] transition-shadow duration-300">
              <Crown size={20} className="text-black" />
            </div>
            <div>
               <span className="font-bold font-display text-lg tracking-tight metallic-text block leading-none">AppBoss</span>
               <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Enterprise Edition</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             {user && (
               <button 
                onClick={openOnboarding}
                className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-all"
                title="Ajuda"
               >
                 <HelpCircle size={20} />
               </button>
             )}
             
             {user ? (
                <div className="flex items-center gap-3">
                   <div className="hidden sm:flex flex-col items-end">
                      <span className="text-xs font-bold text-white">{user.email?.split('@')[0]}</span>
                      {isPaid && <span className="text-[10px] text-emerald-500 font-mono">PREMIUM</span>}
                   </div>
                   <button 
                    onClick={handleLogout}
                    className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-rose-500/10 hover:border-rose-500/50 hover:text-rose-500 transition-all text-slate-400"
                    title="Sair"
                   >
                     <LogOut size={18} />
                   </button>
                </div>
             ) : (
               <Button 
                variant="secondary" 
                onClick={() => setShowAuthModal(true)}
                className="h-9 px-4 text-xs font-bold tracking-wide"
               >
                 <User size={14} className="mr-2"/> Login
               </Button>
             )}

             <div className="hidden sm:block h-8 w-px bg-white/10 mx-2"></div>
             <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${user ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`}></div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{user ? 'Online' : 'Locked'}</span>
             </div>
          </div>
        </div>
      </nav>

      <main className="pt-12">
        {!authChecked ? (
          <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center">
            <Loader2 size={40} className="text-brand-primary animate-spin mb-4" />
            <p className="text-slate-500 font-mono text-sm">Verificando credenciais...</p>
          </div>
        ) : isLoading ? (
          renderLoading()
        ) : !user ? (
          renderLandingPage()
        ) : !isPaid ? (
          renderPaymentWall()
        ) : (
          <>
            {renderTabNavigation()}

            {activeTab === 'radar' && step === AppStep.SELECT_NICHE && (
              renderMarketRadar()
            )}

            {activeTab === 'create' && (
              <>
                {step === AppStep.SELECT_NICHE && renderNicheSelection()}
                {step === AppStep.SELECT_SUBNICHE && renderSubNicheSelection()}
                {step === AppStep.VIEW_RESULT && renderResult()}
              </>
            )}
          </>
        )}
      </main>
      
      <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
          onSignUp={signUpUser}
          onSignIn={signInUser}
        />

        <Toast message={toastMessage} isVisible={showToast} />
    </div>
  );
};

export default App;
