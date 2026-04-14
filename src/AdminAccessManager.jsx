import { useEffect, useState } from 'react';
import { getSupabaseClient } from './lib/supabase';

const AdminAccessManager = ({ session, hasAdminAccess, onBack }) => {
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminUsersLoading, setAdminUsersLoading] = useState(false);
  const [adminUsersError, setAdminUsersError] = useState('');
  const [adminActionMessage, setAdminActionMessage] = useState('');
  const [approvalEmail, setApprovalEmail] = useState('');
  const [adminActionLoadingEmail, setAdminActionLoadingEmail] = useState('');
  const [roleLoadingEmail, setRoleLoadingEmail] = useState('');

  const loadAdminUsers = async () => {
    const supabase = getSupabaseClient();
    if (!supabase || !session || !hasAdminAccess) return;

    setAdminUsersLoading(true);
    setAdminUsersError('');
    try {
      const { data, error } = await supabase.rpc('get_admin_users');
      if (error) throw error;
      setAdminUsers(data || []);
    } catch (err) {
      setAdminUsersError(err.message || 'Failed to load admin users.');
    } finally {
      setAdminUsersLoading(false);
    }
  };

  const handleSetAdminApproval = async (targetEmail, approve) => {
    const normalizedEmail = (targetEmail || '').trim().toLowerCase();
    if (!normalizedEmail) {
      setAdminUsersError('Please enter an email address.');
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase || !session || !hasAdminAccess) return;

    setAdminUsersError('');
    setAdminActionMessage('');
    setAdminActionLoadingEmail(normalizedEmail);

    try {
      const { error } = await supabase.rpc('set_admin_approval', {
        target_email: normalizedEmail,
        approve,
      });

      if (error) throw error;

      setAdminActionMessage(
        `${normalizedEmail} ${approve ? 'approved' : 'set as pending'}.`,
      );

      if (approvalEmail.trim().toLowerCase() === normalizedEmail) {
        setApprovalEmail('');
      }

      await loadAdminUsers();
    } catch (err) {
      setAdminUsersError(err.message || 'Failed to update admin approval.');
    } finally {
      setAdminActionLoadingEmail('');
    }
  };

  const handleSetRole = async (targetEmail, newRole) => {
    const normalizedEmail = (targetEmail || '').trim().toLowerCase();
    if (!normalizedEmail) return;

    const supabase = getSupabaseClient();
    if (!supabase || !session || !hasAdminAccess) return;

    setAdminUsersError('');
    setAdminActionMessage('');
    setRoleLoadingEmail(normalizedEmail);

    try {
      const { error } = await supabase.rpc('set_user_role', {
        target_email: normalizedEmail,
        new_role: newRole,
      });

      if (error) throw error;

      setAdminActionMessage(
        `${normalizedEmail} role set to ${newRole}.`,
      );

      await loadAdminUsers();
    } catch (err) {
      setAdminUsersError(err.message || 'Failed to update user role.');
    } finally {
      setRoleLoadingEmail('');
    }
  };

  useEffect(() => {
    loadAdminUsers();
  }, []);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Admin Access</h2>
          <p className="mt-1 text-sm text-slate-400">
            Approve or revoke portal access and manage user roles.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-200 transition hover:border-slate-500 hover:bg-slate-700 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Dashboard
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          value={approvalEmail}
          onChange={(event) => setApprovalEmail(event.target.value)}
          placeholder="user@email.com"
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
        />
        <button
          type="button"
          onClick={() => handleSetAdminApproval(approvalEmail, true)}
          disabled={adminActionLoadingEmail === approvalEmail.trim().toLowerCase()}
          className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:opacity-60"
        >
          {adminActionLoadingEmail === approvalEmail.trim().toLowerCase()
            ? 'Saving...'
            : 'Approve'}
        </button>
      </div>

      {adminUsersError && (
        <p className="mt-3 rounded-md border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {adminUsersError}
        </p>
      )}
      {adminActionMessage && (
        <p className="mt-3 rounded-md border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          {adminActionMessage}
        </p>
      )}

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-800">
        <table className="min-w-full divide-y divide-slate-800">
          <thead className="bg-slate-900/80">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                Role
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-400">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-900">
            {adminUsersLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-sm text-slate-400">
                  Loading users...
                </td>
              </tr>
            ) : adminUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-sm text-slate-400">
                  No accounts found.
                </td>
              </tr>
            ) : (
              adminUsers.map((adminUser) => {
                const rowEmail = (adminUser.email || '').toLowerCase();
                const rowLoading = adminActionLoadingEmail === rowEmail;
                const rowRoleLoading = roleLoadingEmail === rowEmail;
                const isSelf = rowEmail === (session.user.email || '').toLowerCase();
                return (
                  <tr key={adminUser.user_id}>
                    <td className="px-4 py-3 text-sm text-slate-100">{adminUser.email}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">
                      {adminUser.is_approved ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-300">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {adminUser.is_approved ? (
                        <select
                          value={adminUser.role || 'player'}
                          onChange={(e) => handleSetRole(adminUser.email, e.target.value)}
                          disabled={rowRoleLoading || isSelf}
                          className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100 outline-none focus:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <option value="player">Player</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {adminUser.is_approved ? (
                        <button
                          type="button"
                          onClick={() => handleSetAdminApproval(adminUser.email, false)}
                          disabled={rowLoading || isSelf}
                          className="rounded-lg border border-rose-600/60 px-3 py-1.5 text-xs text-rose-200 transition hover:border-rose-500 hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {rowLoading ? 'Saving...' : 'Revoke'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetAdminApproval(adminUser.email, true)}
                          disabled={rowLoading}
                          className="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-400 disabled:opacity-60"
                        >
                          {rowLoading ? 'Saving...' : 'Approve'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAccessManager;
