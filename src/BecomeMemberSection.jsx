import bowlingBg from './images/bowling.png';
import newMemberImg from './images/newmember.jpg';
import feeImg from './images/fee.jpg';
import activeMemberImg from './images/activemember.jpg';

const BecomeMemberSection = ({ theme, lang, t, onOpenContact }) => {
  return (
    <section
      id="become-member-section"
      className="py-16"
      style={{
        backgroundImage: theme === 'dark'
          ? `linear-gradient(rgba(15, 23, 42, 0.82), rgba(15, 23, 42, 0.82)), url(${bowlingBg})`
          : `linear-gradient(rgba(255, 255, 255, 0.86), rgba(255, 255, 255, 0.82)), url(${bowlingBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={theme === 'dark' ? 'rounded-2xl border border-slate-700 bg-slate-900/80 p-8 shadow-2xl' : 'rounded-2xl border border-slate-200 bg-white p-8 shadow-xl'}>
          <h3 className={`text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t[lang].becomeMember}</h3>
          <p className={theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}>
            {lang === 'en'
              ? 'Join Aalborg Cricket Club and become part of our cricket community. Create your account to get started.'
              : 'Bliv en del af Aalborg Cricket Klub og vores cricketfællesskab. Opret din konto for at komme i gang.'}
          </p>

          <div className="mt-6 flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <img
                src={newMemberImg}
                alt="Membership"
                className="w-48 h-48 object-cover rounded-lg shadow-md"
              />
            </div>
            <div className={`flex-1 p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-800/60' : 'bg-slate-50'}`}>
              <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t[lang].membershipBenefit}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <img
                src={feeImg}
                alt="Membership Fees"
                className="w-48 h-48 object-cover rounded-lg shadow-md"
              />
            </div>
            <div className={`flex-1 p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-800/60' : 'bg-slate-50'}`}>
              <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t[lang].membershipFees}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <img
                src={activeMemberImg}
                alt="Active Member"
                className="w-48 h-48 object-cover rounded-lg shadow-md"
              />
            </div>
            <div className={`flex-1 p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-800/60' : 'bg-slate-50'}`}>
              <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t[lang].activeMemberInfo}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenContact}
            className="mt-8 w-full rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-400"
          >
            {t[lang].contactFormTitle}
          </button>
        </div>
      </div>
    </section>
  );
};

export default BecomeMemberSection;
