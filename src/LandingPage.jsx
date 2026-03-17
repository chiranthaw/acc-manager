import badtImg from './images/badt.jpg';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logoImg from './images/acc-logo-new.png';
import heroBg from './images/acc1.jpg';
import upcomingMatchesBg from './images/acc-1.png';
import holdetImg from './images/holdet.jpg';
import schoolCricketImg1 from './images/skolecricket.jpg';
import schoolCricketImg2 from './images/foreningsfestival.jpg';
import translations from './lang';
import ContactSection from './ContactSection';
import SponsorsSection from './SponsorsSection';
import ActivityCarousel from './ActivityCarousel';
import NewsSection from './NewsSection';
import SchoolCricketSection from './SchoolCricketSection';
import UpcomingMatchesSection from './UpcomingMatchesSection';
import UpcomingEventsSection from './UpcomingEventsSection';
import BoardSection from './BoardSection';
import ContactModal from './ContactModal';
import BecomeMemberSection from './BecomeMemberSection';
import { getSupabaseClient } from './lib/supabase';

const LandingPage = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark';
  });

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

  useEffect(() => {
    if (window.location.hash === '#news') {
      const el = document.getElementById('news');
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
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

      <NewsSection
        theme={theme}
        title={t[lang].newsTitle}
        description={t[lang].newsDesc}
        news={news}
        newsLoading={newsLoading}
        newsError={newsError}
      />

      <UpcomingMatchesSection
        theme={theme}
        backgroundImage={upcomingMatchesBg}
        title={t[lang].upcomingMatchesTitle}
        loadingText={t[lang].upcomingMatchesLoading}
        emptyText={t[lang].upcomingMatchesEmpty}
        locationLabel={t[lang].locationLabel}
        eventsLoading={eventsLoading}
        eventsError={eventsError}
        matches={upcomingMatches}
        fallbackLogo={logoImg}
        formatMatchDateParts={formatMatchDateParts}
      />

      <SchoolCricketSection
        theme={theme}
        title={t[lang].schoolCricketTitle}
        visitText={t[lang].schoolCricketVisit}
        links={schoolCricketLinks}
      />

      <UpcomingEventsSection
        theme={theme}
        title={t[lang].eventsTitle}
        description={t[lang].eventsDesc}
        dateLabel={t[lang].dateLabel}
        timeLabel={t[lang].timeLabel}
        locationLabel={t[lang].locationLabel}
        events={events}
        eventsLoading={eventsLoading}
        eventsError={eventsError}
        visibleEvents={visibleEvents}
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
        onPrev={handlePrev}
        onNext={handleNext}
        eventStartIdx={eventStartIdx}
        totalEvents={sortedEvents.length}
      />

      <BecomeMemberSection
        theme={theme}
        lang={lang}
        t={t}
        onOpenContact={() => {
          setShowContactModal(true);
          setContactForm({ name: '', phone: '', message: '' });
          setContactFormMessage(null);
        }}
      />
      
      {/* Board Section */}
      <BoardSection theme={theme} lang={lang} t={t} />

      {/* Contact Us Modal */}
      <ContactModal
        show={showContactModal}
        theme={theme}
        t={t}
        lang={lang}
        contactForm={contactForm}
        setContactForm={setContactForm}
        contactFormSubmitting={contactFormSubmitting}
        contactFormMessage={contactFormMessage}
        onClose={() => setShowContactModal(false)}
        onSubmit={handleContactFormSubmit}
      />

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
