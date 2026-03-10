import { useEffect, useState } from 'react';
import { getSupabaseClient } from './lib/supabase';

// Event schema reference:
// id, title, description, event_type, date, time, location, image_url, is_active, extra, created_by, created_at, updated_at

const EVENT_TYPES = [
  { value: 'match', label: 'Match' },
  { value: 'training', label: 'Training' },
  { value: 'school', label: 'School' },
  { value: 'social', label: 'Social' },
  { value: 'other', label: 'Other' },
];

export default function EventManager() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState(null);

  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    event_type: 'match',
    date: '',
    time: '',
    location: '',
    image_url: '',
    is_active: true,
    extra: '',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    console.log('Fetching events...');
    setLoading(true);
    setError('');
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('events').select('*').order('date', { ascending: false });
    if (error) setError(error.message);
    setEvents(data || []);
    setLoading(false);
  }

  function openAddModal() {
    setEditEvent(null);
    setForm({
      title: '', description: '', event_type: 'match', date: '', time: '', location: '', image_url: '', is_active: true, extra: '',
    });
    setModalOpen(true);
  }

  function openEditModal(event) {
    setEditEvent(event);
    setForm({ ...event, extra: event.extra ? JSON.stringify(event.extra, null, 2) : '' });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditEvent(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const supabase = getSupabaseClient();
    const payload = { ...form, extra: form.extra ? JSON.parse(form.extra) : null };
    let result;
    if (editEvent) {
      result = await supabase.from('events').update(payload).eq('id', editEvent.id);
    } else {
      result = await supabase.from('events').insert(payload);
    }
    if (result.error) setError(result.error.message);
    else {
      closeModal();
      fetchEvents();
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this event?')) return;
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) setError(error.message);
    else fetchEvents();
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Manage Events</h1>
        <button onClick={openAddModal} className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400">Add Event</button>
      </div>
      {error && <div className="mb-4 text-red-400">{error}</div>}
      {loading ? (
        <div className="text-slate-300">Loading events...</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 w-full mx-auto">
          <table className="min-w-[980px] divide-y divide-slate-800">
            <thead className="bg-slate-900/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400 whitespace-nowrap">Title</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400 sm:table-cell whitespace-nowrap">Type</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400 sm:table-cell whitespace-nowrap">Date</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400 sm:table-cell whitespace-nowrap">Location</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400 sm:table-cell whitespace-nowrap">Active</th>
                <th className="w-36 px-4 py-4 text-right text-xs font-medium uppercase tracking-wide text-slate-400 whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-5 text-sm text-slate-400">No events found.</td>
                </tr>
              ) : (
                events.map(ev => (
                  <tr key={ev.id}>
                    <td className="px-4 py-3 text-sm text-slate-100 whitespace-nowrap">{ev.title}</td>
                    <td className="hidden px-4 py-3 sm:table-cell text-sm text-slate-200 whitespace-nowrap">{ev.event_type}</td>
                    <td className="hidden px-4 py-3 sm:table-cell text-sm text-slate-200 whitespace-nowrap">{ev.date}</td>
                    <td className="hidden px-4 py-3 sm:table-cell text-sm text-slate-200 whitespace-nowrap">{ev.location || '—'}</td>
                    <td className="hidden px-4 py-3 sm:table-cell text-sm text-slate-200 whitespace-nowrap">{ev.is_active ? 'Yes' : 'No'}</td>
                    <td className="w-36 px-2 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(ev)}
                          className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-200 transition hover:border-slate-500 hover:text-white"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(ev.id)}
                          className="rounded-lg border border-rose-600/60 px-3 py-1.5 text-xs text-rose-200 transition hover:border-rose-500 hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-lg rounded-xl bg-slate-900 p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">{editEvent ? 'Edit Event' : 'Add Event'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1" htmlFor="title">Title</label>
                <input id="title" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100" />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1" htmlFor="description">Description</label>
                <textarea id="description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-slate-300 mb-1" htmlFor="event_type">Type</label>
                  <select id="event_type" value={form.event_type} onChange={e => setForm(f => ({ ...f, event_type: e.target.value }))} className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100">
                    {EVENT_TYPES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-slate-300 mb-1" htmlFor="date">Date</label>
                  <input id="date" type="date" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-slate-300 mb-1" htmlFor="time">Time</label>
                  <input id="time" type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1" htmlFor="location">Location</label>
                <input id="location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100" />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1" htmlFor="image_url">Image URL</label>
                <input id="image_url" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100" />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1" htmlFor="is_active">Active</label>
                <select id="is_active" value={form.is_active ? 'true' : 'false'} onChange={e => setForm(f => ({ ...f, is_active: e.target.value === 'true' }))} className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100">
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1" htmlFor="extra">Extra (JSON)</label>
                <textarea id="extra" value={form.extra} onChange={e => setForm(f => ({ ...f, extra: e.target.value }))} className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100" placeholder="{ &quot;key&quot;: &quot;value&quot; }" />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={closeModal} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-slate-500 hover:text-white">Cancel</button>
                <button type="submit" className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400">{editEvent ? 'Update' : 'Add'} Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
