import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Validação das variáveis de ambiente
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Variáveis de ambiente do Supabase não configuradas!')
  console.error('Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Criar cliente com valores padrão seguros se não configurado
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// Função helper para verificar se Supabase está configurado
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://placeholder.supabase.co')
}
