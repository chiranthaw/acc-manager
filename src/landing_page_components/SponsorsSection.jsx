// src/SponsorsSection.jsx
import dcfLogo from '../images/dcf-logo.webp';
import skalborgLogo from '../images/skalborg.png';
import difLogoLight from '../images/dif-logo-light.png';
import difLogoDark from '../images/dif-logo-dark.png';
import sifaLogo from '../images/sifa-logo.png';
import aalCarnivalLogo from '../images/aal-canival.png';

const sponsors = [
  {
    name: 'Dansk Cricket Forbund',
    logo: dcfLogo,
    url: 'https://cricket.dk/'
  },
  {
    name: 'Skalborg Sportsklub',
    logo: skalborgLogo,
    url: 'https://skalborgsk.dk/default.aspx'
  },
  {
    name: 'Danmarks Idrætsforbund',
    url: 'https://www.dif.dk/'
  },
  {
    name: 'SIFA',
    logo: sifaLogo,
    url: 'https://sifa.dk/'
  },
  {
    name: 'Aalborg Carnival',
    logo: aalCarnivalLogo,
    url: 'https://aalborgkarneval.dk/'
  }
];

const SponsorsSection = ({ theme }) => (
  <section id="sponsors" className={theme === 'dark' ? 'py-16 bg-gray-900 text-white' : 'py-16 bg-white text-gray-900'}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h3 className="text-3xl font-bold mb-4">Our Sponsors</h3>
        <p className="text-lg text-gray-400">We thank our generous sponsors for their support!</p>
      </div>
      <div className="flex flex-wrap justify-center items-center gap-8">
        {sponsors.map((s, idx) => {
          const isDIF = s.name === 'Danmarks Idrætsforbund';
          const logoSrc = isDIF ? (theme === 'dark' ? difLogoLight : difLogoDark) : s.logo;
          return (
            <a key={idx} href={s.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center group">
              <div className="mb-2" style={{height: '64px', width: 'auto', minWidth: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <img src={logoSrc} alt={s.name} className="h-16 w-auto rounded group-hover:scale-105 transition-transform" style={{maxHeight: '64px', maxWidth: '120px'}} />
              </div>
              <span className="text-base font-medium mt-1">{s.name}</span>
            </a>
          );
        })}
      </div>
    </div>
  </section>
);

export default SponsorsSection;
