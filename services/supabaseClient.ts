
import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// CONFIGURAÇÃO DO SUPABASE
// ------------------------------------------------------------------
// A URL do seu projeto
const supabaseUrl = 'https://ehgfhlgrficulnijmmmc.supabase.co';

// A chave 'anon public' correta (JWT)
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoZ2ZobGdyZmljdWxuaWptbW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MTYzNTgsImV4cCI6MjA4MDA5MjM1OH0.ePmlWGlcIVcFpxweD2XjfoPRCUeQ0wRV-MvV4A_j5dk'; 

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true, // Mantém o usuário logado mesmo se fechar a aba
    autoRefreshToken: true,
    detectSessionInUrl: true
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