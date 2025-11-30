
export interface NicheOption {
  id: string;
  title: string;
  description: string;
  iconName: string;
  color: string; // Tailwind text color class (ex: text-purple-400)
  bgColor: string; // Tailwind bg color class (ex: bg-purple-500/10)
  trend: 'hot' | 'saturated' | 'rising' | 'premium'; // Trend indicator
}

export interface SubNicheOption {
  title: string;
  description: string;
}

export interface MarketingStep {
  title: string;
  description: string;
}

export interface RevenueModel {
  title: string;
  description: string;
  priceReasoning: string;
}

export interface RoadmapStep {
  week: string;
  title: string;
  tasks: string[];
}

export interface AppPlanResult {
  appName: string;
  tagline: string;
  elevatorPitch: string;
  blueprintScore: number; // 0.0 to 10.0
  technicalPrompt: string;
  techStackRecommendation: string;
  targetAudience: string;
  complexity: 'Baixa' | 'Média' | 'Alta';
  pros: string[];
  cons: string[];
  revenueModels: RevenueModel[];
  implementationRoadmap: RoadmapStep[];
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  marketingStrategy: MarketingStep[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export enum AppStep {
  SELECT_NICHE = 0,
  SELECT_SUBNICHE = 1,
  LOADING_PLAN = 2,
  VIEW_RESULT = 3,
}