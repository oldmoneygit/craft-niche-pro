import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBlogPost } from '@/lib/supabase-landing';
import type { BlogPost as BlogPostType } from '@/types/landing.types';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadPost();
    }
  }, [slug]);

  const loadPost = async () => {
    try {
      const data = await getBlogPost(slug!);
      setPost(data);
    } catch (err) {
      setError('Post não encontrado');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'Post não encontrado'}
          </h1>
          <Link to="/blog" className="text-emerald-600 hover:underline">
            Voltar para o blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-emerald-600 hover:underline mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o blog
        </Link>

        <div className="mb-8">
          <div className="inline-block px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium rounded-full mb-4">
            {post.category}
          </div>

          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {post.title}
          </h1>

          {post.subtitle && (
            <p className="text-2xl text-gray-600 dark:text-gray-400 mb-6">
              {post.subtitle}
            </p>
          )}

          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {post.published_at && (
                <span>{format(new Date(post.published_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
              )}
            </div>
            {post.read_time && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{post.read_time} min de leitura</span>
              </div>
            )}
            <div>Por {post.author_name}</div>
          </div>
        </div>

        {post.cover_image && (
          <div className="mb-12 rounded-2xl overflow-hidden">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-auto"
            />
          </div>
        )}

        <div
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Tags:
            </h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
