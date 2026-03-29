const BoardSection = ({ theme, lang, t }) => {
  const boardMembers = [
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
      name: 'Chirantha Wanasinghe',
      role: lang === 'da' ? 'Bestyrelsesmedlem' : 'Board Member',
      email: 'chirantha@aalborg-cricket.dk',
      phone: '+45 24 49 00 56',
      image: new URL('./images/board/chirantha.jfif', import.meta.url).href,
    },
    {
      name: 'Manish Bisht',
      role: lang === 'da' ? 'Bestyrelsesmedlem' : 'Board Member',
      email: 'manish@aalborg-cricket.dk',
      image: new URL('./images/board/Manish.jpeg', import.meta.url).href,
    },
    {
      name: 'Ravi Ndra',
      role: lang === 'da' ? 'Revisor' : 'Auditor',
      email: 'ravi@aalborg-cricket.dk',
      image: new URL('./images/board/ravi.png', import.meta.url).href,
    },
  ];

  return (
    <section id="board-section" className={theme === 'dark' ? 'py-16 bg-gray-900' : 'py-16 bg-gray-50'}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={theme === 'dark' ? 'rounded-2xl border border-slate-700 bg-slate-900/80 p-8 shadow-2xl' : 'rounded-2xl border border-slate-200 bg-white p-8 shadow-xl'}>
          <h3 className={`text-3xl font-bold mb-8 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t[lang].boardTitle}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {boardMembers.map((member, idx) => (
              <div key={idx} className={theme === 'dark' ? 'flex flex-col items-center bg-slate-800/60 rounded-xl p-6 shadow' : 'flex flex-col items-center bg-slate-50 rounded-xl p-6 shadow'}>
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 object-cover rounded-full mb-4 border-4 border-indigo-400 shadow-md"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/128?text=Photo';
                  }}
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
  );
};

export default BoardSection;
