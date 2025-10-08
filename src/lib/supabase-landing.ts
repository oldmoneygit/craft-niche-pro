import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/landing.types';

const supabaseUrl = "https://qmjzalbrehakxhvwrdkt.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtanphbGJyZWhha3hodndyZGt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMDgzNTYsImV4cCI6MjA3NDU4NDM1Nn0.QVru71BO_pMkblcFb6uQ_68kRCXfmfiGQV2Rv5_iKsU";

// Cliente específico para landing page
export const supabaseLanding = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Helper para tracking de page views
export async function trackPageView(path: string, title: string) {
  try {
    await supabaseLanding.from('landing_page_views').insert({
      page_path: path,
      page_title: title,
      referrer: document.referrer,
      user_agent: navigator.userAgent,
    } as any);
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
}

// Helper para enviar contato
export async function submitContactForm(data: {
  name: string;
  email: string;
  phone?: string;
  crn?: string;
  subject: string;
  message: string;
  source?: string;
}) {
  const { data: submission, error } = await supabaseLanding
    .from('landing_contact_submissions')
    .insert({
      ...data,
      user_agent: navigator.userAgent,
    } as any)
    .select()
    .single();

  if (error) throw error;
  return submission;
}

// Helper para inscrever newsletter
export async function subscribeNewsletter(email: string, name?: string, source = 'footer') {
  const { data, error } = await supabaseLanding
    .from('landing_newsletter_subscribers')
    .insert({
      email,
      name,
      source,
    } as any)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Este e-mail já está cadastrado!');
    }
    throw error;
  }

  return data;
}

// Helper para buscar posts do blog
export async function getBlogPosts(limit = 6) {
  const { data, error } = await supabaseLanding
    .from('landing_blog_posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

// Helper para buscar post individual
export async function getBlogPost(slug: string) {
  const { data, error } = await supabaseLanding
    .from('landing_blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error) throw error;

  // Incrementar views (ignorar erro se função não existir ainda)
  try {
    // @ts-ignore - RPC function may not be typed yet
    await supabaseLanding.rpc('increment_blog_views', { post_slug: slug });
  } catch (e) {
    console.log('View increment skipped:', e);
  }

  return data;
}

// Helper para track pricing clicks
export async function trackPricingClick(planName: string, buttonText: string, sourcePage: string) {
  try {
    await supabaseLanding.from('landing_pricing_clicks').insert({
      plan_name: planName,
      button_text: buttonText,
      source_page: sourcePage,
      user_agent: navigator.userAgent,
      referrer: document.referrer,
    } as any);
  } catch (error) {
    console.error('Error tracking pricing click:', error);
  }
}
