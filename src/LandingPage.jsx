
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logoImg from './images/acc-logo-new.png';
import translations from './lang';
import ContactSection from './ContactSection';

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

  const events = [
    {
      id: 1,
      title: "Annual General Meeting",
      date: "March 15, 2026",
      time: "7:00 PM",
      location: "Club Pavilion"
    },
    {
      id: 2,
      title: "Charity Match",
      date: "April 5, 2026",
      time: "2:00 PM",
      location: "Main Ground"
    },
    {
      id: 3,
      title: "Youth Tournament",
      date: "April 20-22, 2026",
      time: "All Day",
      location: "Club Grounds"
    }
  ];

  return (
    <div className={
      `min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 text-white' : 'bg-gradient-to-br from-green-50 to-blue-50 text-gray-900'}`
    }>
      {/* Header */}
      <header className={`shadow-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
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
      <section className={`bg-gradient-to-r ${theme === 'dark' ? 'from-green-900 to-blue-900 text-white' : 'from-green-600 to-blue-600 text-white'} py-20`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className={`text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t[lang].aboutTitle}</h3>
            <p className={`text-lg max-w-3xl mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t[lang].aboutText}</p>
          </div>
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
            {events.map((event) => (
              <div key={event.id} className={theme === 'dark' ? 'bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700' : 'bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 border border-gray-200'}>
                <h4 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{event.title}</h4>
                <div className={theme === 'dark' ? 'space-y-1 text-gray-300' : 'space-y-1 text-gray-600'}>
                  <p><span className="font-medium">Date:</span> {event.date}</p>
                  <p><span className="font-medium">Time:</span> {event.time}</p>
                  <p><span className="font-medium">Location:</span> {event.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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