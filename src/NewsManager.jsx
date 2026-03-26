import { useEffect, useState } from 'react';
import { getSupabaseClient } from './lib/supabase';

function NewsManager({ onBack }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingNews, setEditingNews] = useState(null);
  const [form, setForm] = useState({
    title: '',
    summary: '',
    content: '',
    image_url: '',
    date: '',
    is_active: true,
  });

  const supabase = getSupabaseClient();

  const fetchNews = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      setNews(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    // eslint-disable-next-line
  }, []);

  const openAddModal = () => {
    setModalMode('add');
    setForm({ title: '', summary: '', content: '', image_url: '', date: '', is_active: true });
    setIsModalOpen(true);
    setEditingNews(null);
  };

  const openEditModal = (item) => {
    setModalMode('edit');
    setForm({
      title: item.title || '',
      summary: item.summary || '',
      content: item.content || '',
      image_url: item.image_url || '',
      date: item.date || '',
      is_active: item.is_active,
    });
    setEditingNews(item);
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async () => {
    try {
      const now = new Date().toISOString();
      if (modalMode === 'add') {
        // Get current user id for created_by
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        const userId = userData?.user?.id || null;
        const insertData = {
          ...form,
          created_by: userId,
          created_at: now,
          updated_at: now,
        };
        const { error } = await supabase.from('news').insert([insertData]);
        if (error) throw error;
      } else if (modalMode === 'edit' && editingNews) {
        const updateData = {
          ...form,
          updated_at: now,
        };
        const { error } = await supabase
          .from('news')
          .update(updateData)
          .eq('id', editingNews.id);
        if (error) throw error;
      }
      setIsModalOpen(false);
      fetchNews();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this news item?')) return;
    try {
      const { error } = await supabase.from('news').delete().eq('id', id);
      if (error) throw error;
      fetchNews();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">Manage News</h1>
        <div className="flex items-center gap-2">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-200 transition hover:border-slate-500 hover:bg-slate-700 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Back to Admin
            </button>
          ) : null}
          <button onClick={openAddModal} className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400">Add News</button>
        </div>
      </div>
      {error && <div className="mb-4 text-red-400">{error}</div>}
      {loading ? (
        <div className="text-slate-300">Loading news...</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 w-full mx-auto">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-900/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">Active</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {news.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 text-white">{item.title}</td>
                  <td className="px-4 py-3 text-slate-300">{item.date}</td>
                  <td className="px-4 py-3 text-slate-300">{item.is_active ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      aria-label="Edit news"
                      title="Edit"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 text-indigo-400 transition hover:border-slate-500 hover:text-white"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.5 3.5 4 4L8 20H4v-4L16.5 3.5Z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      aria-label="Delete news"
                      title="Delete"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-600/60 text-rose-400 transition hover:border-rose-500 hover:text-rose-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 6V4h8v2" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 6l-1 14H6L5 6" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 10v7M14 10v7" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-white mb-4">{modalMode === 'add' ? 'Add News' : 'Edit News'}</h2>
            {/* Show image preview if present */}
            {form.image_url && (
              <div className="mb-3 flex justify-center">
                <img src={form.image_url} alt="News" className="max-h-48 rounded shadow" style={{objectFit:'contain'}} />
              </div>
            )}
            <div className="space-y-3">
              <input name="title" value={form.title} onChange={handleFormChange} placeholder="Title" className="w-full px-3 py-2 rounded bg-slate-800 text-white" />
              <input name="summary" value={form.summary} onChange={handleFormChange} placeholder="Summary" className="w-full px-3 py-2 rounded bg-slate-800 text-white" />
              <textarea name="content" value={form.content} onChange={handleFormChange} placeholder="Content" className="w-full px-3 py-2 rounded bg-slate-800 text-white" rows={4} />
              <input name="image_url" value={form.image_url} onChange={handleFormChange} placeholder="Image URL (optional)" className="w-full px-3 py-2 rounded bg-slate-800 text-white" />
              <input name="date" type="date" value={form.date} onChange={handleFormChange} className="w-full px-3 py-2 rounded bg-slate-800 text-white" />
              <label className="flex items-center gap-2 text-white">
                <input name="is_active" type="checkbox" checked={form.is_active} onChange={handleFormChange} /> Active
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded bg-slate-700 text-white">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 rounded bg-indigo-500 text-white">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NewsManager;
