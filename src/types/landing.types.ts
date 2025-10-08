export interface Database {
  public: {
    Tables: {
      landing_blog_posts: {
        Row: {
          id: string;
          slug: string;
          title: string;
          subtitle: string | null;
          content: string;
          excerpt: string | null;
          author_name: string;
          author_avatar: string | null;
          category: string;
          tags: string[] | null;
          cover_image: string | null;
          read_time: number | null;
          views: number;
          likes: number;
          published: boolean;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['landing_blog_posts']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['landing_blog_posts']['Insert']>;
      };
      landing_contact_submissions: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          crn: string | null;
          subject: string;
          message: string;
          status: string;
          source: string;
          ip_address: string | null;
          user_agent: string | null;
          replied_at: string | null;
          replied_by: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['landing_contact_submissions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['landing_contact_submissions']['Insert']>;
      };
      landing_newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          source: string;
          confirmed: boolean;
          confirmation_token: string | null;
          confirmed_at: string | null;
          unsubscribed: boolean;
          unsubscribed_at: string | null;
          tags: string[] | null;
          metadata: Record<string, any> | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['landing_newsletter_subscribers']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['landing_newsletter_subscribers']['Insert']>;
      };
    };
  };
}

export type BlogPost = Database['public']['Tables']['landing_blog_posts']['Row'];
export type ContactSubmission = Database['public']['Tables']['landing_contact_submissions']['Row'];
export type NewsletterSubscriber = Database['public']['Tables']['landing_newsletter_subscribers']['Row'];
