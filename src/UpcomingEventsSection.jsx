const getEventIcon = (eventType) => {
  switch ((eventType || '').toLowerCase()) {
    case 'match':
      return '🏏';
    case 'training':
      return '💪';
    case 'school':
      return '🎓';
    case 'social':
      return '🎉';
    case 'other':
      return '📌';
    default:
      return '📅';
  }
};

const UpcomingEventsSection = ({
  theme,
  title,
  description,
  dateLabel,
  timeLabel,
  locationLabel,
  events,
  eventsLoading,
  eventsError,
  visibleEvents,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
  eventStartIdx,
  totalEvents,
}) => {
  return (
    <section id="events" className={theme === 'dark' ? 'py-16 bg-gray-900' : 'py-16 bg-white'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className={`text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
          <p className={theme === 'dark' ? 'text-gray-300 text-lg' : 'text-gray-600 text-lg'}>{description}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {eventsLoading ? (
            <div className="col-span-3 text-center text-slate-400">Loading events...</div>
          ) : eventsError ? (
            <div className="col-span-3 text-center text-rose-400">{eventsError}</div>
          ) : events.length === 0 ? (
            <div className="col-span-3 text-center text-slate-400">No upcoming events.</div>
          ) : (
            <>
              <div className="col-span-3 flex items-center justify-center">
                <button
                  onClick={onPrev}
                  disabled={!canGoPrev}
                  className={`group p-3 mr-4 rounded-full border-2 shadow-lg bg-white dark:bg-gray-800 border-green-400 dark:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200 flex items-center justify-center ${canGoPrev ? 'hover:bg-green-100 dark:hover:bg-gray-700' : 'opacity-40 cursor-not-allowed'}`}
                  aria-label="Previous events"
                  style={{ alignSelf: 'center' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7 text-green-600 dark:text-green-300 group-hover:text-green-800 dark:group-hover:text-green-200">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1">
                  {visibleEvents.map((event) => {
                    const icon = getEventIcon(event.event_type);
                    return (
                      <div key={event.id} className={theme === 'dark' ? 'bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700' : 'bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 border border-gray-200'}>
                        <div className="flex items-center mb-2">
                          <span className="text-3xl mr-3">{icon}</span>
                          <h4 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{event.title}</h4>
                        </div>
                        <div className={theme === 'dark' ? 'space-y-1 text-gray-300' : 'space-y-1 text-gray-600'}>
                          <p><span className="font-medium">{dateLabel}:</span> {event.date}</p>
                          <p><span className="font-medium">{timeLabel}:</span> {event.time}</p>
                          <p><span className="font-medium">{locationLabel}:</span> {event.location}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={onNext}
                  disabled={!canGoNext}
                  className={`group p-3 ml-4 rounded-full border-2 shadow-lg bg-white dark:bg-gray-800 border-green-400 dark:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200 flex items-center justify-center ${canGoNext ? 'hover:bg-green-100 dark:hover:bg-gray-700' : 'opacity-40 cursor-not-allowed'}`}
                  aria-label="Next events"
                  style={{ alignSelf: 'center' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7 text-green-600 dark:text-green-300 group-hover:text-green-800 dark:group-hover:text-green-200">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
              <div className="col-span-3 text-center mt-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {eventStartIdx + 1}-{Math.min(eventStartIdx + 3, totalEvents)} of {totalEvents} events
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default UpcomingEventsSection;
