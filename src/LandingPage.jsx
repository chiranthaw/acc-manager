import badtImg from './images/badt.jpg';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logoImg from './images/acc-logo-new.png';
import heroBg from './images/acc1.jpg';
import bowlingBg from './images/bowling.png';
import upcomingMatchesBg from './images/acc-1.png';
import holdetImg from './images/holdet.jpg';
import schoolCricketImg1 from './images/skolecricket.jpg';
import schoolCricketImg2 from './images/foreningsfestival.jpg';
import newMemberImg from './images/newmember.jpg';
import feeImg from './images/fee.jpg';
import activeMemberImg from './images/activemember.jpg';
import translations from './lang';
import ContactSection from './ContactSection';
import SponsorsSection from './SponsorsSection';
import ActivityCarousel from './ActivityCarousel';
import { getSupabaseClient } from './lib/supabase';

const LandingPage = () => {
  // Theme state: 'dark' | 'light'
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark';
  });

  // Language state: 'en' | 'da'
  const [lang, setLang] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lang') || 'en';
    }
    return 'en';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);


  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  // Scroll to #news if hash is present
  useEffect(() => {
    if (window.location.hash === '#news') {
      const el = document.getElementById('news');
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100); // Delay to ensure DOM is ready
      }
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'da' : 'en'));
  };

  const t = translations;
  const schoolCricketLinks = [
    {
      title: t[lang].schoolCricketCard1Title,
      image: schoolCricketImg1,
      url: 'https://spillercricket.dk/',
    },
    {
      title: t[lang].schoolCricketCard2Title,
      image: schoolCricketImg2,
      url: 'https://skoleidraet.dk/',
    },
  ];
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState("");
  const [selectedNews, setSelectedNews] = useState(null);
  useEffect(() => {
    async function fetchNews() {
      setNewsLoading(true);
      setNewsError("");
      try {
        const { getSupabaseClient } = await import("./lib/supabase");
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from("news")
          .select("id, title, summary, content, date, is_active, image_url")
          .eq("is_active", true)
          .order("date", { ascending: false });
        if (error) throw error;
        setNews(data || []);
      } catch (err) {
        setNewsError(err.message || "Could not load news.");
      } finally {
        setNewsLoading(false);
      }
    }
    fetchNews();
  }, []);

  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState("");
  // Carousel state for events
  const [eventStartIdx, setEventStartIdx] = useState(0);
  // Contact form state
  const [contactForm, setContactForm] = useState({ name: '', phone: '', message: '' });
  const [contactFormSubmitting, setContactFormSubmitting] = useState(false);
  const [contactFormMessage, setContactFormMessage] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);

  // Helper to show only non-match events (by date desc)
  const sortedEvents = [...events]
    .filter((event) => (event.event_type || '').toLowerCase() !== 'match')
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const visibleEvents = sortedEvents.slice(eventStartIdx, eventStartIdx + 3);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const upcomingMatches = [...events]
    .filter((event) => {
      if ((event.event_type || '').toLowerCase() !== 'match' || !event.date) {
        return false;
      }
      const eventDate = new Date(`${event.date}T00:00:00`);
      return !Number.isNaN(eventDate.getTime()) && eventDate >= todayStart;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const formatMatchDateParts = (dateValue) => {
    if (!dateValue || typeof dateValue !== 'string') {
      return { day: '--', month: '--' };
    }

    const dateParts = dateValue.split('-').map((part) => Number(part));
    if (dateParts.length !== 3 || dateParts.some((part) => Number.isNaN(part))) {
      return { day: dateValue, month: '' };
    }

    const [year, month, day] = dateParts;
    const parsedDate = new Date(year, month - 1, day);
    if (Number.isNaN(parsedDate.getTime())) {
      return { day: dateValue, month: '' };
    }

    const locale = lang === 'da' ? 'da-DK' : 'en-GB';
    const monthLabel = new Intl.DateTimeFormat(locale, { month: 'short' }).format(parsedDate);

    return {
      day: String(day),
      month: monthLabel,
    };
  };

  const canGoPrev = eventStartIdx > 0;
  const canGoNext = eventStartIdx + 3 < sortedEvents.length;
  const handlePrev = () => {
    if (canGoPrev) setEventStartIdx(eventStartIdx - 1);
  };
  const handleNext = () => {
    if (canGoNext) setEventStartIdx(eventStartIdx + 1);
  };

  const handleContactFormSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.phone.trim() || !contactForm.message.trim()) {
      setContactFormMessage({ type: 'error', text: t[lang].contactFormError });
      return;
    }

    setContactFormSubmitting(true);
    setContactFormMessage(null);

    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Supabase not configured');
      }

      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: 'Aalborg Cricket Club <info@aalborg-cricket.dk>',
          subject: `New Membership Inquiry from ${contactForm.name}`,
          templateType: 'membership_inquiry',
          templateVariables: {
            CONTACT_NAME: contactForm.name,
            CONTACT_PHONE: contactForm.phone,
            MESSAGE: contactForm.message,
          },
        },
      });

      if (error) throw error;

      setContactFormMessage({ type: 'success', text: t[lang].contactFormSuccess });
      setContactForm({ name: '', phone: '', message: '' });
      setTimeout(() => setShowContactModal(false), 2000);
    } catch (err) {
      setContactFormMessage({ type: 'error', text: t[lang].contactFormError });
      console.error('Error sending message:', err);
    } finally {
      setContactFormSubmitting(false);
    }
  };

  useEffect(() => {
    async function fetchEvents() {
      setEventsLoading(true);
      setEventsError("");
      try {
        const { getSupabaseClient } = await import("./lib/supabase");
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from("events")
          .select("id, title, date, time, location, is_active, event_type, extra, home_team_id, away_team_id, home_team:home_team_id(id, name, logo_url), away_team:away_team_id(id, name, logo_url)")
          .eq("is_active", true)
          .order("date", { ascending: true });
        if (error) throw error;
        console.log("Fetched events from DB:", data);
        setEvents(data || []);
      } catch (err) {
        setEventsError(err.message || "Could not load events.");
      } finally {
        setEventsLoading(false);
      }
    }
    fetchEvents();
  }, []);

  return (
    <div className={
      `min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 text-white' : 'bg-gradient-to-br from-green-50 to-blue-50 text-gray-900'}`
    }>
      {/* Header */}
      <header className={`sticky top-0 z-30 shadow-lg backdrop-blur-md bg-opacity-90 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}> 
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <img
                src={logoImg}
                alt="ACC Logo"
                className="h-12 w-auto"
                style={theme === 'dark' ? { filter: 'brightness(0) invert(1)' } : {}}
              />
              <Link to="/" className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} hover:text-green-500 transition`} style={{ textDecoration: 'none' }}>
                {t[lang].clubName.toUpperCase()}
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#about" className={theme === 'dark' ? 'text-gray-300 hover:text-green-300 transition-colors' : 'text-gray-700 hover:text-green-600 transition-colors'}>{t[lang].about}</a>
              <a href="#news" className={theme === 'dark' ? 'text-gray-300 hover:text-green-300 transition-colors' : 'text-gray-700 hover:text-green-600 transition-colors'}>{t[lang].news}</a>
              <a href="#matches" className={theme === 'dark' ? 'text-gray-300 hover:text-green-300 transition-colors' : 'text-gray-700 hover:text-green-600 transition-colors'}>{t[lang].matches}</a>
              <a href="#events" className={theme === 'dark' ? 'text-gray-300 hover:text-green-300 transition-colors' : 'text-gray-700 hover:text-green-600 transition-colors'}>{t[lang].events}</a>
              <a href="#sponsors" className={theme === 'dark' ? 'text-gray-300 hover:text-green-300 transition-colors' : 'text-gray-700 hover:text-green-600 transition-colors'}>Sponsors</a>
              <div className="relative group">
                <button
                  type="button"
                  className={theme === 'dark' ? 'text-gray-300 hover:text-green-300 transition-colors' : 'text-gray-700 hover:text-green-600 transition-colors'}
                >
                  {t[lang].contact}
                </button>
                <div className={theme === 'dark'
                  ? 'invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute top-full left-1/2 -translate-x-1/2 mt-2 min-w-44 rounded-lg border border-slate-700 bg-slate-900 shadow-xl transition-all duration-150 z-40'
                  : 'invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute top-full left-1/2 -translate-x-1/2 mt-2 min-w-44 rounded-lg border border-slate-200 bg-white shadow-xl transition-all duration-150 z-40'}>
                  <a
                    href="#contact"
                    className={theme === 'dark'
                      ? 'block px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-800 rounded-t-lg'
                      : 'block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 rounded-t-lg'}
                  >
                    {t[lang].getInTouch}
                  </a>
                  <a
                    href="#become-member-section"
                    className={theme === 'dark'
                      ? 'block px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-800'
                      : 'block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100'}
                  >
                    {t[lang].becomeMember}
                  </a>
                  <a
                    href="#board-section"
                    className={theme === 'dark'
                      ? 'block px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-800 rounded-b-lg'
                      : 'block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 rounded-b-lg'}
                  >
                    {lang === 'da' ? 'Bestyrelse' : 'Board'}
                  </a>
                </div>
              </div>
            </nav>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className={`rounded-lg px-3 py-2 text-sm font-medium border transition-colors ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                aria-label="Toggle dark/light mode"
              >
                {theme === 'dark' ? t[lang].light : t[lang].dark}
              </button>
              <button
                onClick={toggleLang}
                className={`rounded-lg px-3 py-2 text-sm font-medium border transition-colors ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                aria-label="Toggle language"
                style={{ marginLeft: 4 }}
              >
                {t[lang].lang}
              </button>
              <Link
                to="/admin"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                {t[lang].adminPortal}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className={`relative ${theme === 'dark' ? 'text-white' : 'text-white'} overflow-hidden`}
        style={{
          backgroundImage: `linear-gradient(rgba(16, 52, 30, 0.7), rgba(16, 52, 30, 0.7)), url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
          minHeight: '520px',
          height: '44vh',
          maxHeight: '700px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-24 md:py-32">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            {t[lang].welcome}
          </h2>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            {lang === 'en'
              ? 'Where passion meets performance. Join our community of cricket enthusiasts and experience the thrill of the game.'
              : 'Hvor passion møder præstation. Bliv en del af vores cricketfællesskab og oplev spillets spænding.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/admin"
              target="_blank"
              rel="noopener noreferrer"
              className={theme === 'dark' ? 'bg-white text-green-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors' : 'bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors'}
            >
              {t[lang].accessAdmin}
            </Link>
            <a
              href="#become-member-section"
              className={theme === 'dark' ? 'border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-700 transition-colors' : 'border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors'}
            >
              {t[lang].getInTouch}
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className={theme === 'dark' ? 'py-16 bg-gray-900' : 'py-16 bg-white'}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={theme === 'dark' ? 'bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl p-10 border border-green-900/40' : 'bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl shadow-xl p-10 border border-green-200/60'}>
            <div className="flex flex-col md:flex-row gap-10 items-start justify-between">
              {/* About Our Club */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col items-center mb-6 md:mb-8">
                  <img
                    src={holdetImg}
                    alt="Aalborg Cricket Club Team"
                    className="w-full max-w-md rounded-xl shadow-lg mb-4 object-cover"
                    style={{ aspectRatio: '4/3' }}
                  />
                  <h3 className={`text-2xl md:text-3xl font-bold mb-2 tracking-tight text-center ${theme === 'dark' ? 'text-white' : 'text-green-900'}`}>{t[lang].aboutTitle}</h3>
                </div>
                <p className={`text-base md:text-lg mb-4 md:mb-0 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t[lang].aboutText}</p>
              </div>
              {/* Divider for large screens */}
              <div className="hidden md:block w-px bg-green-300 dark:bg-green-900 mx-2 self-stretch"></div>
              {/* Cricket History */}
              <div className="flex-1 min-w-0">
                <img
                  src={badtImg}
                  alt="Aalborg Cricket History"
                  className="w-full max-w-md rounded-xl shadow-lg mb-4 object-cover mx-auto"
                  style={{ aspectRatio: '4/3' }}
                />
                <h3 className={`text-2xl md:text-3xl font-bold mb-2 tracking-tight text-center ${theme === 'dark' ? 'text-white' : 'text-green-900'}`}>{t[lang].aboutHistoryTitle}</h3>
                <p className={`text-base md:text-lg mb-4 md:mb-0 text-center whitespace-pre-line ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t[lang].aboutHistoryText}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className={theme === 'dark' ? 'bg-green-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4' : 'bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4'}>
                <span className="text-2xl">🏏</span>
              </div>
              <h4 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : ''}`}>{t[lang].excellence}</h4>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{t[lang].excellenceDesc}</p>
            </div>
            <div className="text-center">
              <div className={theme === 'dark' ? 'bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4' : 'bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4'}>
                <span className="text-2xl">🤝</span>
              </div>
              <h4 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : ''}`}>{t[lang].community}</h4>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{t[lang].communityDesc}</p>
            </div>
            <div className="text-center">
              <div className={theme === 'dark' ? 'bg-yellow-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4' : 'bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4'}>
                <span className="text-2xl">🏆</span>
              </div>
              <h4 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : ''}`}>{t[lang].achievement}</h4>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{t[lang].achievementDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section id="news" className={theme === 'dark' ? 'py-16 bg-gray-800' : 'py-16 bg-gray-50'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className={`text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t[lang].newsTitle}</h3>
            <p className={theme === 'dark' ? 'text-gray-300 text-lg' : 'text-gray-600 text-lg'}>{t[lang].newsDesc}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {newsLoading ? (
              <div className="col-span-3 text-center text-slate-400">Loading news...</div>
            ) : newsError ? (
              <div className="col-span-3 text-center text-rose-400">{newsError}</div>
            ) : news.length === 0 ? (
              <div className="col-span-3 text-center text-slate-400">No news available.</div>
            ) : (
              news.map((item) => (
                <Link
                  to={`/news/${item.id}`}
                  key={item.id}
                  className={theme === 'dark' ? 'bg-gray-900 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer block' : 'bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer block'}
                  aria-label={`Read more about ${item.title}`}
                >
                  <h4 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.title}</h4>
                  <p className={theme === 'dark' ? 'text-gray-400 text-sm mb-3' : 'text-gray-500 text-sm mb-3'}>{item.date}</p>
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{item.summary}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Upcoming Matches Section */}
      <section
        id="matches"
        className={theme === 'dark' ? 'py-12 text-white' : 'py-12 text-gray-900'}
        style={{
          backgroundImage: theme === 'dark'
            ? `linear-gradient(rgba(15, 23, 42, 0.82), rgba(15, 23, 42, 0.82)), url(${upcomingMatchesBg})`
            : `linear-gradient(rgba(255, 255, 255, 0.86), rgba(255, 255, 255, 0.86)), url(${upcomingMatchesBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className={`text-3xl font-bold mb-3 flex items-center justify-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <span>{t[lang].upcomingMatchesTitle}</span>
            </h3>
          </div>

          {eventsLoading ? (
            <div className="text-center text-slate-400">{t[lang].upcomingMatchesLoading}</div>
          ) : eventsError ? (
            <div className="text-center text-rose-400">{eventsError}</div>
          ) : upcomingMatches.length === 0 ? (
            <div className="text-center text-slate-400">{t[lang].upcomingMatchesEmpty}</div>
          ) : (
            <div className="space-y-3 max-w-4xl mx-auto">
              {upcomingMatches.map((match) => {
                const homeTeamName = match.home_team?.name || match.extra?.homeTeam || 'Home Team';
                const awayTeamName = match.away_team?.name || match.extra?.awayTeam || 'Away Team';
                const homeLogo = match.home_team?.logo_url || match.extra?.homeLogoUrl || logoImg;
                const awayLogo = match.away_team?.logo_url || match.extra?.awayLogoUrl || logoImg;
                const matchDate = formatMatchDateParts(match.date);
                const competitionType = match.extra?.match_competition;
                const competitionDisplay = competitionType === '1st_division'
                  ? { main: '1', sub: 'st' }
                  : competitionType === '3rd_division'
                    ? { main: '3', sub: 'rd' }
                    : competitionType === 't20'
                      ? { main: 'T20', sub: null }
                      : { main: 'Match', sub: null };

                return (
                <div
                  key={match.id}
                  className={theme === 'dark'
                    ? 'rounded-lg border border-slate-700 bg-slate-900 px-5 py-4'
                    : 'rounded-lg border border-slate-200 bg-white px-5 py-4'}
                >
                  <div className="flex items-stretch gap-3">
                    <div
                      className={theme === 'dark'
                        ? 'shrink-0 mr-8 w-24 sm:w-28 rounded-md border border-indigo-300/60 bg-indigo-500/20 px-3 py-1.5 text-center text-white shadow-sm'
                        : 'shrink-0 mr-8 w-24 sm:w-28 rounded-md border border-indigo-300 bg-indigo-100 px-3 py-1.5 text-center text-indigo-950 shadow-sm'}
                    >
                      <div className="text-4xl sm:text-5xl font-semibold leading-none tabular-nums">{matchDate.day}</div>
                      <div className="mt-0.5 text-sm sm:text-base uppercase tracking-wide leading-none">{matchDate.month}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="space-y-2 min-w-0">
                        <h4 className={`text-xl font-semibold flex items-center gap-2 min-w-0 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <span className="inline-flex items-center gap-2 min-w-0">
                          <img
                            src={homeLogo}
                            alt={`${homeTeamName} logo`}
                            className="h-11 w-11 rounded-full border border-slate-300/40 bg-white object-cover"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = logoImg;
                            }}
                          />
                          <span className="truncate">{homeTeamName}</span>
                        </span>
                        <span className="text-slate-400">vs.</span>
                        <span className="inline-flex items-center gap-2 min-w-0">
                          <img
                            src={awayLogo}
                            alt={`${awayTeamName} logo`}
                            className="h-11 w-11 rounded-full border border-slate-300/40 bg-white object-cover"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = logoImg;
                            }}
                          />
                          <span className="truncate">{awayTeamName}</span>
                        </span>
                        </h4>
                        {match.location ? (
                          <div className={theme === 'dark' ? 'text-sm font-normal text-slate-300' : 'text-sm font-normal text-slate-600'}>
                            {t[lang].locationLabel}: {match.location}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="shrink-0 flex items-start">
                      <div
                        className={theme === 'dark'
                          ? 'inline-flex min-w-20 items-center justify-center rounded-md border border-amber-400/40 bg-amber-500/20 px-2 py-1 text-amber-200'
                          : 'inline-flex min-w-20 items-center justify-center rounded-md border border-amber-300 bg-amber-100 px-2 py-1 text-amber-800'}
                      >
                        <span className="flex flex-col items-center leading-none">
                          <span className="text-4xl font-normal">{competitionDisplay.main}</span>
                          {competitionDisplay.sub ? <span className="text-sm font-normal mt-0.5">{competitionDisplay.sub}</span> : null}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* School Cricket Section */}
      <section className={theme === 'dark' ? 'py-16 bg-gray-800' : 'py-16 bg-gray-50'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className={`text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t[lang].schoolCricketTitle}
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {schoolCricketLinks.map((item) => (
              <a
                key={item.title}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={theme === 'dark'
                  ? 'block bg-gray-900 rounded-xl overflow-hidden border border-slate-700 hover:border-green-500 transition-colors'
                  : 'block bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-green-500 transition-colors'}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-56 object-cover"
                />
                <div className="p-5">
                  <h4 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {item.title}
                  </h4>
                  <p className={theme === 'dark' ? 'text-green-300' : 'text-green-700'}>
                    {t[lang].schoolCricketVisit}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className={theme === 'dark' ? 'py-16 bg-gray-900' : 'py-16 bg-white'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className={`text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t[lang].eventsTitle}</h3>
            <p className={theme === 'dark' ? 'text-gray-300 text-lg' : 'text-gray-600 text-lg'}>{t[lang].eventsDesc}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {eventsLoading ? (
              <div className="col-span-3 text-center text-slate-400">Loading events...</div>
            ) : eventsError ? (
              <div className="col-span-3 text-center text-rose-400">{eventsError}</div>
            ) : events.length === 0 ? (
              <div className="col-span-3 text-center text-slate-400">No upcoming events.</div>
            ) : (
              <>
                <div className="col-span-3 flex items-center justify-center">
                  {/* Left arrow */}
                  <button
                    onClick={handlePrev}
                    disabled={!canGoPrev}
                    className={`group p-3 mr-4 rounded-full border-2 shadow-lg bg-white dark:bg-gray-800 border-green-400 dark:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200 flex items-center justify-center ${canGoPrev ? 'hover:bg-green-100 dark:hover:bg-gray-700' : 'opacity-40 cursor-not-allowed'}`}
                    aria-label="Previous events"
                    style={{ alignSelf: 'center' }}
                  >
                    {/* Left chevron SVG */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7 text-green-600 dark:text-green-300 group-hover:text-green-800 dark:group-hover:text-green-200">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  {/* Events cards grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1">
                    {visibleEvents.map((event) => {
                      // Icon selection based on event_type
                      let icon = '📅';
                      switch ((event.event_type || '').toLowerCase()) {
                        case 'match':
                          icon = '🏏';
                          break;
                        case 'training':
                          icon = '💪';
                          break;
                        case 'school':
                          icon = '🎓';
                          break;
                        case 'social':
                          icon = '🎉';
                          break;
                        case 'other':
                          icon = '📌';
                          break;
                        default:
                          icon = '📅';
                      }
                      return (
                        <div key={event.id} className={theme === 'dark' ? 'bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700' : 'bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 border border-gray-200'}>
                          <div className="flex items-center mb-2">
                            <span className="text-3xl mr-3">{icon}</span>
                            <h4 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{event.title}</h4>
                          </div>
                          <div className={theme === 'dark' ? 'space-y-1 text-gray-300' : 'space-y-1 text-gray-600'}>
                            <p><span className="font-medium">{t[lang].dateLabel}:</span> {event.date}</p>
                            <p><span className="font-medium">{t[lang].timeLabel}:</span> {event.time}</p>
                            <p><span className="font-medium">{t[lang].locationLabel}:</span> {event.location}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Right arrow */}
                  <button
                    onClick={handleNext}
                    disabled={!canGoNext}
                    className={`group p-3 ml-4 rounded-full border-2 shadow-lg bg-white dark:bg-gray-800 border-green-400 dark:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200 flex items-center justify-center ${canGoNext ? 'hover:bg-green-100 dark:hover:bg-gray-700' : 'opacity-40 cursor-not-allowed'}`}
                    aria-label="Next events"
                    style={{ alignSelf: 'center' }}
                  >
                    {/* Right chevron SVG */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7 text-green-600 dark:text-green-300 group-hover:text-green-800 dark:group-hover:text-green-200">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </div>
                <div className="col-span-3 text-center mt-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {eventStartIdx + 1}-{Math.min(eventStartIdx + 3, sortedEvents.length)} of {sortedEvents.length} events
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section
        id="become-member-section"
        className={theme === 'dark' ? 'py-16' : 'py-16'}
          style={{
            backgroundImage: theme === 'dark'
              ? `linear-gradient(rgba(15, 23, 42, 0.82), rgba(15, 23, 42, 0.82)), url(${bowlingBg})`
              : `linear-gradient(rgba(255, 255, 255, 0.86), rgba(255, 255, 255, 0.82)), url(${bowlingBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={theme === 'dark' ? 'rounded-2xl border border-slate-700 bg-slate-900/80 p-8 shadow-2xl' : 'rounded-2xl border border-slate-200 bg-white p-8 shadow-xl'}>
              <h3 className={`text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t[lang].becomeMember}</h3>
              <p className={theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}>
                {lang === 'en'
                  ? 'Join Aalborg Cricket Club and become part of our cricket community. Create your account to get started.'
                  : 'Bliv en del af Aalborg Cricket Klub og vores cricketfællesskab. Opret din konto for at komme i gang.'}
              </p>
              
              {/* Membership Benefit */}
              <div className="mt-6 flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  <img
                    src={newMemberImg}
                    alt="Membership"
                    className="w-48 h-48 object-cover rounded-lg shadow-md"
                  />
                </div>
                <div className={`flex-1 p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-800/60' : 'bg-slate-50'}`}>
                  <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t[lang].membershipBenefit}
                  </p>
                </div>
              </div>
              
              {/* Membership Fees */}
              <div className="mt-6 flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  <img
                    src={feeImg}
                    alt="Membership Fees"
                    className="w-48 h-48 object-cover rounded-lg shadow-md"
                  />
                </div>
                <div className={`flex-1 p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-800/60' : 'bg-slate-50'}`}>
                  <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t[lang].membershipFees}
                  </p>
                </div>
              </div>
              
              {/* Active Member Info */}
              <div className="mt-6 flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  <img
                    src={activeMemberImg}
                    alt="Active Member"
                    className="w-48 h-48 object-cover rounded-lg shadow-md"
                  />
                </div>
                <div className={`flex-1 p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-800/60' : 'bg-slate-50'}`}>
                  <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t[lang].activeMemberInfo}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setShowContactModal(true);
                  setContactForm({ name: '', phone: '', message: '' });
                  setContactFormMessage(null);
                }}
                className="mt-8 w-full rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-400"
              >
                {t[lang].contactFormTitle}
              </button>
            </div>
          </div>

        </section>


        {/* Board/Bestyrelse Section */}
        <section id="board-section" className={theme === 'dark' ? 'py-16 bg-gray-900' : 'py-16 bg-gray-50'}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={theme === 'dark' ? 'rounded-2xl border border-slate-700 bg-slate-900/80 p-8 shadow-2xl' : 'rounded-2xl border border-slate-200 bg-white p-8 shadow-xl'}>
              <h3 className={`text-3xl font-bold mb-8 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t[lang].boardTitle}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    name: 'Thomas Lorenzen',
                    role: lang === 'da' ? 'Formand' : 'Chairman',
                    email: 'thomas@aalborg-cricket.dk',
                    phone: '+45 60 50 78 55',
                    image: new URL('./images/board/profile.png', import.meta.url).href,
                  },
                  {
                    name: 'Jan Anker Nielsen',
                    role: lang === 'da' ? 'Kasserer' : 'Treasurer',
                    email: 'jananker@aalborg-cricket.dk',
                    phone: '+45 29 10 37 41',
                    image: new URL('./images/board/profile.png', import.meta.url).href,
                  },
                  {
                    name: 'Qendrim Nika',
                    role: lang === 'da' ? 'Næstformand' : 'Vice Chairman',
                    email: 'qendrim@aalborg-cricket.dk',
                    phone: '+45 22 86 20 48',
                    image: new URL('./images/board/qn.png', import.meta.url).href,
                  },
                  {
                    name: 'Manish Bisht',
                    role: lang === 'da' ? 'Bestyrelsesmedlem' : 'Board Member',
                    image: new URL('./images/board/Manish.jpeg', import.meta.url).href,
                  },
                  {
                    name: 'Ravi Ndra',
                    role: lang === 'da' ? 'Revisor' : 'Auditor',
                    image: new URL('./images/board/ravi.png', import.meta.url).href,
                  },
                ].map((member, idx) => (
                  <div key={idx} className={theme === 'dark' ? 'flex flex-col items-center bg-slate-800/60 rounded-xl p-6 shadow' : 'flex flex-col items-center bg-slate-50 rounded-xl p-6 shadow'}>
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-32 h-32 object-cover rounded-full mb-4 border-4 border-indigo-400 shadow-md"
                      onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/128?text=Photo'; }}
                    />
                    <div className="text-center">
                      <div className="text-lg font-semibold mb-1">{member.name}</div>
                      <div className="text-indigo-500 font-medium mb-2">{member.role}</div>
                      <div className="text-sm mb-1">
                        <a href={`mailto:${member.email}`} className="text-blue-500 hover:underline">{member.email}</a>
                      </div>
                      <div className="text-sm text-slate-400">{member.phone}</div>
                    </div>
                  </div>
                ))}
              </div>
              <p className={theme === 'dark' ? 'text-slate-300 mt-8 text-center' : 'text-slate-600 mt-8 text-center'}>
                {t[lang].boardDescription}
              </p>
              <div className={theme === 'dark' ? 'mt-8 bg-slate-800/60 rounded-xl p-6' : 'mt-8 bg-slate-50 rounded-xl p-6'}>
                <p className="text-base text-slate-700 dark:text-white text-center">
                  {t[lang].statutesText}
                </p>
                <div className="flex justify-center mt-4">
                  <a
                    href="https://www-static.aalborg-cricket.dk/wp-content/uploads/2019/04/Vedt%C3%A6gter-for-Aalborg-Cricket-Club-.pdf"
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                  >
                    {lang === 'da' ? 'Download vedtægter (PDF)' : 'Download Statutes (PDF)'}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowContactModal(false)}>
          <div className={`rounded-lg p-6 max-w-md w-full ${theme === 'dark' ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200'}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h4 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t[lang].contactFormTitle}
              </h4>
              <button
                onClick={() => setShowContactModal(false)}
                className={`text-2xl leading-none transition ${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleContactFormSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  {t[lang].contactFormName}
                </label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                    : 'bg-white border-slate-300 text-gray-900 placeholder-slate-500'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  placeholder={t[lang].contactFormName}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  {t[lang].contactFormPhone}
                </label>
                <input
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                    : 'bg-white border-slate-300 text-gray-900 placeholder-slate-500'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  placeholder={t[lang].contactFormPhone}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  {t[lang].contactFormMessage}
                </label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  rows="4"
                  className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                    : 'bg-white border-slate-300 text-gray-900 placeholder-slate-500'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none`}
                  placeholder={t[lang].contactFormMessage}
                />
              </div>
              
              <button
                type="submit"
                disabled={contactFormSubmitting}
                className="w-full rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {contactFormSubmitting ? 'Sending...' : t[lang].contactFormSubmit}
              </button>
              
              {contactFormMessage && (
                <div className={`p-3 rounded-lg text-sm ${
                  contactFormMessage.type === 'success'
                    ? theme === 'dark' ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'
                    : theme === 'dark' ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800'
                }`}>
                  {contactFormMessage.text}
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Activity Carousel */}
      <ActivityCarousel />

      {/* Sponsors Section */}
      <SponsorsSection theme={theme} />

      {/* Contact Section */}
      <ContactSection lang={lang} theme={theme} />

      {/* Footer */}
      <footer className={theme === 'dark' ? 'bg-gray-900 text-white py-8' : 'bg-gray-800 text-white py-8'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>{t[lang].copyright}</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
