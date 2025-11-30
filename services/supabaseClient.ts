
import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// CONFIGURAÇÃO DO SUPABASE
// ------------------------------------------------------------------
// A URL do seu projeto (verifique se termina em .co ou .com no seu painel)
const supabaseUrl = 'https://ehgfhlgrficulnijmmmc.supabase.co';

// A chave 'anon public' fornecida
const supabaseKey = 'sb_publishable_nSELKjYPdOcHWUv_mAG5sw_qO07Lcn1'; 

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// --- AUTH SERVICES ---

export const signUpUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signInUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// --- DB SERVICES ---

export const saveProjectToDb = async (plan: any, niche: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('Usuário não logado, não é possível salvar.');
      return null;
    }

    const payload = { 
      app_name: plan.appName, 
      niche: niche,
      blueprint_score: plan.blueprintScore,
      full_plan: plan,
    };

    const { data, error } = await supabase
      .from('projects')
      .insert([payload])
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao salvar no Supabase:', error);
    return null;
  }
};
