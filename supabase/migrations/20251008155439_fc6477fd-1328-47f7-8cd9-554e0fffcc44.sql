-- ============================================
-- LANDING PAGE - TABELAS ISOLADAS
-- ============================================
-- IMPORTANTE: Estas tabelas são INDEPENDENTES 
-- das tabelas da plataforma administrativa
-- ============================================

-- 1. BLOG POSTS
CREATE TABLE IF NOT EXISTS landing_blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    content TEXT NOT NULL,
    excerpt TEXT,
    author_name TEXT DEFAULT 'Equipe KorLab',
    author_avatar TEXT,
    category TEXT NOT NULL,
    tags TEXT[],
    cover_image TEXT,
    read_time INTEGER,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_slug ON landing_blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON landing_blog_posts(published, published_at DESC);
CREATE INDEX idx_blog_posts_category ON landing_blog_posts(category);

-- 2. CONTACT FORM SUBMISSIONS
CREATE TABLE IF NOT EXISTS landing_contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    crn TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    source TEXT DEFAULT 'contact_form',
    ip_address TEXT,
    user_agent TEXT,
    replied_at TIMESTAMP WITH TIME ZONE,
    replied_by TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_contact_status ON landing_contact_submissions(status, created_at DESC);
CREATE INDEX idx_contact_email ON landing_contact_submissions(email);

-- 3. NEWSLETTER SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS landing_newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    source TEXT DEFAULT 'footer',
    confirmed BOOLEAN DEFAULT false,
    confirmation_token TEXT UNIQUE,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    unsubscribed BOOLEAN DEFAULT false,
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    tags TEXT[],
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_newsletter_email ON landing_newsletter_subscribers(email);
CREATE INDEX idx_newsletter_confirmed ON landing_newsletter_subscribers(confirmed);

-- 4. FAQ INTERACTIONS
CREATE TABLE IF NOT EXISTS landing_faq_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id TEXT NOT NULL,
    action TEXT NOT NULL,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_faq_question ON landing_faq_interactions(question_id, action);

-- 5. PRICING CLICKS (Analytics)
CREATE TABLE IF NOT EXISTS landing_pricing_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_name TEXT NOT NULL,
    button_text TEXT,
    source_page TEXT,
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pricing_plan ON landing_pricing_clicks(plan_name, created_at DESC);

-- 6. PAGE VIEWS (Simple Analytics)
CREATE TABLE IF NOT EXISTS landing_page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_path TEXT NOT NULL,
    page_title TEXT,
    referrer TEXT,
    ip_address TEXT,
    user_agent TEXT,
    session_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_page_views_path ON landing_page_views(page_path, created_at DESC);
CREATE INDEX idx_page_views_session ON landing_page_views(session_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE landing_blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Público pode ler posts publicados"
ON landing_blog_posts FOR SELECT
USING (published = true);

ALTER TABLE landing_contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Público pode enviar mensagens"
ON landing_contact_submissions FOR INSERT
WITH CHECK (true);

ALTER TABLE landing_newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Público pode se inscrever"
ON landing_newsletter_subscribers FOR INSERT
WITH CHECK (true);

ALTER TABLE landing_faq_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Público pode interagir com FAQ"
ON landing_faq_interactions FOR INSERT
WITH CHECK (true);

ALTER TABLE landing_pricing_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Público pode clicar em preços"
ON landing_pricing_clicks FOR INSERT
WITH CHECK (true);

ALTER TABLE landing_page_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Público pode registrar pageviews"
ON landing_page_views FOR INSERT
WITH CHECK (true);

-- ============================================
-- FUNCTIONS ÚTEIS
-- ============================================

CREATE OR REPLACE FUNCTION increment_blog_views(post_slug TEXT)
RETURNS void AS $$
BEGIN
    UPDATE landing_blog_posts
    SET views = views + 1
    WHERE slug = post_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_popular_posts(limit_count INTEGER DEFAULT 5)
RETURNS TABLE (
    id UUID,
    slug TEXT,
    title TEXT,
    excerpt TEXT,
    cover_image TEXT,
    views INTEGER,
    published_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bp.id,
        bp.slug,
        bp.title,
        bp.excerpt,
        bp.cover_image,
        bp.views,
        bp.published_at
    FROM landing_blog_posts bp
    WHERE bp.published = true
    ORDER BY bp.views DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SEED DATA (Posts de exemplo)
-- ============================================

INSERT INTO landing_blog_posts (slug, title, subtitle, content, excerpt, category, tags, read_time, published, published_at) VALUES
(
    'como-ia-transforma-nutricao-clinica',
    'Como a IA Está Transformando a Nutrição Clínica',
    'Descubra o futuro da nutrição personalizada',
    '<h2>Introdução</h2><p>A inteligência artificial está revolucionando a forma como nutricionistas trabalham. Com ferramentas de IA, é possível criar planos alimentares personalizados em minutos, analisar dados de pacientes de forma mais eficiente e oferecer um atendimento muito mais preciso.</p><h2>Economia de Tempo</h2><p>Estudos mostram que nutricionistas podem economizar até 70% do tempo na criação de planos alimentares utilizando IA. Isso significa mais tempo para atender pacientes e menos tempo em tarefas administrativas.</p><h2>Personalização Avançada</h2><p>A IA analisa múltiplos fatores simultaneamente - preferências alimentares, restrições, objetivos, histórico médico - para criar planos verdadeiramente personalizados.</p>',
    'Descubra como a inteligência artificial pode economizar até 70% do seu tempo na criação de planos alimentares personalizados.',
    'Tecnologia',
    ARRAY['IA', 'Tecnologia', 'Inovação'],
    5,
    true,
    NOW() - INTERVAL '3 days'
),
(
    '10-dicas-adesao-pacientes',
    '10 Dicas para Aumentar a Adesão dos Pacientes',
    'Estratégias comprovadas de engajamento',
    '<h2>Dica 1: Comunicação Clara</h2><p>A comunicação é fundamental para o sucesso do tratamento nutricional. Certifique-se de que seus pacientes entendem claramente as orientações.</p><h2>Dica 2: Metas Realistas</h2><p>Estabeleça metas alcançáveis e celebre cada conquista, por menor que seja.</p><h2>Dica 3: Acompanhamento Regular</h2><p>Mantenha contato frequente com seus pacientes através de mensagens, lembretes e consultas de acompanhamento.</p><h2>Dica 4: Flexibilidade</h2><p>Adapte os planos conforme necessário. A rigidez pode levar ao abandono do tratamento.</p>',
    'Estratégias práticas e comprovadas para melhorar o engajamento e os resultados dos seus pacientes.',
    'Gestão',
    ARRAY['Pacientes', 'Engajamento', 'Resultados'],
    8,
    true,
    NOW() - INTERVAL '6 days'
),
(
    'lgpd-pratica-guia-nutricionistas',
    'LGPD na Prática: Guia para Nutricionistas',
    'Tudo sobre proteção de dados',
    '<h2>O que é LGPD?</h2><p>A Lei Geral de Proteção de Dados (LGPD) regula o tratamento de dados pessoais no Brasil. Para nutricionistas, isso significa cuidados especiais com dados de saúde dos pacientes.</p><h2>Principais Obrigações</h2><p>Você deve obter consentimento explícito, garantir a segurança dos dados, permitir que pacientes acessem seus dados e mais.</p><h2>Como o KorLab Ajuda</h2><p>Nossa plataforma já vem com todas as proteções necessárias para você estar em conformidade com a LGPD desde o primeiro dia.</p>',
    'Tudo que você precisa saber sobre proteção de dados de pacientes e como estar em conformidade com a lei.',
    'Legal',
    ARRAY['LGPD', 'Privacidade', 'Compliance'],
    6,
    true,
    NOW() - INTERVAL '10 days'
);

COMMENT ON TABLE landing_blog_posts IS 'Posts do blog da landing page';
COMMENT ON TABLE landing_contact_submissions IS 'Mensagens enviadas pelo formulário de contato';
COMMENT ON TABLE landing_newsletter_subscribers IS 'Inscritos na newsletter';
COMMENT ON TABLE landing_faq_interactions IS 'Interações com perguntas frequentes';
COMMENT ON TABLE landing_pricing_clicks IS 'Analytics de cliques em planos';
COMMENT ON TABLE landing_page_views IS 'Visualizações de páginas (analytics simples)';