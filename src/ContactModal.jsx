const ContactModal = ({
  show,
  theme,
  t,
  lang,
  contactForm,
  setContactForm,
  contactFormSubmitting,
  contactFormMessage,
  onClose,
  onSubmit,
}) => {
  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className={`rounded-lg p-6 max-w-md w-full ${theme === 'dark' ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t[lang].contactFormTitle}
          </h4>
          <button
            onClick={onClose}
            className={`text-2xl leading-none transition ${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
          >
            ×
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
              {t[lang].contactFormName}
            </label>
            <input
              type="text"
              value={contactForm.name}
              onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark'
                ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                : 'bg-white border-slate-300 text-gray-900 placeholder-slate-500'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              placeholder={t[lang].contactFormName}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
              {t[lang].contactFormPhone}
            </label>
            <input
              type="tel"
              value={contactForm.phone}
              onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark'
                ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                : 'bg-white border-slate-300 text-gray-900 placeholder-slate-500'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              placeholder={t[lang].contactFormPhone}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
              {t[lang].contactFormMessage}
            </label>
            <textarea
              value={contactForm.message}
              onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
              rows="4"
              className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark'
                ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                : 'bg-white border-slate-300 text-gray-900 placeholder-slate-500'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none`}
              placeholder={t[lang].contactFormMessage}
            />
          </div>

          <button
            type="submit"
            disabled={contactFormSubmitting}
            className="w-full rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {contactFormSubmitting ? 'Sending...' : t[lang].contactFormSubmit}
          </button>

          {contactFormMessage && (
            <div className={`p-3 rounded-lg text-sm ${
              contactFormMessage.type === 'success'
                ? theme === 'dark' ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'
                : theme === 'dark' ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800'
            }`}>
              {contactFormMessage.text}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ContactModal;
