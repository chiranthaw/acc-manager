const SchoolCricketSection = ({ theme, title, visitText, links }) => {
  return (
    <section className={theme === 'dark' ? 'py-16 bg-gray-800' : 'py-16 bg-gray-50'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className={`text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h3>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {links.map((item) => (
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
                  {visitText}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SchoolCricketSection;
