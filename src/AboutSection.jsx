import badtImg from './images/badt.jpg';
import holdetImg from './images/holdet.jpg';

const AboutSection = ({ theme, t, lang }) => {
  return (
    <section id="about" className={theme === 'dark' ? 'py-16 bg-gray-900' : 'py-16 bg-white'}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={theme === 'dark' ? 'bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl p-10 border border-green-900/40' : 'bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl shadow-xl p-10 border border-green-200/60'}>
          <div className="flex flex-col md:flex-row gap-10 items-start justify-between">
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

            <div className="hidden md:block w-px bg-green-300 dark:bg-green-900 mx-2 self-stretch"></div>

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
  );
};

export default AboutSection;
