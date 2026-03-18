import { useEffect, useState } from 'react';
import upcomingMatchesBg from './images/acc-1.png';
import schoolCricketImg1 from './images/skolecricket.jpg';
import schoolCricketImg2 from './images/foreningsfestival.jpg';
import translations from './lang';
import ContactSection from './ContactSection';
import SponsorsSection from './SponsorsSection';
import ActivityCarousel from './landing_page_components/ActivityCarousel';
import HeaderSection from './HeaderSection';
import HeroSection from './HeroSection';
import AboutSection from './landing_page_components/AboutSection';
import NewsSection from './NewsSection';
import SchoolCricketSection from './SchoolCricketSection';
import UpcomingMatchesSection from './landing_page_components/UpcomingMatchesSection';
import UpcomingEventsSection from './UpcomingEventsSection';
import BoardSection from './BoardSection';
import ContactModal from './ContactModal';
import BecomeMemberSection from './BecomeMemberSection';
import { getSupabaseClient } from './lib/supabase';
import logoImg from './images/acc-logo-new.png';

const LandingPage = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark';
  });

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

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'da' : 'en'));
  };

  const handleClubNameClick = (e) => {
    if (window.location.pathname === '/') {
      e.preventDefault();
      const heroSection = document.getElementById('hero-section');
      if (heroSection) {
        heroSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const t = translations;
  const schoolCricketLinks = [
    {
      title: t[lang].schoolCricketCard1Title,
      image: schoolCricketImg1,
      url: 'https://spillercricket.dk/',
    },
    {
      title: t[lang].schoolCricketCard2Title,
      image: schoolCricketImg2,
      url: 'https://skoleidraet.dk/',
    },
  ];
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState("");
  
  useEffect(() => {
    async function fetchNews() {
      setNewsLoading(true);
      setNewsError("");
      try {
        const { getSupabaseClient } = await import("./lib/supabase");
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from("news")
          .select("id, title, summary, content, date, is_active, image_url")
          .eq("is_active", true)
          .order("date", { ascending: false });
        if (error) throw error;
        setNews(data || []);
      } catch (err) {
        setNewsError(err.message || "Could not load news.");
      } finally {
        setNewsLoading(false);
      }
    }
    fetchNews();
  }, []);

  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState("");
  // Carousel state for events
  const [eventStartIdx, setEventStartIdx] = useState(0);
  // Contact form state
  const [contactForm, setContactForm] = useState({ name: '', phone: '', message: '' });
  const [contactFormSubmitting, setContactFormSubmitting] = useState(false);
  const [contactFormMessage, setContactFormMessage] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);

  // Helper to show only non-match events (by date desc)
  const sortedEvents = [...events]
    .filter((event) => (event.event_type || '').toLowerCase() !== 'match')
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const visibleEvents = sortedEvents.slice(eventStartIdx, eventStartIdx + 3);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const upcomingMatches = [...events]
    .filter((event) => {
      if ((event.event_type || '').toLowerCase() !== 'match' || !event.date) {
        return false;
      }
      const eventDate = new Date(`${event.date}T00:00:00`);
      return !Number.isNaN(eventDate.getTime()) && eventDate >= todayStart;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const formatMatchDateParts = (dateValue) => {
    if (!dateValue || typeof dateValue !== 'string') {
      return { day: '--', month: '--' };
    }

    const dateParts = dateValue.split('-').map((part) => Number(part));
    if (dateParts.length !== 3 || dateParts.some((part) => Number.isNaN(part))) {
      return { day: dateValue, month: '' };
    }

    const [year, month, day] = dateParts;
    const parsedDate = new Date(year, month - 1, day);
    if (Number.isNaN(parsedDate.getTime())) {
      return { day: dateValue, month: '' };
    }

    const locale = lang === 'da' ? 'da-DK' : 'en-GB';
    const monthLabel = new Intl.DateTimeFormat(locale, { month: 'short' }).format(parsedDate);

    return {
      day: String(day),
      month: monthLabel,
    };
  };

  const canGoPrev = eventStartIdx > 0;
  const canGoNext = eventStartIdx + 3 < sortedEvents.length;
  const handlePrev = () => {
    if (canGoPrev) setEventStartIdx(eventStartIdx - 1);
  };
  const handleNext = () => {
    if (canGoNext) setEventStartIdx(eventStartIdx + 1);
  };

  const handleContactFormSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.phone.trim() || !contactForm.message.trim()) {
      setContactFormMessage({ type: 'error', text: t[lang].contactFormError });
      return;
    }

    setContactFormSubmitting(true);
    setContactFormMessage(null);

    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Supabase not configured');
      }

      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: 'Aalborg Cricket Club <info@aalborg-cricket.dk>',
          subject: `New Membership Inquiry from ${contactForm.name}`,
          templateType: 'membership_inquiry',
          templateVariables: {
            CONTACT_NAME: contactForm.name,
            CONTACT_PHONE: contactForm.phone,
            MESSAGE: contactForm.message,
          },
        },
      });

      if (error) throw error;

      setContactFormMessage({ type: 'success', text: t[lang].contactFormSuccess });
      setContactForm({ name: '', phone: '', message: '' });
      setTimeout(() => setShowContactModal(false), 2000);
    } catch (err) {
      setContactFormMessage({ type: 'error', text: t[lang].contactFormError });
      console.error('Error sending message:', err);
    } finally {
      setContactFormSubmitting(false);
    }
  };

  useEffect(() => {
    async function fetchEvents() {
      setEventsLoading(true);
      setEventsError("");
      try {
        const { getSupabaseClient } = await import("./lib/supabase");
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from("events")
          .select("id, title, date, time, location, is_active, event_type, extra, home_team_id, away_team_id, home_team:home_team_id(id, name, logo_url), away_team:away_team_id(id, name, logo_url)")
          .eq("is_active", true)
          .order("date", { ascending: true });
        if (error) throw error;
        console.log("Fetched events from DB:", data);
        setEvents(data || []);
      } catch (err) {
        setEventsError(err.message || "Could not load events.");
      } finally {
        setEventsLoading(false);
      }
    }
    fetchEvents();
  }, []);

  return (
    <div className={
      `min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 text-white' : 'bg-gradient-to-br from-green-50 to-blue-50 text-gray-900'}`
    }>
      <HeaderSection
        theme={theme}
        lang={lang}
        t={t}
        onToggleTheme={toggleTheme}
        onToggleLang={toggleLang}
        onClubNameClick={handleClubNameClick}
      />

      <HeroSection theme={theme} lang={lang} t={t} />

      <AboutSection theme={theme} t={t} lang={lang} />

      <NewsSection
        theme={theme}
        title={t[lang].newsTitle}
        description={t[lang].newsDesc}
        news={news}
        newsLoading={newsLoading}
        newsError={newsError}
      />

      <UpcomingMatchesSection
        theme={theme}
        backgroundImage={upcomingMatchesBg}
        title={t[lang].upcomingMatchesTitle}
        loadingText={t[lang].upcomingMatchesLoading}
        emptyText={t[lang].upcomingMatchesEmpty}
        locationLabel={t[lang].locationLabel}
        eventsLoading={eventsLoading}
        eventsError={eventsError}
        matches={upcomingMatches}
        fallbackLogo={logoImg}
        formatMatchDateParts={formatMatchDateParts}
      />

      <SchoolCricketSection
        theme={theme}
        title={t[lang].schoolCricketTitle}
        visitText={t[lang].schoolCricketVisit}
        links={schoolCricketLinks}
      />

      <UpcomingEventsSection
        theme={theme}
        title={t[lang].eventsTitle}
        description={t[lang].eventsDesc}
        dateLabel={t[lang].dateLabel}
        timeLabel={t[lang].timeLabel}
        locationLabel={t[lang].locationLabel}
        events={events}
        eventsLoading={eventsLoading}
        eventsError={eventsError}
        visibleEvents={visibleEvents}
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
        onPrev={handlePrev}
        onNext={handleNext}
        eventStartIdx={eventStartIdx}
        totalEvents={sortedEvents.length}
      />

      <BecomeMemberSection
        theme={theme}
        lang={lang}
        t={t}
        onOpenContact={() => {
          setShowContactModal(true);
          setContactForm({ name: '', phone: '', message: '' });
          setContactFormMessage(null);
        }}
      />
      
      {/* Board Section */}
      <BoardSection theme={theme} lang={lang} t={t} />

      {/* Contact Us Modal */}
      <ContactModal
        show={showContactModal}
        theme={theme}
        t={t}
        lang={lang}
        contactForm={contactForm}
        setContactForm={setContactForm}
        contactFormSubmitting={contactFormSubmitting}
        contactFormMessage={contactFormMessage}
        onClose={() => setShowContactModal(false)}
        onSubmit={handleContactFormSubmit}
      />

      {/* Activity Carousel */}
      <ActivityCarousel />

      {/* Sponsors Section */}
      <SponsorsSection theme={theme} />

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
