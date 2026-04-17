import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getSupabaseClient } from './lib/supabase';

export default function AttendanceManager({ onBack }) {
  const [sessions, setSessions] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editSession, setEditSession] = useState(null);
  const [form, setForm] = useState({ session_date: new Date(), notes: '' });
  const [saving, setSaving] = useState(false);

  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [attendanceSet, setAttendanceSet] = useState(new Set());
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceSaving, setAttendanceSaving] = useState(false);
  const [playerSearch, setPlayerSearch] = useState('');

  useEffect(() => {
    fetchSessions();
    fetchPlayers();
  }, []);

  async function fetchSessions() {
    setLoading(true);
    setError('');
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('practice_sessions')
      .select('*')
      .order('session_date', { ascending: false });
    if (error) setError(error.message);
    setSessions(data || []);
    setLoading(false);
  }

  async function fetchPlayers() {
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from('players')
      .select('id, full_name, main_team, category')
      .order('full_name', { ascending: true });
    setPlayers(data || []);
  }

  function openAddModal() {
    setEditSession(null);
    setForm({ session_date: new Date(), notes: '' });
    setModalOpen(true);
  }

  function openEditModal(session) {
    setEditSession(session);
    setForm({ session_date: new Date(session.session_date + 'T00:00:00'), notes: session.notes || '' });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    const supabase = getSupabaseClient();
    const dateStr = form.session_date instanceof Date
      ? form.session_date.toLocaleDateString('en-CA')
      : form.session_date;
    const payload = {
      session_date: dateStr,
      notes: form.notes || null,
    };
    let result;
    if (editSession) {
      result = await supabase.from('practice_sessions').update(payload).eq('id', editSession.id);
    } else {
      result = await supabase.from('practice_sessions').insert(payload);
    }
    setSaving(false);
    if (result.error) setError(result.error.message);
    else {
      setModalOpen(false);
      setEditSession(null);
      fetchSessions();
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this practice session and all its attendance records?')) return;
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('practice_sessions').delete().eq('id', id);
    if (error) setError(error.message);
    else fetchSessions();
  }

  async function openAttendanceModal(session) {
    setActiveSession(session);
    setAttendanceSet(new Set());
    setPlayerSearch('');
    setAttendanceLoading(true);
    setAttendanceModalOpen(true);

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('practice_attendance')
      .select('player_id')
      .eq('session_id', session.id);

    if (error) {
      setError(error.message);
    } else {
      setAttendanceSet(new Set((data || []).map((r) => r.player_id)));
    }
    setAttendanceLoading(false);
  }

  async function saveAttendance() {
    if (!activeSession) return;
    setAttendanceSaving(true);
    setError('');
    const supabase = getSupabaseClient();

    const { error: deleteError } = await supabase
      .from('practice_attendance')
      .delete()
      .eq('session_id', activeSession.id);

    if (deleteError) {
      setError(deleteError.message);
      setAttendanceSaving(false);
      return;
    }

    if (attendanceSet.size > 0) {
      const rows = [...attendanceSet].map((playerId) => ({
        session_id: activeSession.id,
        player_id: playerId,
      }));
      const { error: insertError } = await supabase
        .from('practice_attendance')
        .insert(rows);

      if (insertError) {
        setError(insertError.message);
        setAttendanceSaving(false);
        return;
      }
    }

    setAttendanceSaving(false);
    setAttendanceModalOpen(false);
    setActiveSession(null);
  }

  function togglePlayer(playerId) {
    setAttendanceSet((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) next.delete(playerId);
      else next.add(playerId);
      return next;
    });
  }

  const filteredPlayers = players.filter((p) => {
    const q = playerSearch.trim().toLowerCase();
    if (!q) return true;
    return p.full_name.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Practice Attendance</h1>
        <div className="flex items-center gap-2">
          {onBack && (
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
          )}
          <button onClick={openAddModal} className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400">
            Add Session
          </button>
        </div>
      </div>

      {error && <div className="mb-4 rounded-md border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</div>}

      {loading ? (
        <div className="text-slate-300">Loading sessions...</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 w-full">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-900/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">Date</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400 sm:table-cell">Notes</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-5 text-sm text-slate-400">No practice sessions found.</td>
                </tr>
              ) : (
                sessions.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-3 text-sm text-slate-100 whitespace-nowrap">{s.session_date}</td>
                    <td className="hidden px-4 py-3 sm:table-cell text-sm text-slate-200">{s.notes || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openAttendanceModal(s)}
                          title="Manage attendance"
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-emerald-600/60 px-3 text-sm text-emerald-200 transition hover:border-emerald-500 hover:text-emerald-100"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="h-4 w-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                          </svg>
                          Attendance
                        </button>
                        <button
                          onClick={() => openEditModal(s)}
                          aria-label="Edit session"
                          title="Edit"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 text-slate-200 transition hover:border-slate-500 hover:text-white"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.5 3.5 4 4L8 20H4v-4L16.5 3.5Z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          aria-label="Delete session"
                          title="Delete"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-600/60 text-rose-200 transition hover:border-rose-500 hover:text-rose-100"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
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

      {/* Add/Edit Session Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-xl bg-slate-900 p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">{editSession ? 'Edit Session' : 'Add Session'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Date</label>
                <DatePicker
                  selected={form.session_date}
                  onChange={(date) => setForm((f) => ({ ...f, session_date: date }))}
                  dateFormat="yyyy-MM-dd"
                  className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                  calendarClassName="dark-datepicker"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1" htmlFor="session_notes">Notes</label>
                <textarea
                  id="session_notes"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                  rows={3}
                  placeholder="Optional notes about this session"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setModalOpen(false); setEditSession(null); }}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-slate-500 hover:text-white"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : editSession ? 'Update' : 'Add'} Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {attendanceModalOpen && activeSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-xl bg-slate-900 p-6 border border-slate-700 shadow-2xl">
            <h2 className="text-xl font-semibold text-white">
              Attendance &mdash; {activeSession.session_date}
            </h2>
            <p className="mt-1 text-sm text-slate-400">Check the players who attended this session.</p>

            <div className="mt-4">
              <input
                type="text"
                value={playerSearch}
                onChange={(e) => setPlayerSearch(e.target.value)}
                placeholder="Search players..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
              />
            </div>

            <div className="mt-3 flex items-center gap-3 text-sm text-slate-400">
              <span>{attendanceSet.size} / {players.length} present</span>
              <button
                type="button"
                onClick={() => setAttendanceSet(new Set(players.map((p) => p.id)))}
                className="text-indigo-300 hover:text-indigo-200"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={() => setAttendanceSet(new Set())}
                className="text-indigo-300 hover:text-indigo-200"
              >
                Clear all
              </button>
            </div>

            {attendanceLoading ? (
              <div className="py-6 text-center text-sm text-slate-400">Loading attendance...</div>
            ) : (
              <div className="mt-3 max-h-72 overflow-y-auto rounded border border-slate-700 bg-slate-950 p-2 space-y-0.5">
                {filteredPlayers.length === 0 ? (
                  <p className="py-2 text-sm text-slate-400 text-center">No players found.</p>
                ) : (
                  filteredPlayers.map((player) => (
                    <label
                      key={player.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                        attendanceSet.has(player.id)
                          ? 'bg-emerald-500/10 text-emerald-100'
                          : 'text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={attendanceSet.has(player.id)}
                        onChange={() => togglePlayer(player.id)}
                        className="accent-emerald-500"
                      />
                      <span className="flex-1">{player.full_name}</span>
                      <span className="text-xs text-slate-500">
                        {player.category === 'junior' ? 'Junior' : 'Senior'} &middot; {player.main_team === 'first' ? '1st' : '2nd'}
                      </span>
                    </label>
                  ))
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => { setAttendanceModalOpen(false); setActiveSession(null); }}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-slate-500 hover:text-white"
                disabled={attendanceSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveAttendance}
                disabled={attendanceSaving}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
              >
                {attendanceSaving ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
