import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getSupabaseClient } from './lib/supabase';

const MEMBERSHIP_LABELS = { full: 'Full', inactive: 'Inactive', none: 'None' };

export default function ReportsManager({ onBack }) {
  const [tab, setTab] = useState('attendance');
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState('');

  // --- Attendance report state ---
  const currentYear = new Date().getFullYear();
  const [attFrom, setAttFrom] = useState(new Date(currentYear, 0, 1));
  const [attTo, setAttTo] = useState(new Date());
  const [attData, setAttData] = useState([]);
  const [attTotalSessions, setAttTotalSessions] = useState(0);
  const [attLoading, setAttLoading] = useState(false);
  const [attSearch, setAttSearch] = useState('');
  const [attCategoryFilter, setAttCategoryFilter] = useState('all');
  const [attSortBy, setAttSortBy] = useState('rate_desc');

  // --- Payment report state ---
  const [payYear, setPayYear] = useState(currentYear);
  const [payData, setPayData] = useState([]);
  const [payLoading, setPayLoading] = useState(false);
  const [paySearch, setPaySearch] = useState('');
  const [payCategoryFilter, setPayCategoryFilter] = useState('all');
  const [payStatusFilter, setPayStatusFilter] = useState('all');
  const [paySortBy, setPaySortBy] = useState('balance_desc');

  useEffect(() => {
    fetchPlayers();
  }, []);

  async function fetchPlayers() {
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from('players')
      .select('id, full_name, main_team, category, email')
      .order('full_name', { ascending: true });
    setPlayers(data || []);
  }

  // ==================== ATTENDANCE REPORT ====================
  async function generateAttendanceReport() {
    setAttLoading(true);
    setError('');
    const supabase = getSupabaseClient();

    const fromStr = attFrom.toLocaleDateString('en-CA');
    const toStr = attTo.toLocaleDateString('en-CA');

    const { data: rangeSessions, error: sessErr } = await supabase
      .from('practice_sessions')
      .select('id, session_date')
      .gte('session_date', fromStr)
      .lte('session_date', toStr)
      .order('session_date', { ascending: true });

    if (sessErr) { setError(sessErr.message); setAttLoading(false); return; }

    const sessionIds = (rangeSessions || []).map((s) => s.id);
    setAttTotalSessions(sessionIds.length);

    if (sessionIds.length === 0) {
      setAttData(players.map((p) => ({
        id: p.id, fullName: p.full_name, team: p.main_team, category: p.category,
        attended: 0, total: 0, rate: 0,
      })));
      setAttLoading(false);
      return;
    }

    const { data: attendanceRows, error: attErr } = await supabase
      .from('practice_attendance')
      .select('player_id, session_id')
      .in('session_id', sessionIds);

    if (attErr) { setError(attErr.message); setAttLoading(false); return; }

    const countMap = new Map();
    for (const row of (attendanceRows || [])) {
      countMap.set(row.player_id, (countMap.get(row.player_id) || 0) + 1);
    }

    setAttData(players.map((p) => {
      const attended = countMap.get(p.id) || 0;
      return {
        id: p.id, fullName: p.full_name, team: p.main_team, category: p.category,
        attended, total: sessionIds.length,
        rate: sessionIds.length > 0 ? Math.round((attended / sessionIds.length) * 100) : 0,
      };
    }));
    setAttLoading(false);
  }

  const filteredAtt = attData
    .filter((r) => {
      if (attCategoryFilter !== 'all' && r.category !== attCategoryFilter) return false;
      const q = attSearch.trim().toLowerCase();
      if (q && !r.fullName.toLowerCase().includes(q)) return false;
      return true;
    })
    .sort((a, b) => {
      switch (attSortBy) {
        case 'rate_asc': return a.rate - b.rate;
        case 'name_asc': return a.fullName.localeCompare(b.fullName);
        case 'name_desc': return b.fullName.localeCompare(a.fullName);
        case 'attended_desc': return b.attended - a.attended;
        default: return b.rate - a.rate;
      }
    });

  function getRateColor(rate) {
    if (rate >= 75) return 'text-emerald-400';
    if (rate >= 40) return 'text-amber-400';
    return 'text-rose-400';
  }

  function getRateBarColor(rate) {
    if (rate >= 75) return 'bg-emerald-500';
    if (rate >= 40) return 'bg-amber-500';
    return 'bg-rose-500';
  }

  // ==================== PAYMENT REPORT ====================
  async function generatePaymentReport() {
    setPayLoading(true);
    setError('');
    const supabase = getSupabaseClient();

    const playerIds = players.map((p) => p.id);
    if (playerIds.length === 0) {
      setPayData([]);
      setPayLoading(false);
      return;
    }

    const { data: statusData, error: statusErr } = await supabase
      .from('player_year_status')
      .select('player_id, membership_type, payment_status, amount_due, amount_paid')
      .eq('year', payYear)
      .in('player_id', playerIds);

    if (statusErr) { setError(statusErr.message); setPayLoading(false); return; }

    const statusMap = new Map((statusData || []).map((s) => [s.player_id, s]));

    setPayData(players.map((p) => {
      const s = statusMap.get(p.id);
      const amountDue = Number(s?.amount_due ?? 0);
      const amountPaid = Number(s?.amount_paid ?? 0);
      const balance = Math.max(0, amountDue - amountPaid);
      return {
        id: p.id,
        fullName: p.full_name,
        team: p.main_team,
        category: p.category,
        email: p.email || '',
        membership: s?.membership_type || 'none',
        amountDue,
        amountPaid,
        balance,
        status: s ? s.payment_status : 'unpaid',
        progress: amountDue > 0 ? Math.round((amountPaid / amountDue) * 100) : (amountDue === 0 ? 100 : 0),
      };
    }));
    setPayLoading(false);
  }

  const filteredPay = payData
    .filter((r) => {
      if (payCategoryFilter !== 'all' && r.category !== payCategoryFilter) return false;
      if (payStatusFilter === 'paid' && r.status !== 'paid') return false;
      if (payStatusFilter === 'unpaid' && r.status !== 'unpaid') return false;
      if (payStatusFilter === 'no_record' && r.membership !== 'none') return false;
      const q = paySearch.trim().toLowerCase();
      if (q && !r.fullName.toLowerCase().includes(q)) return false;
      return true;
    })
    .sort((a, b) => {
      switch (paySortBy) {
        case 'balance_asc': return a.balance - b.balance;
        case 'paid_desc': return b.amountPaid - a.amountPaid;
        case 'due_desc': return b.amountDue - a.amountDue;
        case 'progress_desc': return b.progress - a.progress;
        case 'progress_asc': return a.progress - b.progress;
        case 'name_asc': return a.fullName.localeCompare(b.fullName);
        case 'name_desc': return b.fullName.localeCompare(a.fullName);
        default: return b.balance - a.balance;
      }
    });

  const payTotalDue = payData.reduce((s, r) => s + r.amountDue, 0);
  const payTotalPaid = payData.reduce((s, r) => s + r.amountPaid, 0);
  const payTotalBalance = payData.reduce((s, r) => s + r.balance, 0);
  const payPaidCount = payData.filter((r) => r.status === 'paid').length;

  function getPayBarColor(progress) {
    if (progress >= 100) return 'bg-emerald-500';
    if (progress >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  }

  const yearOptions = [currentYear + 1, currentYear, currentYear - 1, currentYear - 2];

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Reports</h1>
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
      </div>

      {/* Tab switcher */}
      <div className="mb-6 flex gap-1 rounded-lg border border-slate-800 bg-slate-900 p-1 w-fit">
        <button
          type="button"
          onClick={() => setTab('attendance')}
          className={`rounded-md px-4 py-2 text-sm font-medium transition ${
            tab === 'attendance' ? 'bg-indigo-500 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          Attendance
        </button>
        <button
          type="button"
          onClick={() => setTab('payments')}
          className={`rounded-md px-4 py-2 text-sm font-medium transition ${
            tab === 'payments' ? 'bg-indigo-500 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          Payments
        </button>
      </div>

      {error && <div className="mb-4 rounded-md border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</div>}

      {/* ==================== ATTENDANCE TAB ==================== */}
      {tab === 'attendance' && (
        <>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:flex-wrap">
              <div>
                <label className="block text-sm text-slate-300 mb-1">From</label>
                <DatePicker
                  selected={attFrom}
                  onChange={(date) => setAttFrom(date)}
                  dateFormat="yyyy-MM-dd"
                  className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                  calendarClassName="dark-datepicker"
                  selectsStart
                  startDate={attFrom}
                  endDate={attTo}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">To</label>
                <DatePicker
                  selected={attTo}
                  onChange={(date) => setAttTo(date)}
                  dateFormat="yyyy-MM-dd"
                  className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                  calendarClassName="dark-datepicker"
                  selectsEnd
                  startDate={attFrom}
                  endDate={attTo}
                  minDate={attFrom}
                />
              </div>
              <button
                type="button"
                onClick={generateAttendanceReport}
                disabled={attLoading}
                className="rounded-lg bg-indigo-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:opacity-60"
              >
                {attLoading ? 'Loading...' : 'Generate Report'}
              </button>
            </div>
          </div>

          {attData.length > 0 && (
            <>
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Sessions</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{attTotalSessions}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Players</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{attData.length}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Avg Attendance</p>
                  <p className="mt-1 text-2xl font-semibold text-white">
                    {attTotalSessions > 0
                      ? Math.round(attData.reduce((sum, r) => sum + r.rate, 0) / attData.length)
                      : 0}%
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">100% Attendance</p>
                  <p className="mt-1 text-2xl font-semibold text-emerald-400">
                    {attData.filter((r) => r.rate === 100).length}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="text"
                  value={attSearch}
                  onChange={(e) => setAttSearch(e.target.value)}
                  placeholder="Search players..."
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400 sm:w-64"
                />
                <select
                  value={attCategoryFilter}
                  onChange={(e) => setAttCategoryFilter(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
                >
                  <option value="all">All Players</option>
                  <option value="senior">Senior</option>
                  <option value="junior">Junior</option>
                </select>
                <select
                  value={attSortBy}
                  onChange={(e) => setAttSortBy(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
                >
                  <option value="rate_desc">Highest attendance</option>
                  <option value="rate_asc">Lowest attendance</option>
                  <option value="attended_desc">Most sessions</option>
                  <option value="name_asc">Name A-Z</option>
                  <option value="name_desc">Name Z-A</option>
                </select>
              </div>

              <div className="mt-4 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 w-full">
                <table className="min-w-full divide-y divide-slate-800">
                  <thead className="bg-slate-900/80">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">Player</th>
                      <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400 sm:table-cell">Team</th>
                      <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400 sm:table-cell">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">Attended</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">Rate</th>
                      <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400 sm:table-cell" style={{ minWidth: 160 }}>Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredAtt.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-5 text-sm text-slate-400">No players match the filter.</td></tr>
                    ) : (
                      filteredAtt.map((r) => (
                        <tr key={r.id}>
                          <td className="px-4 py-3 text-sm text-slate-100">{r.fullName}</td>
                          <td className="hidden px-4 py-3 sm:table-cell text-sm text-slate-200">{r.team === 'first' ? '1st team' : '2nd team'}</td>
                          <td className="hidden px-4 py-3 sm:table-cell text-sm text-slate-200">{r.category === 'junior' ? 'Junior' : 'Senior'}</td>
                          <td className="px-4 py-3 text-sm text-slate-200">{r.attended} / {r.total}</td>
                          <td className={`px-4 py-3 text-sm font-semibold ${getRateColor(r.rate)}`}>{r.rate}%</td>
                          <td className="hidden px-4 py-3 sm:table-cell">
                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                              <div className={`h-full rounded-full ${getRateBarColor(r.rate)}`} style={{ width: `${r.rate}%` }} />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {/* ==================== PAYMENTS TAB ==================== */}
      {tab === 'payments' && (
        <>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:flex-wrap">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Year</label>
                <select
                  value={payYear}
                  onChange={(e) => setPayYear(Number(e.target.value))}
                  className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                  style={{ minWidth: 100 }}
                >
                  {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <button
                type="button"
                onClick={generatePaymentReport}
                disabled={payLoading}
                className="rounded-lg bg-indigo-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:opacity-60"
              >
                {payLoading ? 'Loading...' : 'Generate Report'}
              </button>
            </div>
          </div>

          {payData.length > 0 && (
            <>
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Total Due</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{payTotalDue.toLocaleString()} kr</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Total Collected</p>
                  <p className="mt-1 text-2xl font-semibold text-emerald-400">{payTotalPaid.toLocaleString()} kr</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Outstanding</p>
                  <p className="mt-1 text-2xl font-semibold text-rose-400">{payTotalBalance.toLocaleString()} kr</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Fully Paid</p>
                  <p className="mt-1 text-2xl font-semibold text-emerald-400">{payPaidCount} / {payData.length}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
                <input
                  type="text"
                  value={paySearch}
                  onChange={(e) => setPaySearch(e.target.value)}
                  placeholder="Search players..."
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400 sm:w-64"
                />
                <select
                  value={payCategoryFilter}
                  onChange={(e) => setPayCategoryFilter(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
                >
                  <option value="all">All Players</option>
                  <option value="senior">Senior</option>
                  <option value="junior">Junior</option>
                </select>
                <select
                  value={payStatusFilter}
                  onChange={(e) => setPayStatusFilter(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
                >
                  <option value="all">All Statuses</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="no_record">No Record</option>
                </select>
                <select
                  value={paySortBy}
                  onChange={(e) => setPaySortBy(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
                >
                  <option value="balance_desc">Highest balance</option>
                  <option value="balance_asc">Lowest balance</option>
                  <option value="due_desc">Highest due</option>
                  <option value="paid_desc">Most paid</option>
                  <option value="progress_desc">Highest progress</option>
                  <option value="progress_asc">Lowest progress</option>
                  <option value="name_asc">Name A-Z</option>
                  <option value="name_desc">Name Z-A</option>
                </select>
              </div>

              <div className="mt-4 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 w-full">
                <table className="min-w-full divide-y divide-slate-800">
                  <thead className="bg-slate-900/80">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">Player</th>
                      <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400 sm:table-cell">Team</th>
                      <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400 sm:table-cell">Membership</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">Due</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">Paid</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">Balance</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">Status</th>
                      <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400 sm:table-cell" style={{ minWidth: 140 }}>Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredPay.length === 0 ? (
                      <tr><td colSpan={8} className="px-4 py-5 text-sm text-slate-400">No players match the filter.</td></tr>
                    ) : (
                      filteredPay.map((r) => (
                        <tr key={r.id}>
                          <td className="px-4 py-3 text-sm text-slate-100">{r.fullName}</td>
                          <td className="hidden px-4 py-3 sm:table-cell text-sm text-slate-200">{r.team === 'first' ? '1st team' : '2nd team'}</td>
                          <td className="hidden px-4 py-3 sm:table-cell text-sm text-slate-200">{MEMBERSHIP_LABELS[r.membership] || r.membership}</td>
                          <td className="px-4 py-3 text-sm text-slate-200">{r.amountDue.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-slate-200">{r.amountPaid.toLocaleString()}</td>
                          <td className={`px-4 py-3 text-sm font-semibold ${r.balance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {r.balance.toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              r.status === 'paid'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}>
                              {r.status === 'paid' ? 'Paid' : 'Unpaid'}
                            </span>
                          </td>
                          <td className="hidden px-4 py-3 sm:table-cell">
                            <div className="space-y-1">
                              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                                <div className={`h-full rounded-full ${getPayBarColor(r.progress)}`} style={{ width: `${Math.min(r.progress, 100)}%` }} />
                              </div>
                              <p className="text-xs text-slate-400">{r.progress}%</p>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
