import { Link } from 'react-router-dom';
import heroBg from '../images/acc1.jpg';

const HeroSection = ({ theme, lang, t }) => {
  return (
    <section
      id="hero-section"
      className="relative text-white overflow-hidden"
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
  );
};

export default HeroSection;
