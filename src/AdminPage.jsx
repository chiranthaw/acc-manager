import { Link } from 'react-router-dom';
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

function AdminPage() {
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
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileMessage, setProfileMessage] = useState('');

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const supabase = getSupabaseClient();
    if (!supabase) {
      setError('Supabase is not configured');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setMessage('Login successful!');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const supabase = getSupabaseClient();
    if (!supabase) {
      setError('Supabase is not configured');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      setMessage('Signup successful! Please check your email for verification.');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError('');
    setForgotMessage('');

    const supabase = getSupabaseClient();
    if (!supabase) {
      setForgotError('Supabase is not configured');
      setForgotLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setForgotMessage('Password reset email sent! Please check your inbox.');
    } catch (error) {
      setForgotError(error.message);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    await supabase.auth.signOut();
    setSession(null);
  };

  const fetchPlayers = async () => {
    setDashboardLoading(true);
    setDashboardError('');

    const supabase = getSupabaseClient();
    if (!supabase) {
      setDashboardError('Supabase is not configured');
      setDashboardLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('player_year_status')
        .select(`
          *,
          players (
            id,
            full_name,
            email,
            phone,
            address,
            main_team
          )
        `)
        .eq('year', selectedYear);

      if (error) throw error;

      // Transform the data to match the expected format
      const transformedData = data.map(item => ({
        id: item.players.id,
        name: item.players.full_name,
        email: item.players.email,
        phone: item.players.phone,
        address: item.players.address,
        team: item.players.main_team,
        year: item.year,
        membership: item.membership_type,
        amount: item.amount_due,
        paid: item.amount_paid,
      }));

      // Sort by name
      transformedData.sort((a, b) => a.name.localeCompare(b.name));

      setPlayers(transformedData || []);
    } catch (error) {
      setDashboardError(error.message);
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchPlayers();
    }
  }, [session, selectedYear]);

  const handleSavePlayer = async () => {
    setSavingPlayer(true);

    const supabase = getSupabaseClient();
    if (!supabase) {
      setSavingPlayer(false);
      return;
    }

    const playerData = {
      full_name: newPlayerName,
      email: newPlayerEmail,
      phone: newPlayerPhone,
      address: newPlayerAddress,
      main_team: newPlayerTeam,
    };

    const yearData = {
      year: newPlayerYear,
      membership_type: newPlayerMembership,
      amount_due: parseFloat(newPlayerAmount) || 0,
      amount_paid: parseFloat(newPlayerPaid) || 0,
    };

    try {
      if (playerModalMode === 'add') {
        // Insert into players first
        const { data: playerInsert, error: playerError } = await supabase
          .from('players')
          .insert([playerData])
          .select('id')
          .single();

        if (playerError) throw playerError;

        // Then insert into player_year_status
        const { error: yearError } = await supabase
          .from('player_year_status')
          .insert([{
            player_id: playerInsert.id,
            ...yearData,
          }]);

        if (yearError) throw yearError;
      } else {
        // Update players
        const { error: playerError } = await supabase
          .from('players')
          .update(playerData)
          .eq('id', editingPlayerId);

        if (playerError) throw playerError;

        // Update or insert player_year_status
        // First check if exists
        const { data: existing } = await supabase
          .from('player_year_status')
          .select('id')
          .eq('player_id', editingPlayerId)
          .eq('year', newPlayerYear)
          .single();

        if (existing) {
          // Update
          const { error: yearError } = await supabase
            .from('player_year_status')
            .update(yearData)
            .eq('player_id', editingPlayerId)
            .eq('year', newPlayerYear);

          if (yearError) throw yearError;
        } else {
          // Insert new year status
          const { error: yearError } = await supabase
            .from('player_year_status')
            .insert([{
              player_id: editingPlayerId,
              ...yearData,
            }]);

          if (yearError) throw yearError;
        }
      }

      setIsPlayerModalOpen(false);
      resetPlayerForm();
      fetchPlayers();
    } catch (error) {
      console.error('Error saving player:', error);
      // You might want to show an error message here
    } finally {
      setSavingPlayer(false);
    }
  };

  const handleDeletePlayer = async (id) => {
    setDeletingPlayerId(id);

    const supabase = getSupabaseClient();
    if (!supabase) {
      setDeletingPlayerId(null);
      return;
    }

    try {
      const { error } = await supabase.from('players').delete().eq('id', id);
      if (error) throw error;

      fetchPlayers();
    } catch (error) {
      console.error('Error deleting player:', error);
    } finally {
      setDeletingPlayerId(null);
    }
  };

  const resetPlayerForm = () => {
    setNewPlayerName('');
    setNewPlayerEmail('');
    setNewPlayerPhone('');
    setNewPlayerAddress('');
    setNewPlayerTeam('first');
    setNewPlayerYear(currentYear);
    setNewPlayerMembership('full');
    setNewPlayerAmount('2000');
    setNewPlayerPaid('0');
    setEditingPlayerId(null);
    setPlayerModalMode('add');
  };

  const handleEditPlayer = (player) => {
    setPlayerModalMode('edit');
    setEditingPlayerId(player.id);
    setNewPlayerName(player.name);
    setNewPlayerEmail(player.email);
    setNewPlayerPhone(player.phone);
    setNewPlayerAddress(player.address);
    setNewPlayerTeam(player.team);
    setNewPlayerYear(player.year);
    setNewPlayerMembership(player.membership);
    setNewPlayerAmount(player.amount.toString());
    setNewPlayerPaid(player.paid.toString());
    setIsPlayerModalOpen(true);
  };

  const handleUpdateProfile = async () => {
    setUpdatingProfile(true);
    setProfileError('');
    setProfileMessage('');

    const supabase = getSupabaseClient();
    if (!supabase) {
      setUpdatingProfile(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        email: profileEmail,
        data: { full_name: profileFullName },
      });

      if (error) throw error;

      setProfileMessage('Profile updated successfully!');
      setIsProfileModalOpen(false);
    } catch (error) {
      setProfileError(error.message);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const filteredPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(playerSearch.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center">
            <img src={logoImg} alt="ACC Logo" className="mx-auto h-16 w-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Australian Cricket Club Manager</h1>
            <p className="text-gray-300 mb-6">
              Supabase is not configured. Please check your environment variables.
            </p>
            <p className="text-sm text-gray-500">
              Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <img src={logoImg} alt="ACC Logo" className="mx-auto h-16 w-auto mb-4" />
            <h1 className="text-2xl font-bold text-white">Australian Cricket Club Manager</h1>
          </div>

          <div className="mb-6">
            <div className="flex border-b border-gray-600">
              <button
                className={`flex-1 py-2 px-4 text-center ${
                  mode === 'login'
                    ? 'border-b-2 border-blue-600 text-blue-400'
                    : 'text-gray-400'
                }`}
                onClick={() => setMode('login')}
              >
                Login
              </button>
              <button
                className={`flex-1 py-2 px-4 text-center ${
                  mode === 'signup'
                    ? 'border-b-2 border-blue-600 text-blue-400'
                    : 'text-gray-400'
                }`}
                onClick={() => setMode('signup')}
              >
                Sign Up
              </button>
            </div>
          </div>

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          )}

          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Signing up...' : 'Sign Up'}
              </button>
            </form>
          )}

          {mode === 'login' && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setMode('forgot')}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Forgot password?
              </button>
            </div>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {forgotLoading ? 'Sending...' : 'Send Reset Email'}
              </button>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-sm text-gray-400 hover:text-gray-300"
              >
                Back to Login
              </button>
            </form>
          )}

          {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
          {message && <p className="mt-4 text-green-400 text-sm">{message}</p>}
          {forgotError && <p className="mt-4 text-red-400 text-sm">{forgotError}</p>}
          {forgotMessage && <p className="mt-4 text-green-400 text-sm">{forgotMessage}</p>}
        </div>
      </div>
    );
  }

  // ...existing code...
  // Restore the original layout and styles for login, player list, and modals
  // ...copy-paste the original JSX from the previous version here...
  // ...existing code...
}

export default AdminPage;