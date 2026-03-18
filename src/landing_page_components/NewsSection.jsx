import { Link } from 'react-router-dom';

const NewsSection = ({ theme, title, description, news, newsLoading, newsError }) => {
  return (
    <section id="news" className={theme === 'dark' ? 'py-16 bg-gray-800' : 'py-16 bg-gray-50'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className={`text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
          <p className={theme === 'dark' ? 'text-gray-300 text-lg' : 'text-gray-600 text-lg'}>{description}</p>
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
  );
};

export default NewsSection;
