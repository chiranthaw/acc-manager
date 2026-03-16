import { FaFacebook, FaInstagram } from 'react-icons/fa';
import translations from './lang';

const ContactSection = ({ lang, theme }) => {
  const t = translations;
  const phoneText = t[lang].phone;
  const phoneHref = `tel:${phoneText.replace(/[^\d+]/g, '')}`;
  return (
    <section id="contact" className={theme === 'dark' ? 'py-16 bg-gray-950 text-white' : 'py-16 bg-gray-900 text-white'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4">{t[lang].contactTitle}</h3>
          <p className="text-lg text-gray-300">{t[lang].contactDesc}</p>
        </div>
        <div className="grid md:grid-cols-1 gap-8">
          <div>
            <h4 className="text-xl font-semibold mb-4">{t[lang].contactInfo}</h4>
            <div className="mb-6">
              <div className="grid grid-cols-4 gap-4 w-full">
                {t[lang].addressBoxes.map((box, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg bg-gray-800/80 border border-gray-700 p-4 text-white min-h-[80px] flex flex-col items-start justify-center"
                  >
                    <div className="flex items-center gap-2 font-bold text-base mb-1">
                      <span role="img" aria-label={box.heading}>{box.icon}</span>
                      {box.heading}
                    </div>
                    {box.link ? (
                      <a
                        href={box.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-green-300 hover:text-green-400 text-sm text-left"
                      >
                        {box.address}
                      </a>
                    ) : (
                      <div className="text-sm text-left">{box.address}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-center md:space-x-8 mb-4 mt-4 text-lg">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4 justify-center">
                <a href={phoneHref} className="font-medium underline-offset-2 hover:underline">
                  {phoneText}
                </a>
                <span className="hidden md:inline-block">|</span>
                <span className="font-medium">{t[lang].email}</span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:space-x-2 md:ml-8 mt-2 md:mt-0 justify-center">
                <span className="font-semibold mr-2">{t[lang].followUs}</span>
                <a href="https://www.facebook.com/aalborgcricketclub/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors mr-2 text-2xl" aria-label="Facebook"><FaFacebook /></a>
                <a href="https://www.instagram.com/explore/tags/aalborgcricketclub/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors mr-2 text-2xl" aria-label="Instagram"><FaInstagram /></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
