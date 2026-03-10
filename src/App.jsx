import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { getSupabaseClient, isSupabaseConfigured } from './lib/supabase';
import logoImg from './images/acc-logo-new.png';
import LandingPage from './LandingPage';
import EventManager from './EventManager';
import NewsManager from './NewsManager';
import NewsDetail from './NewsDetail';

const MEMBERSHIP_OPTIONS = [
  { value: 'full', label: 'Full membership' },
  { value: 'inactive', label: 'Inactive membership' },
  { value: 'none', label: 'No membership' },
];

const TEAM_OPTIONS = [
  { value: 'first', label: '1st team' },
  { value: 'second', label: '2nd team' },
];

function AdminPortalApp() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [adminAccessLoading, setAdminAccessLoading] = useState(false);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
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
  const [newPlayerEmail, setNewPlayerEmail] = useState('');
  const [newPlayerPhone, setNewPlayerPhone] = useState('');
  const [newPlayerAddress, setNewPlayerAddress] = useState('');
  const [newPlayerTeam, setNewPlayerTeam] = useState('first');
  const [newPlayerYear, setNewPlayerYear] = useState(currentYear);
  const [newPlayerMembership, setNewPlayerMembership] = useState('full');
  const [newPlayerAmount, setNewPlayerAmount] = useState('2000');
  const [newPlayerPaid, setNewPlayerPaid] = useState('0');
  const [savingPlayer, setSavingPlayer] = useState(false);
  const [deletingPlayerId, setDeletingPlayerId] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  // forgot password states
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  // profile editing states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileFullName, setProfileFullName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  // admin section states
  const [currentView, setCurrentView] = useState('admin'); // 'players' or 'admin'
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('ACC Membership - Payment Reminder');
  const [emailBody, setEmailBody] = useState(
    'This is a friendly reminder that you have outstanding payments for your ACC membership for the current season.\n\nPlease arrange payment at your earliest convenience.\n\nThank you for your attention to this matter.',
  );
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [unpaidPlayers, setUnpaidPlayers] = useState([]);
  const [unpaidLoadingError, setUnpaidLoadingError] = useState('');
  const [selectedPlayersForEmail, setSelectedPlayersForEmail] = useState(new Set());

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
      setProfileFullName('');
      setProfileEmail('');
      setIsProfileModalOpen(false);
    }
  }, [session]);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!session) {
        setHasAdminAccess(false);
        setAdminAccessLoading(false);
        return;
      }

      const supabase = getSupabaseClient();
      if (!supabase) {
        setHasAdminAccess(false);
        setAdminAccessLoading(false);
        return;
      }

      setAdminAccessLoading(true);
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('is_approved')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (error) {
          throw error;
        }

        setHasAdminAccess(Boolean(data?.is_approved));
      } catch {
        setHasAdminAccess(false);
      } finally {
        setAdminAccessLoading(false);
      }
    };

    checkAdminAccess();
  }, [session]);

  useEffect(() => {
    if (!session || !hasAdminAccess) {
      setPlayers([]);
      return;
    }

    loadPlayersForYear(selectedYear);
  }, [session, selectedYear, hasAdminAccess]);

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
        .select('id, full_name, main_team, email, phone, address')
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
          email: player.email || '',
          phone: player.phone || '',
          address: player.address || '',
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
        const insertPayload = {
          full_name: name,
          main_team: newPlayerTeam,
          created_by: session.user.id,
        };
        if (newPlayerEmail.trim()) insertPayload.email = newPlayerEmail.trim();
        if (newPlayerPhone.trim()) insertPayload.phone = newPlayerPhone.trim();
        if (newPlayerAddress.trim()) insertPayload.address = newPlayerAddress.trim();

        const { data: playerData, error: playerError } = await supabase
          .from('players')
          .insert(insertPayload)
          .select('id, full_name')
          .single();

        if (playerError) {
          throw playerError;
        }

        playerId = playerData.id;
      } else {
        const updatePayload = { full_name: name, main_team: newPlayerTeam };
        if (newPlayerEmail.trim()) updatePayload.email = newPlayerEmail.trim();
        else updatePayload.email = null;
        if (newPlayerPhone.trim()) updatePayload.phone = newPlayerPhone.trim();
        else updatePayload.phone = null;
        if (newPlayerAddress.trim()) updatePayload.address = newPlayerAddress.trim();
        else updatePayload.address = null;

        const { error: updatePlayerError } = await supabase
          .from('players')
          .update(updatePayload)
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
      setNewPlayerEmail('');
      setNewPlayerPhone('');
      setNewPlayerAddress('');
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
    setNewPlayerEmail('');
    setNewPlayerPhone('');
    setNewPlayerAddress('');
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
    setNewPlayerEmail(player.email || '');
    setNewPlayerPhone(player.phone || '');
    setNewPlayerAddress(player.address || '');
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

  const openProfileModal = () => {
    if (!session) return;
    setProfileFullName(session.user.user_metadata?.full_name || '');
    setProfileEmail(session.user.email);
    setProfileError('');
    setIsProfileModalOpen(true);
  };

  const handleSaveProfile = async () => {
    setProfileError('');
    if (!session) return;
    if (!profileFullName.trim()) {
      setProfileError('Name cannot be empty.');
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setProfileError('Supabase client could not be initialized.');
      return;
    }

    setProfileLoading(true);
    try {
      const updates = { data: { full_name: profileFullName } };
      // optionally include email update here if desired
      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;

      // refresh session so header shows updated name
      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
      setIsProfileModalOpen(false);
    } catch (err) {
      setProfileError(err.message || 'Unable to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    // clear password-reset notices as well
    setForgotError('');
    setForgotMessage('');

    if (!isSupabaseConfigured) {
      setError(
        'Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file.',
      );
      return;
    }

    if (mode === 'signup' && !fullName.trim()) {
      setError('Please enter your full name.');
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
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (signUpError) {
          throw signUpError;
        }

        setMessage(
          'Account created. Check your email for confirmation if required. Your admin access must be approved before you can use the portal.',
        );
      }
    } catch (submitError) {
      setError(submitError.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setForgotError('');
    setForgotMessage('');

    if (!email) {
      setForgotError('Please enter your email address.');
      return;
    }

    if (!isSupabaseConfigured) {
      setForgotError('Supabase is not configured yet.');
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setForgotError('Supabase client could not be initialized.');
      return;
    }

    setForgotLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
      );
      if (resetError) throw resetError;
      setForgotMessage('Password recovery email sent. Check your inbox.');
    } catch (err) {
      setForgotError(err.message || 'Failed to send recovery email.');
    } finally {
      setForgotLoading(false);
    }
  };

  const loadUnpaidPlayers = async () => {
    const supabase = getSupabaseClient();
    if (!supabase || !session) return;

    setUnpaidLoadingError('');
    try {
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('id, full_name, email, main_team')
        .order('full_name', { ascending: true });

      if (playersError) throw playersError;

      const playerIds = (playersData || []).map((player) => player.id);

      if (playerIds.length === 0) {
        setUnpaidPlayers([]);
        return;
      }

      const { data: statusData, error: statusError } = await supabase
        .from('player_year_status')
        .select('player_id, amount_due, amount_paid')
        .eq('year', selectedYear)
        .in('player_id', playerIds);

      if (statusError) throw statusError;

      const statusMap = new Map(
        (statusData || []).map((status) => [status.player_id, status]),
      );

      const unpaid = (playersData || [])
        .map((player) => {
          const status = statusMap.get(player.id);
          return {
            id: player.id,
            fullName: player.full_name,
            email: player.email,
            team: player.main_team,
            amountDue: status?.amount_due || 0,
            amountPaid: status?.amount_paid || 0,
          };
        })
        .filter(
          (player) =>
            player.email &&
            player.amountDue > 0 &&
            player.amountPaid < player.amountDue,
        );

      setUnpaidPlayers(unpaid);
    } catch (err) {
      setUnpaidLoadingError(err.message || 'Failed to load unpaid players.');
    }
  };

  const openEmailModal = async () => {
    setEmailError('');
    setEmailMessage('');
    await loadUnpaidPlayers();
    // Select all players by default
    setSelectedPlayersForEmail(new Set());
    setIsEmailModalOpen(true);
  };

  const handleSendEmails = async () => {
    setEmailError('');
    setEmailMessage('');

    if (selectedPlayersForEmail.size === 0) {
      setEmailError('Please select at least one player to receive the email.');
      return;
    }

    if (!emailSubject.trim() || !emailBody.trim()) {
      setEmailError('Subject and body cannot be empty.');
      return;
    }

    setEmailLoading(true);
    try {
      // Filter to only send to selected players
      const playersToEmail = unpaidPlayers.filter((player) =>
        selectedPlayersForEmail.has(player.id),
      );

      // Send emails one by one
      for (const player of playersToEmail) {
        const supabase = getSupabaseClient();
        if (!supabase) throw new Error('Supabase client not initialized');

        // Convert plain text to HTML (preserve line breaks)
        const htmlBody = emailBody
          .split('\n')
          .map((line) => `<p>${line.trim() || '&nbsp;'}</p>`)
          .join('');

        const { error: emailError } = await supabase.functions.invoke(
          'send-email',
          {
            body: {
              to: player.email,
              subject: emailSubject,
              html: htmlBody,
              playerName: player.fullName,
            },
          },
        );

        if (emailError) {
          console.error(`Failed to send email to ${player.email}:`, emailError);
        }
      }

      setEmailMessage(
        `Emails sent to ${playersToEmail.length} player(s).`,
      );
      setTimeout(() => {
        setIsEmailModalOpen(false);
      }, 2000);
    } catch (err) {
      setEmailError(
        err.message ||
          'Failed to send emails. Ensure your backend email function is configured.',
      );
    } finally {
      setEmailLoading(false);
    }
  };

  if (authLoading || adminAccessLoading) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 antialiased sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[80vh] w-full max-w-5xl items-center justify-center">
          <p className="text-sm text-slate-300">Loading...</p>
        </div>
      </main>
    );
  }

  if (session && !hasAdminAccess) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 antialiased sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[80vh] w-full max-w-3xl items-center justify-center">
          <div className="w-full rounded-2xl border border-amber-500/30 bg-amber-500/10 p-8 text-center">
            <h1 className="text-2xl font-semibold text-white">Admin access pending approval</h1>
            <p className="mt-3 text-sm text-slate-200">
              Your account is signed in, but it has not been approved for admin access yet.
              Please contact an existing admin to approve your account.
            </p>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-6 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
            >
              Log out
            </button>
          </div>
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
                <button
                  type="button"
                  onClick={() => setCurrentView('admin')}
                  className={`transition ${
                    currentView === 'admin' ? 'text-white' : 'hover:text-white'
                  }`}
                >
                  Admin
                </button>
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
              <p className="hidden text-sm text-slate-300 sm:block">
                Signed in as{' '}
                <span className="font-medium text-white">
                  {session.user.user_metadata?.full_name || session.user.email}
                </span>
              </p>
              <button
                type="button"
                onClick={openProfileModal}
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
              >
                Profile
              </button>
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

        <section className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
          {currentView === 'players' ? (
            <>
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
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400 sm:table-cell">
                    Email
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400 sm:table-cell">
                    Team
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400 sm:table-cell">
                    Membership ({selectedYear})
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400 sm:table-cell">
                    Amount ({selectedYear})
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400 sm:table-cell">
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
                      colSpan={7}
                      className="px-4 py-5 text-sm text-slate-400"
                    >
                      Loading players...
                    </td>
                  </tr>
                ) : filteredPlayers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
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
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <p className="text-sm text-slate-200">
                          {player.email || '—'}
                        </p>
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <p className="text-sm text-slate-200">
                          {TEAM_OPTIONS.find(
                            (option) => option.value === player.team,
                          )?.label || '1st team'}
                        </p>
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <p className="text-sm text-slate-200">
                          {MEMBERSHIP_OPTIONS.find(
                            (option) => option.value === player.membershipType,
                          )?.label || player.membershipType}
                        </p>
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <p className="text-sm text-slate-200">
                          {Math.round(player.amountDue)}
                        </p>
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
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
            </>
          ) : currentView === 'admin' ? (
            <>
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-white mb-2">Manage Players</h2>
                      <p className="mb-3 text-sm text-slate-400">Open the player management view.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentView('players')}
                      className="w-56 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400 sm:ml-4 sm:mt-0 mt-3"
                    >
                      Manage Players
                    </button>
                  </div>
                </div>
                <div className="mt-6 border-t border-slate-800 pt-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-white">Admin</h2>
                      <p className="mt-1 text-sm text-slate-400">
                        Manage email communications for unpaid players.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={openEmailModal}
                      className="w-56 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400"
                    >
                      Send Payment Reminder
                    </button>
                  </div>
                </div>
                {/* New Manage Events section */}
                <div className="mt-6 border-t border-slate-800 pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-white mb-2">Manage Events</h2>
                      <p className="mb-3 text-sm text-slate-400">Add, edit, activate/deactivate, or delete club events and matches.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentView('events')}
                      className="w-56 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400 sm:ml-4 sm:mt-0 mt-3"
                    >
                      Manage Events
                    </button>
                  </div>
                </div>
                {/* New Manage News section */}
                <div className="mt-6 border-t border-slate-800 pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-white mb-2">Manage News</h2>
                      <p className="mb-3 text-sm text-slate-400">Add, edit, activate/deactivate, or delete club news items.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentView('news')}
                      className="w-56 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400 sm:ml-4 sm:mt-0 mt-3"
                    >
                      Manage News
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : currentView === 'events' ? (
            <EventManager />
          ) : currentView === 'news' ? (
            <NewsManager />
          ) : (
            <>
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
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400 sm:table-cell">
                    Email
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400 sm:table-cell">
                    Team
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400 sm:table-cell">
                    Membership ({selectedYear})
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400 sm:table-cell">
                    Amount ({selectedYear})
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400 sm:table-cell">
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
                      colSpan={7}
                      className="px-4 py-5 text-sm text-slate-400"
                    >
                      Loading players...
                    </td>
                  </tr>
                ) : filteredPlayers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
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
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <p className="text-sm text-slate-200">
                          {player.email || '—'}
                        </p>
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <p className="text-sm text-slate-200">
                          {TEAM_OPTIONS.find(
                            (option) => option.value === player.team,
                          )?.label || '1st team'}
                        </p>
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <p className="text-sm text-slate-200">
                          {MEMBERSHIP_OPTIONS.find(
                            (option) => option.value === player.membershipType,
                          )?.label || player.membershipType}
                        </p>
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <p className="text-sm text-slate-200">
                          {Math.round(player.amountDue)}
                        </p>
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
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
            </>
          )}
        </section>

        {isPlayerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-2xl rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
              <h2 className="text-lg font-semibold text-white">
                {playerModalMode === 'add' ? 'Add Player' : 'Edit Player'}
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Manage player profile and yearly membership/payment details.
              </p>

              <form onSubmit={handleSavePlayer} className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-200" htmlFor="playerName">
                      Full name
                    </label>
                    <input
                      id="playerName"
                      type="text"
                      value={newPlayerName}
                      onChange={(event) => setNewPlayerName(event.target.value)}
                      required
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-200" htmlFor="playerEmail">
                      Email
                    </label>
                    <input
                      id="playerEmail"
                      type="email"
                      value={newPlayerEmail}
                      onChange={(event) => setNewPlayerEmail(event.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-200" htmlFor="playerPhone">
                      Phone
                    </label>
                    <input
                      id="playerPhone"
                      type="text"
                      value={newPlayerPhone}
                      onChange={(event) => setNewPlayerPhone(event.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-200" htmlFor="playerTeam">
                      Team
                    </label>
                    <select
                      id="playerTeam"
                      value={newPlayerTeam}
                      onChange={(event) => setNewPlayerTeam(event.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
                    >
                      {TEAM_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-slate-200" htmlFor="playerAddress">
                      Address
                    </label>
                    <input
                      id="playerAddress"
                      type="text"
                      value={newPlayerAddress}
                      onChange={(event) => setNewPlayerAddress(event.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-200" htmlFor="playerYear">
                      Year
                    </label>
                    <input
                      id="playerYear"
                      type="number"
                      value={newPlayerYear}
                      onChange={(event) => setNewPlayerYear(Number(event.target.value))}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-200" htmlFor="playerMembership">
                      Membership
                    </label>
                    <select
                      id="playerMembership"
                      value={newPlayerMembership}
                      onChange={(event) => setNewPlayerMembership(event.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
                    >
                      {MEMBERSHIP_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-200" htmlFor="playerAmount">
                      Amount due
                    </label>
                    <input
                      id="playerAmount"
                      type="number"
                      min="0"
                      value={newPlayerAmount}
                      onChange={(event) => setNewPlayerAmount(event.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-200" htmlFor="playerPaid">
                      Amount paid
                    </label>
                    <input
                      id="playerPaid"
                      type="number"
                      min="0"
                      value={newPlayerPaid}
                      onChange={(event) => setNewPlayerPaid(event.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPlayerModalOpen(false)}
                    className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
                    disabled={savingPlayer}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingPlayer}
                    className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:opacity-60"
                  >
                    {savingPlayer
                      ? 'Saving...'
                      : playerModalMode === 'add'
                        ? 'Add Player'
                        : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Payment Reminder Modal */}
        {isEmailModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="w-full max-w-lg rounded-xl bg-slate-900 p-6 shadow-2xl border border-slate-700 relative">
              <h2 className="text-lg font-semibold text-white mb-2">Send Payment Reminder</h2>
              <p className="mb-3 text-sm text-slate-400">Send a payment reminder email to selected unpaid players.</p>
              {emailError && (
                <p className="mb-2 rounded-md border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{emailError}</p>
              )}
              {emailMessage && (
                <p className="mb-2 rounded-md border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{emailMessage}</p>
              )}
              <form
                onSubmit={e => { e.preventDefault(); handleSendEmails(); }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Subject</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={e => setEmailSubject(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Body</label>
                  <textarea
                    value={emailBody}
                    onChange={e => setEmailBody(e.target.value)}
                    rows={6}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Select Players</label>
                  <div className="max-h-40 overflow-y-auto rounded border border-slate-700 bg-slate-950 p-2">
                    {unpaidPlayers.length === 0 ? (
                      <p className="text-sm text-slate-400">No unpaid players with email found.</p>
                    ) : (
                      unpaidPlayers.map(player => (
                        <label key={player.id} className="flex items-center gap-2 py-1 text-slate-100 text-sm">
                          <input
                            type="checkbox"
                            checked={selectedPlayersForEmail.has(player.id)}
                            onChange={e => {
                              const updated = new Set(selectedPlayersForEmail);
                              if (e.target.checked) updated.add(player.id);
                              else updated.delete(player.id);
                              setSelectedPlayersForEmail(updated);
                            }}
                          />
                          {player.fullName} <span className="ml-2 text-xs text-slate-400">({player.email})</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsEmailModalOpen(false)}
                    className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
                    disabled={emailLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:opacity-60"
                    disabled={emailLoading}
                  >
                    {emailLoading ? 'Sending...' : 'Send Email'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
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
                Aalborg Cricket Club Manager
              </p>
              <h1 className="mt-6 text-3xl font-semibold leading-tight text-white">
                Welcome back
              </h1>
              <p className="mt-3 max-w-sm text-sm text-slate-300">
                Sign in securely and access your dashboard to manage players and payments.
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
                {mode === 'signup' && (
                  <div>
                    <label
                      className="mb-1.5 block text-sm font-medium text-slate-200"
                      htmlFor="fullName"
                    >
                      Full name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      required
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 outline-none ring-indigo-400 transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2"
                      placeholder="Your name"
                    />
                  </div>
                )}

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

                {/* forgot password link only when logging in */}
                {mode === 'login' && (
                  <div className="text-right">
                    <button
                      type="button"
                      disabled={forgotLoading}
                      onClick={handleForgotPassword}
                      className="text-sm text-indigo-300 hover:text-indigo-200"
                    >
                      {forgotLoading ? 'Sending...' : 'Forgot password?'}
                    </button>
                  </div>
                )}

                {forgotError && (
                  <p className="rounded-md border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                    {forgotError}
                  </p>
                )}

                {forgotMessage && (
                  <p className="rounded-md border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                    {forgotMessage}
                  </p>
                )}

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
                    setForgotError('');
                    setForgotMessage('');
                    setFullName('');
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


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/*" element={<AdminPortalApp />} />
        <Route path="/news/:id" element={<NewsDetail />} />
        <Route path="/*" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
