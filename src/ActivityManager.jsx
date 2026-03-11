import { useEffect, useState } from 'react';
import { getSupabaseClient } from './lib/supabase';

export default function ActivityManager({ onBack }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, []);

  async function fetchActivities() {
    setLoading(true);
    setError('');
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setActivities(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load activities.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddActivity(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      let imageUrl = '';
      if (imageFile) {
        const supabase = getSupabaseClient();
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 8)}.${fileExt}`;
        const { data, error: uploadError } = await supabase.storage
          .from('activities')
          .upload(fileName, imageFile);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from('activities').getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }
      const supabase = getSupabaseClient();
      const { error: insertError } = await supabase
        .from('activities')
        .insert({ name, description, image_url: imageUrl });
      if (insertError) throw insertError;
      setName('');
      setDescription('');
      setImageFile(null);
      await fetchActivities();
    } catch (err) {
      setError(err.message || 'Failed to add activity.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Manage Activities</h2>
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white"
        >
          Back to Admin
        </button>
      </div>
      <form onSubmit={handleAddActivity} className="mb-6 space-y-3">
        <div>
          <label className="block text-sm text-slate-200 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-200 mb-1">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-200 mb-1">Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setImageFile(e.target.files[0])}
            className="block w-full text-sm text-slate-100"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Add Activity'}
        </button>
        {error && <p className="text-sm text-rose-400 mt-2">{error}</p>}
      </form>
      <div>
        {loading ? (
          <p className="text-slate-300">Loading activities...</p>
        ) : activities.length === 0 ? (
          <p className="text-slate-400">No activities found.</p>
        ) : (
          <ul className="space-y-4">
            {activities.map(activity => (
              <li key={activity.id} className="flex items-center gap-4 border-b border-slate-800 pb-4">
                {activity.image_url && (
                  <img src={activity.image_url} alt={activity.name} className="h-16 w-16 object-cover rounded" />
                )}
                <div>
                  <h3 className="text-base font-semibold text-white">{activity.name}</h3>
                  <p className="text-sm text-slate-300">{activity.description}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
