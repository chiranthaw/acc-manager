import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSupabaseClient } from './lib/supabase';

function NewsDetail() {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      setError('');
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        setNews(data);
      } catch (err) {
        setError(err.message || 'Could not load news.');
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, [id]);

  if (loading) return <div className="text-center py-12 text-slate-400">Loading...</div>;
  if (error) return <div className="text-center py-12 text-rose-400">{error}</div>;
  if (!news) return <div className="text-center py-12 text-slate-400">News not found.</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Link to="/" className="text-indigo-500 hover:underline">&larr; Back to News</Link>
      <h1 className="text-3xl font-bold mt-4 mb-2 text-white">{news.title}</h1>
      <p className="text-slate-400 text-sm mb-4">{news.date}</p>
      {news.image_url && (
        <div className="mb-4 flex justify-center">
          <img src={news.image_url} alt="News" className="max-h-64 rounded shadow" style={{objectFit:'contain'}} />
        </div>
      )}
      <p className="text-lg text-slate-300 mb-3">{news.summary}</p>
      <div className="text-slate-200 whitespace-pre-line">{news.content}</div>
    </div>
  );
}

export default NewsDetail;
