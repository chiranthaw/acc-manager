import { useEffect, useState } from 'react';
import { getSupabaseClient, isSupabaseConfigured } from './lib/supabase';
import logoImg from './images/acc-logo-new.png';

const MEMBERSHIP_OPTIONS = [
  { value: 'full', label: 'Full membership' },
  { value: 'inactive', label: 'Inactive membership' },
  { value: 'none', label: 'No membership' },
];

const TEAM_OPTIONS = [
  { value: 'first', label: '1st team' },
  { value: 'second', label: '2nd team' },
];

function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState('');
  const [players, setPlayers] = useState([]);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [playerSearch, setPlayerSearch] = useState('');
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [playerModalMode, setPlayerModalMode] = useState('add');
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerTeam, setNewPlayerTeam] = useState('first');
  const [newPlayerYear, setNewPlayerYear] = useState(currentYear);
  const [newPlayerMembership, setNewPlayerMembership] = useState('full');
  const [newPlayerAmount, setNewPlayerAmount] = useState('2000');
  const [newPlayerPaid, setNewPlayerPaid] = useState('0');
  const [savingPlayer, setSavingPlayer] = useState(false);
  const [deletingPlayerId, setDeletingPlayerId] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthLoading(false);
      return;
    }

    const supabase = getSupabaseClient();

    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setSession(data.session ?? null);
        setAuthLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
      setAuthLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) {
      setPlayers([]);
      return;
    }

    loadPlayersForYear(selectedYear);
  }, [session, selectedYear]);

  const loadPlayersForYear = async (year) => {
    const supabase = getSupabaseClient();

    if (!supabase || !session) {
      return;
    }

    setDashboardLoading(true);
    setDashboardError('');

    try {
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('id, full_name, main_team')
        .order('full_name', { ascending: true });

      if (playersError) {
        throw playersError;
      }

      const playerIds = (playersData || []).map((player) => player.id);

      let statusMap = new Map();

      if (playerIds.length > 0) {
        const { data: statusData, error: statusError } = await supabase
          .from('player_year_status')
          .select(
            'player_id, membership_type, payment_status, amount_due, amount_paid',
          )
          .eq('year', year)
          .in('player_id', playerIds);

        if (statusError) {
          throw statusError;
        }

        statusMap = new Map(
          (statusData || []).map((status) => [status.player_id, status]),
        );
      }

      const mergedPlayers = (playersData || []).map((player) => {
        const status = statusMap.get(player.id);

        return {
          id: player.id,
          fullName: player.full_name,
          team: player.main_team || 'first',
          membershipType: status?.membership_type || 'none',
          paymentStatus: status?.payment_status || 'unpaid',
          amountDue: Number(status?.amount_due ?? 2000),
          amountPaid: Number(status?.amount_paid ?? 0),
        };
      });

      setPlayers(mergedPlayers);
    } catch (loadError) {
      setDashboardError(
        loadError.message ||
          'Unable to load players. Please verify your database tables are created.',
      );
    } finally {
      setDashboardLoading(false);
    }
  };

  const upsertPlayerStatus = async (
    playerId,
    year,
    membershipType,
    amountDue,
    amountPaid,
  ) => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      return;
    }

    const resolvedPaymentStatus =
      amountDue <= 0 || amountPaid >= amountDue ? 'paid' : 'unpaid';

    const { error: upsertError } = await supabase
      .from('player_year_status')
      .upsert(
        {
          player_id: playerId,
          year,
          membership_type: membershipType,
          payment_status: resolvedPaymentStatus,
          amount_due: amountDue,
          amount_paid: amountPaid,
        },
        { onConflict: 'player_id,year' },
      );

    if (upsertError) {
      throw upsertError;
    }
  };

  const handleSavePlayer = async (event) => {
    event.preventDefault();

    const supabase = getSupabaseClient();
    const name = newPlayerName.trim();
    const amount = Number.parseInt(newPlayerAmount, 10);
    const paid = Number.parseInt(newPlayerPaid, 10);

    if (
      !supabase ||
      !name ||
      Number.isNaN(amount) ||
      amount < 0 ||
      Number.isNaN(paid) ||
      paid < 0
    ) {
      setDashboardError('Enter a valid amount greater than or equal to 0.');
      return;
    }

    setSavingPlayer(true);
    setDashboardError('');

    try {
      let playerId = editingPlayerId;

      if (playerModalMode === 'add') {
        const { data: playerData, error: playerError } = await supabase
          .from('players')
          .insert({
            full_name: name,
            main_team: newPlayerTeam,
            created_by: session.user.id,
          })
          .select('id, full_name')
          .single();

        if (playerError) {
          throw playerError;
        }

        playerId = playerData.id;
      } else {
        const { error: updatePlayerError } = await supabase
          .from('players')
          .update({ full_name: name, main_team: newPlayerTeam })
          .eq('id', editingPlayerId);

        if (updatePlayerError) {
          throw updatePlayerError;
        }
      }

      await upsertPlayerStatus(
        playerId,
        newPlayerYear,
        newPlayerMembership,
        amount,
        paid,
      );

      await loadPlayersForYear(selectedYear);

      setNewPlayerName('');
      setNewPlayerTeam('first');
      setNewPlayerMembership('full');
      setNewPlayerAmount('2000');
      setNewPlayerPaid('0');
      setNewPlayerYear(selectedYear);
      setEditingPlayerId(null);
      setPlayerModalMode('add');
      setIsPlayerModalOpen(false);
    } catch (saveError) {
      setDashboardError(saveError.message || 'Failed to save player details.');
    } finally {
      setSavingPlayer(false);
    }
  };

  const openAddPlayerModal = () => {
    setPlayerModalMode('add');
    setEditingPlayerId(null);
    setNewPlayerName('');
    setNewPlayerTeam('first');
    setNewPlayerYear(selectedYear);
    setNewPlayerMembership('full');
    setNewPlayerAmount('2000');
    setNewPlayerPaid('0');
    setIsPlayerModalOpen(true);
  };

  const openEditPlayerModal = (player) => {
    setPlayerModalMode('edit');
    setEditingPlayerId(player.id);
    setNewPlayerName(player.fullName);
    setNewPlayerTeam(player.team || 'first');
    setNewPlayerYear(selectedYear);
    setNewPlayerMembership(player.membershipType);
    setNewPlayerAmount(String(player.amountDue));
    setNewPlayerPaid(String(player.amountPaid));
    setIsPlayerModalOpen(true);
  };

  const getProgress = (amountPaid, amountDue) => {
    if (amountDue <= 0) {
      return 100;
    }

    return Math.max(0, Math.min(100, (amountPaid / amountDue) * 100));
  };

  const handleDeletePlayer = async (player) => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${player.fullName}? This will remove all yearly payment records too.`,
    );

    if (!confirmed) {
      return;
    }

    setDashboardError('');
    setDeletingPlayerId(player.id);

    try {
      const { error: deleteError } = await supabase
        .from('players')
        .delete()
        .eq('id', player.id);

      if (deleteError) {
        throw deleteError;
      }

      setPlayers((currentPlayers) =>
        currentPlayers.filter(
          (currentPlayer) => currentPlayer.id !== player.id,
        ),
      );
    } catch (removeError) {
      setDashboardError(removeError.message || 'Failed to delete player.');
    } finally {
      setDeletingPlayerId(null);
    }
  };

  const handleLogout = async () => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!isSupabaseConfigured) {
      setError(
        'Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file.',
      );
      return;
    }

    const supabase = getSupabaseClient();

    if (!supabase) {
      setError(
        'Supabase client could not be initialized. Check your env values.',
      );
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          throw signInError;
        }

        setMessage('Logged in successfully.');
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          throw signUpError;
        }

        setMessage(
          'Account created. Check your email for confirmation if required.',
        );
      }
    } catch (submitError) {
      setError(submitError.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 antialiased sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[80vh] w-full max-w-5xl items-center justify-center">
          <p className="text-sm text-slate-300">Loading...</p>
        </div>
      </main>
    );
  }

  if (session) {
    const yearOptions = [
      selectedYear,
      selectedYear - 1,
      selectedYear - 2,
      selectedYear + 1,
    ];

    const filteredPlayers = players.filter((player) => {
      const query = playerSearch.trim().toLowerCase();

      if (!query) {
        return true;
      }

      const teamLabel =
        TEAM_OPTIONS.find((option) => option.value === player.team)?.label ||
        '';

      return (
        player.fullName.toLowerCase().includes(query) ||
        teamLabel.toLowerCase().includes(query)
      );
    });

    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-900/90 backdrop-blur">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <img 
                  src={logoImg}
                  alt="ACC Logo"
                  className="h-8 w-8 object-contain"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
                <p className="text-base font-semibold text-white">ACC Manager</p>
              </div>
              <nav className="hidden items-center gap-5 text-sm text-slate-300 sm:flex">
                <a className="text-white" href="#">
                  Home
                </a>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <label
                className="hidden text-sm text-slate-300 sm:block"
                htmlFor="year"
              >
                Year
              </label>
              <select
                id="year"
                value={selectedYear}
                onChange={(event) =>
                  setSelectedYear(Number(event.target.value))
                }
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-100 outline-none focus:border-indigo-400"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
              >
                Log out
              </button>
            </div>
          </div>
        </header>

        <section className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl font-semibold text-white">Players</h1>
                <p className="mt-1 text-sm text-slate-400">
                  Register players and manage membership and payment status for{' '}
                  {selectedYear}.
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                <input
                  type="text"
                  value={playerSearch}
                  onChange={(event) => setPlayerSearch(event.target.value)}
                  placeholder="Search players..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 outline-none focus:border-indigo-400 sm:w-64"
                />
                <button
                  type="button"
                  onClick={openAddPlayerModal}
                  className="rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400"
                >
                  Add player
                </button>
              </div>
            </div>
          </div>

          {dashboardError && (
            <p className="rounded-md border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {dashboardError}
            </p>
          )}

          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
            <table className="min-w-full divide-y divide-slate-800">
              <thead className="bg-slate-900/80">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                    Player
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                    Team
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                    Membership ({selectedYear})
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                    Amount ({selectedYear})
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                    Payment progress ({selectedYear})
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {dashboardLoading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-5 text-sm text-slate-400"
                    >
                      Loading players...
                    </td>
                  </tr>
                ) : filteredPlayers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-5 text-sm text-slate-400"
                    >
                      No players found for this search.
                    </td>
                  </tr>
                ) : (
                  filteredPlayers.map((player) => (
                    <tr key={player.id}>
                      <td className="px-4 py-3 text-sm text-slate-100">
                        {player.fullName}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-slate-200">
                          {TEAM_OPTIONS.find(
                            (option) => option.value === player.team,
                          )?.label || '1st team'}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-slate-200">
                          {MEMBERSHIP_OPTIONS.find(
                            (option) => option.value === player.membershipType,
                          )?.label || player.membershipType}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-slate-200">
                          {Math.round(player.amountDue)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                            <div
                              className="h-full rounded-full bg-emerald-500"
                              style={{
                                width: `${getProgress(player.amountPaid, player.amountDue)}%`,
                              }}
                            />
                          </div>
                          <p className="text-xs text-slate-300">
                            {Math.round(player.amountPaid)} /{' '}
                            {Math.round(player.amountDue)} (
                            {Math.round(
                              getProgress(player.amountPaid, player.amountDue),
                            )}
                            %)
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditPlayerModal(player)}
                            className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePlayer(player)}
                            disabled={deletingPlayerId === player.id}
                            className="rounded-lg border border-rose-600/60 px-3 py-1.5 text-sm text-rose-200 transition hover:border-rose-500 hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingPlayerId === player.id
                              ? 'Deleting...'
                              : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {isPlayerModalOpen && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 px-4">
              <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">
                    {playerModalMode === 'add' ? 'Add player' : 'Edit player'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      if (!savingPlayer) {
                        setIsPlayerModalOpen(false);
                      }
                    }}
                    className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:text-white"
                  >
                    Close
                  </button>
                </div>

                <form onSubmit={handleSavePlayer} className="mt-4 space-y-4">
                  <div>
                    <label
                      className="mb-1.5 block text-sm text-slate-300"
                      htmlFor="new-player-name"
                    >
                      Player name
                    </label>
                    <input
                      id="new-player-name"
                      value={newPlayerName}
                      onChange={(event) => setNewPlayerName(event.target.value)}
                      placeholder="Player full name"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 outline-none focus:border-indigo-400"
                    />
                  </div>

                  <div>
                    <label
                      className="mb-1.5 block text-sm text-slate-300"
                      htmlFor="new-player-team"
                    >
                      Main team
                    </label>
                    <select
                      id="new-player-team"
                      value={newPlayerTeam}
                      onChange={(event) => setNewPlayerTeam(event.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-indigo-400"
                    >
                      {TEAM_OPTIONS.map((option) => (
                        <option
                          key={`team-${option.value}`}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        className="mb-1.5 block text-sm text-slate-300"
                        htmlFor="new-player-year"
                      >
                        Year
                      </label>
                      <select
                        id="new-player-year"
                        value={newPlayerYear}
                        onChange={(event) =>
                          setNewPlayerYear(Number(event.target.value))
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-indigo-400"
                      >
                        {yearOptions.map((year) => (
                          <option key={`add-${year}`} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        className="mb-1.5 block text-sm text-slate-300"
                        htmlFor="new-player-membership"
                      >
                        Membership
                      </label>
                      <select
                        id="new-player-membership"
                        value={newPlayerMembership}
                        onChange={(event) =>
                          setNewPlayerMembership(event.target.value)
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-indigo-400"
                      >
                        {MEMBERSHIP_OPTIONS.map((option) => (
                          <option
                            key={`new-${option.value}`}
                            value={option.value}
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        className="mb-1.5 block text-sm text-slate-300"
                        htmlFor="new-player-paid"
                      >
                        Amount paid (installments total)
                      </label>
                      <input
                        id="new-player-paid"
                        type="number"
                        min="0"
                        step="1"
                        value={newPlayerPaid}
                        onChange={(event) =>
                          setNewPlayerPaid(event.target.value)
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 outline-none focus:border-indigo-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="mb-1.5 block text-sm text-slate-300"
                      htmlFor="new-player-amount"
                    >
                      Amount to be paid
                    </label>
                    <input
                      id="new-player-amount"
                      type="number"
                      min="0"
                      step="1"
                      value={newPlayerAmount}
                      onChange={(event) =>
                        setNewPlayerAmount(event.target.value)
                      }
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 outline-none focus:border-indigo-400"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPlayerModalOpen(false)}
                      disabled={savingPlayer}
                      className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-slate-500 hover:text-white disabled:opacity-60"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingPlayer || !newPlayerName.trim()}
                      className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingPlayer
                        ? 'Saving...'
                        : playerModalMode === 'add'
                          ? 'Save player'
                          : 'Save changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 antialiased sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur md:grid-cols-2">
          <section 
            className="relative hidden border-r border-slate-800 bg-gradient-to-b from-indigo-600/30 via-slate-900 to-slate-900 p-10 md:flex md:flex-col md:items-center md:justify-center">
            <div className="flex flex-col items-center text-center">
              <p className="inline-flex items-center rounded-full border border-indigo-300/20 bg-indigo-400/10 px-3 py-1 text-xs font-medium text-indigo-200">
                Supabase Auth
              </p>
              <h1 className="mt-6 text-3xl font-semibold leading-tight text-white">
                Welcome back
              </h1>
              <p className="mt-3 max-w-sm text-sm text-slate-300">
                Sign in securely and access your app from anywhere with
                cloud-hosted data.
              </p>
              <img 
                src={logoImg}
                alt="ACC Logo"
                className="mt-8 max-w-xs rounded-lg object-contain"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>
          </section>

          <section className="p-6 sm:p-10">
            <div className="mx-auto w-full max-w-sm">
              <h2 className="text-2xl font-semibold text-white">
                {mode === 'login'
                  ? 'Login to your account'
                  : 'Create your account'}
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                {mode === 'login'
                  ? 'Enter your details to continue.'
                  : 'Use your email and password to sign up.'}
              </p>

              <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label
                    className="mb-1.5 block text-sm font-medium text-slate-200"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 outline-none ring-indigo-400 transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label
                    className="mb-1.5 block text-sm font-medium text-slate-200"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 outline-none ring-indigo-400 transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2"
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <p className="rounded-md border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                    {error}
                  </p>
                )}

                {message && (
                  <p className="rounded-md border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                    {message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? 'Please wait...'
                    : mode === 'login'
                      ? 'Login'
                      : 'Create account'}
                </button>
              </form>

              <p className="mt-5 text-sm text-slate-400">
                {mode === 'login'
                  ? "Don't have an account?"
                  : 'Already have an account?'}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'login' ? 'signup' : 'login');
                    setError('');
                    setMessage('');
                  }}
                  className="font-medium text-indigo-300 hover:text-indigo-200"
                >
                  {mode === 'login' ? 'Create one' : 'Login'}
                </button>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default App;
