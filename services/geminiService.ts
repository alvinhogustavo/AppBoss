
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AppPlanResult, SubNicheOption, ChatMessage } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelId = "gemini-2.5-flash";

/**
 * Generates specific sub-niches based on a broad category.
 */
export const generateSubNiches = async (niche: string): Promise<SubNicheOption[]> => {
  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "Nome curto do sub-nicho. Ex: 'Micro-SaaS de Agendamento'" },
        description: { type: Type.STRING, description: "Uma frase explicando o que esse tipo de app faz e para quem é." }
      },
      required: ["title", "description"]
    },
    description: "A list of 8 specific app ideas or sub-niches focused on daily problems with descriptions.",
  };

  // Add a random seed to force variety and bypass caching
  const seed = Math.floor(Math.random() * 100000);

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Atue como um Consultor de Inovação Disruptiva. (Sessão Criativa #${seed}).
      
      O usuário quer criar um aplicativo para resolver problemas do dia a dia no nicho de "${niche}".
      
      Gere uma lista de **8 ideias de sub-nichos ou categorias específicas**.
      
      IMPORTANTE - FATOR DE VARIEDADE:
      - NÃO gere apenas as ideias mais óbvias ou populares.
      - Tente encontrar "Oceanos Azuis" e micro-problemas específicos.
      - Varie entre soluções B2B (para pequenos negócios) e B2C (uso pessoal).
      
      Critérios:
      1. Foco em "Pain Killers": Resolver uma dor imediata ou facilitar muito uma tarefa chata do cotidiano brasileiro.
      2. Viável para IA Generativa: Ideias que possam ser codificadas por uma IA (Web App simples, Calculadoras, Gestão, Dashboards).
      3. Público-alvo claro.
      4. IDIOMA: Português do Brasil.
      
      Para cada item, forneça um Título curto e uma Descrição explicativa para que o usuário entenda o conceito.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.85, // Increased temperature for more creativity/randomness
      },
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as SubNicheOption[];
  } catch (error) {
    console.error("Error generating sub-niches:", error);
    // Fallback data updated to objects
    return [
      { title: "Agendamento para Autônomos", description: "Apps para manicures, barbeiros e freelas gerenciarem horários." },
      { title: "Marketplace de Serviços Locais", description: "Conecta prestadores de serviço do bairro com vizinhos." },
      { title: "Gestão de Despesas Pessoais", description: "Controle financeiro simplificado para quem não gosta de planilhas." },
      { title: "Controle de Hábitos Diários", description: "Gamificação para beber água, ler e exercitar-se." },
      { title: "Clube de Assinatura de Conteúdo", description: "Plataforma para vender cursos ou newsletters exclusivas." },
      { title: "Guia de Turismo Local", description: "Dicas de passeios e lugares escondidos na cidade." },
      { title: "Gestão de Estoque Simples", description: "Controle de entrada e saída para pequenos vendedores do Instagram." },
      { title: "Delivery Nichado", description: "Entregas focadas em apenas um tipo de produto (ex: doces, orgânicos)." }
    ]; 
  }
};

/**
 * Generates the full app plan including the prompt and marketing steps.
 */
export const generateAppPlan = async (niche: string, subNiche: string, isRefinement: boolean = false): Promise<AppPlanResult> => {
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      appName: { type: Type.STRING, description: "A catchy Brazilian Portuguese name for the app. NO 'Flow' suffix." },
      tagline: { type: Type.STRING, description: "A short value proposition in Portuguese." },
      elevatorPitch: { type: Type.STRING, description: "A 30-second persuasive speech (approx 3-4 sentences) selling the idea to an investor." },
      blueprintScore: { type: Type.NUMBER, description: "A score from 0.0 to 10.0 evaluating the idea quality and market potential." },
      targetAudience: { type: Type.STRING, description: "Definição detalhada da Persona (quem compra). Ex: 'Pequenos donos de petshop que usam caderno'." },
      complexity: { type: Type.STRING, enum: ["Baixa", "Média", "Alta"], description: "Technical difficulty level." },
      pros: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 principais vantagens ou oportunidades de mercado deste app." },
      cons: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 principais desafios, riscos ou dificuldades deste app." },
      technicalPrompt: { 
        type: Type.STRING, 
        description: "A comprehensive prompt to be pasted into Google AI Studio to generate the actual CODE." 
      },
      techStackRecommendation: {
        type: Type.STRING,
        description: "Always return 'Google AI Studio'."
      },
      revenueModels: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Strategy name and price. Ex: 'Assinatura (R$ 29,90)'" },
            description: { type: Type.STRING, description: "Short explanation of the value provided to justify the price." },
            priceReasoning: { type: Type.STRING, description: "A short justification for this price point (e.g., 'Competitor Avg' or 'Low Barrier')." }
          },
          required: ["title", "description", "priceReasoning"]
        },
        description: "List 3 specific ways to monetize including SUGGESTED PRICES in BRL (R$)."
      },
      implementationRoadmap: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            week: { type: Type.STRING, description: "Ex: 'Semana 1'" },
            title: { type: Type.STRING, description: "Main phase goal. Ex: 'MVP & Validação'" },
            tasks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "2-3 key tasks for this week." }
          },
          required: ["week", "title", "tasks"]
        },
        description: "A 4-week execution plan to build and launch."
      },
      colorPalette: {
        type: Type.OBJECT,
        properties: {
          primary: { type: Type.STRING, description: "Main brand color HEX code" },
          secondary: { type: Type.STRING, description: "Secondary brand color HEX code" },
          accent: { type: Type.STRING, description: "Accent/Call-to-action color HEX code" },
          background: { type: Type.STRING, description: "Background color HEX code (usually dark or light neutral)" },
        },
        required: ["primary", "secondary", "accent", "background"]
      },
      marketingStrategy: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
          },
          required: ["title", "description"],
        },
      },
    },
    required: ["appName", "tagline", "elevatorPitch", "blueprintScore", "targetAudience", "complexity", "pros", "cons", "technicalPrompt", "marketingStrategy", "techStackRecommendation", "revenueModels", "colorPalette", "implementationRoadmap"],
  };

  try {
    const isCustomIdea = niche === "Ideia Personalizada";
    
    let contextPrompt = "";
    if (isRefinement) {
       contextPrompt = `
       MODO: SUPER OTIMIZAÇÃO (NÍVEL DEUS).
       O usuário já gerou um plano para "${subNiche}", mas quer elevá-lo ao nível 10/10.
       
       SUA MISSÃO:
       1. Adicione "Killer Features" que tornem o app único.
       2. Refine o Prompt Técnico para usar as bibliotecas mais modernas e animations complexas.
       3. Aumente o ticket médio da monetização.
       4. OBRIGATÓRIO: O 'blueprintScore' DEVE ser entre 9.8 e 10.0.
       `;
    } else {
       contextPrompt = isCustomIdea 
        ? `O usuário tem uma **IDEIA PERSONALIZADA**: "${subNiche}". Analise a viabilidade.`
        : `O usuário escolheu o nicho "${niche}" e o foco "${subNiche}".`;
       
       contextPrompt += `
       AVALIAÇÃO INICIAL:
       - O 'blueprintScore' deve ser realista (entre 7.0 e 8.5) baseado na dificuldade de execução e mercado.
       `;
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Atue como um Especialista Sênior em Produtos Digitais focado no mercado Brasileiro.
      
      ${contextPrompt}
      
      Objetivo: Criar um plano completo para ele colar na IA e sair com o app pronto.
      
      CRITÉRIOS DE COMPLEXIDADE (SEJA RÍGIDO):
      - "Baixa": Landing pages, calculadoras, listas estáticas, conteúdo informativo.
      - "Média": CRUD completo, Autenticação, Dashboards simples, Armazenamento local.
      - "Alta": Geolocalização tempo real, Chat ao vivo, Pagamentos integrados, IA complexa, Marketplace de duas pontas.
      
      1. IDENTIDADE (PROIBIDO INGLÊS):
         - Nome: PORTUGUÊS DO BRASIL. Criativo.
         - PROIBIDO: Sufixo "Flow", "Fy".
         - Elevator Pitch: Um parágrafo curto e poderoso.
      
      2. TECNOLOGIA:
         - Stack: "Google AI Studio".
         - Models de Receita: Preços em R$.
      
      3. PROMPT TÉCNICO (SILICON VALLEY STANDARD):
         ${isRefinement ? "ADICIONE EFEITOS VISUAIS AVANÇADOS, FRAMER MOTION, E LAYOUTS BENTO GRID." : ""}
         Instruções: "Atue como Product Designer do Vale do Silício. Crie um SPA React + Tailwind + Lucide.
         ESTÉTICA: Clean, Minimal, Tipografia Refinada, Micro-Interações, Sombras (shadow-xl), Bordas Sutis.
         ESTRUTURA: Mobile-First, Sidebar/BottomNav, Dashboard Rico.
         LOCALIZAÇÃO: pt-BR, R$, Dados Mockados Realistas."
      
      4. MARKETING: 5 passos práticos de Growth Hacking BR.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: isRefinement ? 0.95 : 0.85, 
      },
    });

    const text = response.text;
    if (!text) throw new Error("No content generated");
    return JSON.parse(text) as AppPlanResult;
  } catch (error) {
    console.error("Error generating plan:", error);
    throw error;
  }
};

/**
 * Acts as an interactive consultant for the generated plan.
 */
export const getConsultantResponse = async (plan: AppPlanResult, history: ChatMessage[], newMessage: string): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: modelId,
      config: {
        systemInstruction: `Você é o "AppBoss Advisor", um Product Manager Sênior do Vale do Silício.
        
        PROJETO: ${plan.appName} (${plan.blueprintScore}/10)
        TAGLINE: ${plan.tagline}
        
        Responda dúvidas sobre como criar, vender ou melhorar este app no Brasil. Seja direto.`,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.content }]
      }))
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "Desculpe, não consegui processar sua dúvida agora.";
  } catch (error) {
    console.error("Error in consultant chat:", error);
    return "Estou analisando muitas requisições no momento. Tente novamente em instantes.";
  }
};