import badtImg from './images/badt.jpg';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logoImg from './images/acc-logo-new.png';
import heroBg from './images/acc1.jpg';
import holdetImg from './images/holdet.jpg';
import translations from './lang';
import ContactSection from './ContactSection';
import SponsorsSection from './SponsorsSection';
import ActivityCarousel from './ActivityCarousel';

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

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'da' : 'en'));
  };

  // Use imported translations
  const t = translations;
  const news = [
    {
      id: 1,
      title: "Season Opener Victory",
      date: "March 1, 2026",
      summary: "Our first team kicked off the season with a thrilling win against rivals."
    },
    {
      id: 2,
      title: "New Training Facilities",
      date: "February 15, 2026",
      summary: "Exciting updates on our upgraded training grounds and equipment."
    },
    {
      id: 3,
      title: "Junior Program Expansion",
      date: "January 20, 2026",
      summary: "We're expanding our junior cricket program to welcome more young players."
    }
  ];

  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState("");
  // Carousel state for events
  const [eventStartIdx, setEventStartIdx] = useState(0);

  // Helper to show only 3 most recent events (by date desc)
  const sortedEvents = [...events].sort((a, b) => new Date(b.date) - new Date(a.date));
  const visibleEvents = sortedEvents.slice(eventStartIdx, eventStartIdx + 3);

  const canGoPrev = eventStartIdx > 0;
  const canGoNext = eventStartIdx + 3 < sortedEvents.length;
  const handlePrev = () => {
    if (canGoPrev) setEventStartIdx(eventStartIdx - 1);
  };
  const handleNext = () => {
    if (canGoNext) setEventStartIdx(eventStartIdx + 1);
  };

  useEffect(() => {
    async function fetchEvents() {
      setEventsLoading(true);
      setEventsError("");
      try {
        const { getSupabaseClient } = await import("./lib/supabase");
        const supabase = getSupabaseClient();
        const today = new Date();
        const { data, error } = await supabase
          .from("events")
          .select("id, title, date, time, location, is_active, event_type")
          .order("date", { ascending: true });
        if (error) throw error;
        console.log("Fetched events from DB:", data);
        // Show all events where is_active is true
        const activeEvents = (data || []).filter(ev => ev.is_active);
        setEvents(activeEvents);
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
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t[lang].clubName.toUpperCase()}</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#about" className={theme === 'dark' ? 'text-gray-300 hover:text-green-300 transition-colors' : 'text-gray-700 hover:text-green-600 transition-colors'}>{t[lang].about}</a>
              <a href="#news" className={theme === 'dark' ? 'text-gray-300 hover:text-green-300 transition-colors' : 'text-gray-700 hover:text-green-600 transition-colors'}>{t[lang].news}</a>
              <a href="#events" className={theme === 'dark' ? 'text-gray-300 hover:text-green-300 transition-colors' : 'text-gray-700 hover:text-green-600 transition-colors'}>{t[lang].events}</a>
              <a href="#sponsors" className={theme === 'dark' ? 'text-gray-300 hover:text-green-300 transition-colors' : 'text-gray-700 hover:text-green-600 transition-colors'}>Sponsors</a>
              <a href="#contact" className={theme === 'dark' ? 'text-gray-300 hover:text-green-300 transition-colors' : 'text-gray-700 hover:text-green-600 transition-colors'}>{t[lang].contact}</a>
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
              className={theme === 'dark' ? 'bg-white text-green-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors' : 'bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors'}
            >
              {t[lang].accessAdmin}
            </Link>
            <a
              href="#contact"
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
            {news.map((item) => (
              <div key={item.id} className={theme === 'dark' ? 'bg-gray-900 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow' : 'bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow'}>
                <h4 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.title}</h4>
                <p className={theme === 'dark' ? 'text-gray-400 text-sm mb-3' : 'text-gray-500 text-sm mb-3'}>{item.date}</p>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{item.summary}</p>
              </div>
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
                            <p><span className="font-medium">Date:</span> {event.date}</p>
                            <p><span className="font-medium">Time:</span> {event.time}</p>
                            <p><span className="font-medium">Location:</span> {event.location}</p>
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

// About text for Aalborg Cricket Club (Danish and English)
// Danish:
// Siden 2013 har Aalborg Cricket Club befundet sig i det nye arealer på Dyrskuepladsen. Deltagelsen i 2. Division Nord har været et stor succes og med mange cricket sejr til klubben, hvor man blandt andet stillede med 2 hold. I 2015 fik klubben mulighed for at prøve kræfter med hold i 1. Division og den mulighed valgte klubben at tage. En af grunde var, at der skulle være lidt mere udfordring for de aktive spiller fra Aalborg.
// Man valgte ligeledes i 2015 at stille med kun 1 aktivt hold under DCF. Truppen og bestyrelsen består mest af nye spiller samt spiller fra Chang tiden. Klubben har haft fornøjelsen af tidligere spiller, som har hjulpet i tilfælde af klubben ikke kunne stille hold. Aalborg er 2. mest vindende by i Danmark gennem tiderne. 17 Senior DM guld er det blevet til. Aab 16 mesterskaber & Chang 1.
// English:
// Since 2013, Aalborg Cricket Club has been located at the new grounds at Dyrskuepladsen. Participation in the 2nd Division North has been a great success, with many cricket victories for the club, including fielding two teams. In 2015, the club had the opportunity to compete in the 1st Division, a challenge they chose to accept. One reason was to provide more challenge for the active players from Aalborg.
// In 2015, the club also decided to field only one active team under DCF. The squad and board mainly consist of new players as well as players from the Chang era. The club has enjoyed the help of former players, who have stepped in when the club could not field a team. Aalborg is the second most winning city in Denmark throughout history, with 17 Senior Danish Championships: Aab with 16 titles & Chang with 1.