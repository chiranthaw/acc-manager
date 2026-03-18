
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSupabaseClient } from '../lib/supabase';

function NewsDetail() {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Theme state: 'dark' | 'light'
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

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

  if (loading) return <div className={theme === 'dark' ? 'text-center py-12 text-slate-400 bg-gray-900 min-h-screen' : 'text-center py-12 text-gray-500 bg-gray-50 min-h-screen'}>Loading...</div>;
  if (error) return <div className={theme === 'dark' ? 'text-center py-12 text-rose-400 bg-gray-900 min-h-screen' : 'text-center py-12 text-rose-600 bg-gray-50 min-h-screen'}>{error}</div>;
  if (!news) return <div className={theme === 'dark' ? 'text-center py-12 text-slate-400 bg-gray-900 min-h-screen' : 'text-center py-12 text-gray-500 bg-gray-50 min-h-screen'}>News not found.</div>;

  return (
    <div className={theme === 'dark' ? 'min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 text-white' : 'min-h-screen bg-gradient-to-br from-green-50 to-blue-50 text-gray-900'}>
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex justify-between items-center mb-2">
          <Link to="/#news" className={theme === 'dark' ? 'text-indigo-400 hover:underline' : 'text-indigo-700 hover:underline'}>&larr; Back to News</Link>
          <button
            onClick={toggleTheme}
            className={theme === 'dark'
              ? 'rounded-lg px-3 py-1 text-sm font-medium border border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700 transition-colors'
              : 'rounded-lg px-3 py-1 text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition-colors'}
            aria-label="Toggle dark/light mode"
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
        <h1 className={theme === 'dark' ? 'text-3xl font-bold mt-4 mb-2 text-white' : 'text-3xl font-bold mt-4 mb-2 text-gray-900'}>{news.title}</h1>
        <p className={theme === 'dark' ? 'text-slate-400 text-sm mb-4' : 'text-gray-500 text-sm mb-4'}>{news.date}</p>
        {news.image_url && (
          <div className="mb-4 flex justify-center">
            <img src={news.image_url} alt="News" className="max-h-64 rounded shadow" style={{objectFit:'contain'}} />
          </div>
        )}
        <p className={theme === 'dark' ? 'text-lg text-slate-300 mb-3' : 'text-lg text-gray-700 mb-3'}>{news.summary}</p>
        <div className={theme === 'dark' ? 'text-slate-200 whitespace-pre-line' : 'text-gray-800 whitespace-pre-line'}>{news.content}</div>
      </div>
    </div>
  );
}

export default NewsDetail;
