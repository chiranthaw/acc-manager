import { useEffect, useState } from 'react';
import { getSupabaseClient } from './lib/supabase';

const EVENT_TYPES = [
  { value: 'match', label: 'Match' },
  { value: 'training', label: 'Training' },
  { value: 'school', label: 'School' },
  { value: 'social', label: 'Social' },
  { value: 'other', label: 'Other' },
];

const MATCH_COMPETITION_OPTIONS = [
  { value: '1st_division', label: '1st Division' },
  { value: '3rd_division', label: '3rd Division' },
  { value: 't20', label: 'T20' },
];

export default function EventManager({ onBack }) {
  const [events, setEvents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState(null);

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
    home_team_id: '',
    away_team_id: '',
    match_competition: '',
  });

  useEffect(() => {
    fetchEvents();
    fetchTeams();
  }, []);

  const getTeamNameById = (teamId) => teams.find((team) => team.id === teamId)?.name || '';

  const buildMatchTitle = (homeTeamId, awayTeamId) => {
    const homeName = getTeamNameById(homeTeamId);
    const awayName = getTeamNameById(awayTeamId);
    if (!homeName && !awayName) return '';
    if (!homeName) return `vs. ${awayName}`;
    if (!awayName) return `${homeName} vs.`;
    return `${homeName} vs. ${awayName}`;
  };

  const getTeamAddressById = (teamId) => teams.find((team) => team.id === teamId)?.address || '';

  async function fetchEvents() {
    setLoading(true);
    setError('');
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('events').select('*').order('date', { ascending: false });
    if (error) setError(error.message);
    setEvents(data || []);
    setLoading(false);
  }

  async function fetchTeams() {
    const supabase = getSupabaseClient();
    const { data } = await supabase.from('teams').select('*').order('name', { ascending: true });
    setTeams(data || []);
  }

  function openAddModal() {
    setEditEvent(null);
    setForm({
      title: '', description: '', event_type: 'match', date: '', time: '', location: '', image_url: '', is_active: true, extra: '', home_team_id: '', away_team_id: '', match_competition: '',
    });
    setModalOpen(true);
  }

  function openEditModal(event) {
    setEditEvent(event);
    setForm({
      ...event,
      extra: event.extra ? JSON.stringify(event.extra, null, 2) : '',
      home_team_id: event.home_team_id || '',
      away_team_id: event.away_team_id || '',
      match_competition: event.extra?.match_competition || '',
    });
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
    let parsedExtra = null;
    if (form.extra) {
      try {
        parsedExtra = JSON.parse(form.extra);
      } catch {
        setError('Extra must be valid JSON.');
        return;
      }
    }
    if (form.home_team_id && form.away_team_id && form.home_team_id === form.away_team_id) {
      setError('Home and away teams must be different.');
      return;
    }
    const isMatchEvent = form.event_type === 'match';
    const normalizedExtra = parsedExtra && typeof parsedExtra === 'object' && !Array.isArray(parsedExtra)
      ? { ...parsedExtra }
      : {};

    if (isMatchEvent && form.match_competition) {
      normalizedExtra.match_competition = form.match_competition;
    } else {
      delete normalizedExtra.match_competition;
    }

    const homeTeamAddress = isMatchEvent ? getTeamAddressById(form.home_team_id) : '';
    const { match_competition, ...formWithoutMatchCompetition } = form;
    const payload = {
      ...formWithoutMatchCompetition,
      extra: Object.keys(normalizedExtra).length > 0 ? normalizedExtra : null,
      home_team_id: isMatchEvent ? (form.home_team_id || null) : null,
      away_team_id: isMatchEvent ? (form.away_team_id || null) : null,
      location: isMatchEvent ? (homeTeamAddress || null) : (form.location || null),
    };
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
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Manage Events</h1>
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
          <button onClick={openAddModal} className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400">Add Event</button>
        </div>
      </div>
      {error && <div className="mb-4 text-red-400">{error}</div>}
      {loading ? (
        <div className="text-slate-300">Loading events...</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 w-full mx-auto">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-900/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400 whitespace-nowrap">Title</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400 sm:table-cell whitespace-nowrap">Type</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400 md:table-cell whitespace-nowrap">Teams</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400 sm:table-cell whitespace-nowrap">Date</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400 sm:table-cell whitespace-nowrap">Location</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400 sm:table-cell whitespace-nowrap">Active</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-5 text-sm text-slate-400">No events found.</td>
                </tr>
              ) : (
                events.map(ev => (
                  <tr key={ev.id}>
                    <td className="px-4 py-3 text-sm text-slate-100 whitespace-nowrap">{ev.title}</td>
                    <td className="hidden px-4 py-3 sm:table-cell text-sm text-slate-200 whitespace-nowrap">{ev.event_type}</td>
                    <td className="hidden px-4 py-3 md:table-cell text-sm text-slate-200 whitespace-nowrap">
                      {(teams.find((team) => team.id === ev.home_team_id)?.name || '—')} vs {(teams.find((team) => team.id === ev.away_team_id)?.name || '—')}
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell text-sm text-slate-200 whitespace-nowrap">{ev.date}</td>
                    <td className="hidden px-4 py-3 sm:table-cell text-sm text-slate-200 whitespace-nowrap">
                      {ev.event_type === 'match'
                        ? (teams.find((team) => team.id === ev.home_team_id)?.address || ev.location || '—')
                        : (ev.location || '—')}
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell text-sm text-slate-200 whitespace-nowrap">{ev.is_active ? 'Yes' : 'No'}</td>
                    <td className="w-40 pr-4 pl-2 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(ev)}
                          aria-label="Edit event"
                          title="Edit"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 text-slate-200 transition hover:border-slate-500 hover:text-white"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.5 3.5 4 4L8 20H4v-4L16.5 3.5Z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(ev.id)}
                          aria-label="Delete event"
                          title="Delete"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-600/60 text-rose-200 transition hover:border-rose-500 hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 6V4h8v2" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 6l-1 14H6L5 6" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 10v7M14 10v7" />
                          </svg>
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
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-slate-300 mb-1" htmlFor="event_type">Type</label>
                  <select
                    id="event_type"
                    value={form.event_type}
                    onChange={e => {
                      const nextType = e.target.value;
                      setForm((f) => ({
                        ...f,
                        event_type: nextType,
                        home_team_id: nextType === 'match' ? f.home_team_id : '',
                        away_team_id: nextType === 'match' ? f.away_team_id : '',
                        match_competition: nextType === 'match' ? f.match_competition : '',
                      }));
                    }}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                  >
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
              {form.event_type === 'match' ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm text-slate-300 mb-1" htmlFor="home_team_id">Home team</label>
                    <select
                      id="home_team_id"
                      value={form.home_team_id || ''}
                      onChange={e => {
                        const nextHomeTeamId = e.target.value;
                        setForm((f) => ({
                          ...f,
                          home_team_id: nextHomeTeamId,
                          title: buildMatchTitle(nextHomeTeamId, f.away_team_id),
                        }));
                      }}
                      className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                    >
                      <option value="">Select home team</option>
                      {teams.filter((team) => team.is_active).map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1" htmlFor="away_team_id">Away team</label>
                    <select
                      id="away_team_id"
                      value={form.away_team_id || ''}
                      onChange={e => {
                        const nextAwayTeamId = e.target.value;
                        setForm((f) => ({
                          ...f,
                          away_team_id: nextAwayTeamId,
                          title: buildMatchTitle(f.home_team_id, nextAwayTeamId),
                        }));
                      }}
                      className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                    >
                      <option value="">Select away team</option>
                      {teams.filter((team) => team.is_active).map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                    </select>
                  </div>
                </div>
              ) : null}
              {form.event_type === 'match' ? (
                <div>
                  <label className="block text-sm text-slate-300 mb-1" htmlFor="match_competition">Match type</label>
                  <select
                    id="match_competition"
                    value={form.match_competition || ''}
                    onChange={e => setForm((f) => ({ ...f, match_competition: e.target.value }))}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                  >
                    <option value="">Select match type</option>
                    {MATCH_COMPETITION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              ) : null}
              <div>
                <label className="block text-sm text-slate-300 mb-1" htmlFor="title">Title</label>
                <input id="title" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100" />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1" htmlFor="description">Description</label>
                <textarea id="description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100" />
              </div>
              {form.event_type === 'match' ? (
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Location</label>
                  <div className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-300">
                    {getTeamAddressById(form.home_team_id) || 'Home team location will be used automatically'}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm text-slate-300 mb-1" htmlFor="location">Location</label>
                  <input id="location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100" />
                </div>
              )}
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
