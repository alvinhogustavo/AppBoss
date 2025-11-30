
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase com a chave SECRETA (Service Role)
// Essa chave permite escrever no banco sem estar logado como usuário
// VOCÊ PRECISA ADICIONAR 'SUPABASE_SERVICE_ROLE_KEY' NAS VARIÁVEIS DA VERCEL
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ehgfhlgrficulnijmmmc.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  // Apenas aceita POST (que é como a Cakto envia)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!supabaseServiceKey) {
    console.error('ERRO: SUPABASE_SERVICE_ROLE_KEY não configurada na Vercel');
    return res.status(500).json({ error: 'Server Configuration Error' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const payload = req.body;

  console.log('Webhook Cakto recebido:', payload);

  // Lógica para identificar o pagamento da Cakto
  // A estrutura do payload da Cakto pode variar, mas geralmente buscamos o status e o email
  
  try {
    const status = payload.status || payload.current_status; // ex: 'approved', 'paid', 'refunded'
    const customer = payload.customer || payload.buyer;
    const email = customer?.email;

    if (!email) {
      return res.status(400).json({ error: 'Email not found in payload' });
    }

    let isPaid = false;

    // Verifica se foi aprovado
    if (status === 'approved' || status === 'paid' || status === 'completed') {
      isPaid = true;
    } 
    // Verifica se foi cancelado/reembolsado
    else if (status === 'refunded' || status === 'chargeback' || status === 'canceled') {
      isPaid = false;
    } else {
      // Outros status (pending, processing) ignoramos por enquanto
      return res.status(200).json({ message: 'Status ignored' });
    }

    // Atualiza a tabela 'profiles' no Supabase
    // Busca o usuário pelo email na tabela profiles (assumindo que o email foi salvo lá)
    // Nota: A tabela profiles deve ter o email sincronizado. 
    // Se não tiver, precisamos buscar na tabela auth.users primeiro, mas auth.users não é acessível facilmente via API direta.
    // Vamos tentar atualizar direto na profiles baseada na coluna email que criamos.

    const { data, error } = await supabase
      .from('profiles')
      .update({ is_paid: isPaid })
      .eq('email', email);

    if (error) {
      console.error('Erro ao atualizar Supabase:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, message: `User ${email} payment status updated to ${isPaid}` });

  } catch (err) {
    console.error('Erro processando webhook:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
