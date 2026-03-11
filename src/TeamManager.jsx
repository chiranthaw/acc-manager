import { useEffect, useState } from 'react';
import { getSupabaseClient } from './lib/supabase';

export default function TeamManager({ onBack }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [teamForm, setTeamForm] = useState({
    name: '',
    address: '',
    logo_url: '',
    is_active: true,
  });
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [savingTeam, setSavingTeam] = useState(false);
  const [deletingTeamId, setDeletingTeamId] = useState('');

  useEffect(() => {
    fetchTeams();
  }, []);

  async function fetchTeams() {
    setLoading(true);
    setError('');
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('teams').select('*').order('name', { ascending: true });
    if (error) setError(error.message);
    setTeams(data || []);
    setLoading(false);
  }

  function resetTeamForm() {
    setTeamForm({ name: '', address: '', logo_url: '', is_active: true });
    setEditingTeamId(null);
  }

  function handleEditTeam(team) {
    setEditingTeamId(team.id);
    setTeamForm({
      name: team.name || '',
      address: team.address || '',
      logo_url: team.logo_url || '',
      is_active: Boolean(team.is_active),
    });
  }

  async function handleTeamSubmit(e) {
    e.preventDefault();
    setError('');
    setSavingTeam(true);
    const supabase = getSupabaseClient();
    const payload = {
      name: teamForm.name.trim(),
      address: teamForm.address.trim() || null,
      logo_url: teamForm.logo_url.trim() || null,
      is_active: teamForm.is_active,
    };
    let result;
    if (editingTeamId) {
      result = await supabase.from('teams').update(payload).eq('id', editingTeamId);
    } else {
      result = await supabase.from('teams').insert(payload);
    }

    if (result.error) {
      setError(result.error.message);
    } else {
      resetTeamForm();
      fetchTeams();
    }
    setSavingTeam(false);
  }

  async function handleDeleteTeam(id) {
    if (!window.confirm('Delete this team? Events will keep team_id as null.')) return;
    setDeletingTeamId(id);
    setError('');
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('teams').delete().eq('id', id);
    if (error) setError(error.message);
    else fetchTeams();
    setDeletingTeamId('');
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-white">Manage Teams</h1>
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:border-slate-500 hover:text-white"
            >
              Back to Admin
            </button>
          ) : null}
        </div>
        <p className="mt-1 text-sm text-slate-400">Create team profiles once, then select them while creating match events.</p>

        <form onSubmit={handleTeamSubmit} className="mt-4 grid gap-3 md:grid-cols-4">
          <input
            required
            value={teamForm.name}
            onChange={(e) => setTeamForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Team name"
            className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          />
          <input
            value={teamForm.address}
            onChange={(e) => setTeamForm((prev) => ({ ...prev, address: e.target.value }))}
            placeholder="Address"
            className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          />
          <input
            value={teamForm.logo_url}
            onChange={(e) => setTeamForm((prev) => ({ ...prev, logo_url: e.target.value }))}
            placeholder="Logo URL"
            className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          />
          <div className="flex items-center gap-2">
            <select
              value={teamForm.is_active ? 'true' : 'false'}
              onChange={(e) => setTeamForm((prev) => ({ ...prev, is_active: e.target.value === 'true' }))}
              className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <button
              type="submit"
              disabled={savingTeam}
              className="rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-60"
            >
              {savingTeam ? 'Saving...' : editingTeamId ? 'Update' : 'Add'}
            </button>
            {editingTeamId ? (
              <button
                type="button"
                onClick={resetTeamForm}
                className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:border-slate-500 hover:text-white"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        {error ? <div className="mt-3 text-sm text-rose-300">{error}</div> : null}

        <div className="mt-4 overflow-x-auto rounded-lg border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-900/80">
              <tr>
                <th className="px-4 py-2 text-left text-xs uppercase tracking-wide text-slate-400">Name</th>
                <th className="px-4 py-2 text-left text-xs uppercase tracking-wide text-slate-400">Address</th>
                <th className="px-4 py-2 text-left text-xs uppercase tracking-wide text-slate-400">Logo</th>
                <th className="px-4 py-2 text-left text-xs uppercase tracking-wide text-slate-400">Status</th>
                <th className="px-4 py-2 text-right text-xs uppercase tracking-wide text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-sm text-slate-400">Loading teams...</td>
                </tr>
              ) : teams.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-sm text-slate-400">No teams yet.</td>
                </tr>
              ) : teams.map((team) => (
                <tr key={team.id}>
                  <td className="px-4 py-2 text-sm text-slate-100">{team.name}</td>
                  <td className="px-4 py-2 text-sm text-slate-300">{team.address || '—'}</td>
                  <td className="px-4 py-2 text-sm text-slate-300">{team.logo_url || '—'}</td>
                  <td className="px-4 py-2 text-sm text-slate-300">{team.is_active ? 'Active' : 'Inactive'}</td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditTeam(team)}
                        className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-200 transition hover:border-slate-500 hover:text-white"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTeam(team.id)}
                        disabled={deletingTeamId === team.id}
                        className="rounded-lg border border-rose-600/60 px-3 py-1.5 text-xs text-rose-200 transition hover:border-rose-500 hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingTeamId === team.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
