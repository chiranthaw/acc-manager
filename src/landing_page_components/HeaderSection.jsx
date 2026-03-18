import { Link } from 'react-router-dom';
import logoImg from '../images/acc-logo-new.png';

const HeaderSection = ({ theme, lang, t, onToggleTheme, onToggleLang, onClubNameClick }) => {
  return (
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
            <Link to="/#hero-section" onClick={onClubNameClick} className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} hover:text-green-500 transition`} style={{ textDecoration: 'none' }}>
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
              onClick={onToggleTheme}
              className={`rounded-lg px-3 py-2 text-sm font-medium border transition-colors ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'}`}
              aria-label="Toggle dark/light mode"
            >
              {theme === 'dark' ? t[lang].light : t[lang].dark}
            </button>
            <button
              onClick={onToggleLang}
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
  );
};

export default HeaderSection;
