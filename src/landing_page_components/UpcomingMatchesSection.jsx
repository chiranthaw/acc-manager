const getCompetitionDisplay = (competitionType) => {
  if (competitionType === '1st_division') {
    return { main: '1', sub: 'st' };
  }
  if (competitionType === '3rd_division') {
    return { main: '3', sub: 'rd' };
  }
  if (competitionType === 't20') {
    return { main: 'T20', sub: null };
  }
  return { main: 'Match', sub: null };
};

const UpcomingMatchesSection = ({
  theme,
  backgroundImage,
  title,
  loadingText,
  emptyText,
  locationLabel,
  eventsLoading,
  eventsError,
  matches,
  fallbackLogo,
  formatMatchDateParts,
}) => {
  return (
    <section
      id="matches"
      className={theme === 'dark' ? 'py-12 text-white' : 'py-12 text-gray-900'}
      style={{
        backgroundImage: theme === 'dark'
          ? `linear-gradient(rgba(15, 23, 42, 0.82), rgba(15, 23, 42, 0.82)), url(${backgroundImage})`
          : `linear-gradient(rgba(255, 255, 255, 0.86), rgba(255, 255, 255, 0.86)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h3 className={`text-3xl font-bold mb-3 flex items-center justify-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <span>{title}</span>
          </h3>
        </div>

        {eventsLoading ? (
          <div className="text-center text-slate-400">{loadingText}</div>
        ) : eventsError ? (
          <div className="text-center text-rose-400">{eventsError}</div>
        ) : matches.length === 0 ? (
          <div className="text-center text-slate-400">{emptyText}</div>
        ) : (
          <div className="space-y-3 max-w-4xl mx-auto">
            {matches.map((match) => {
              const homeTeamName = match.home_team?.name || match.extra?.homeTeam || 'Home Team';
              const awayTeamName = match.away_team?.name || match.extra?.awayTeam || 'Away Team';
              const homeLogo = match.home_team?.logo_url || match.extra?.homeLogoUrl || fallbackLogo;
              const awayLogo = match.away_team?.logo_url || match.extra?.awayLogoUrl || fallbackLogo;
              const matchDate = formatMatchDateParts(match.date);
              const competitionDisplay = getCompetitionDisplay(match.extra?.match_competition);

              return (
                <div
                  key={match.id}
                  className={theme === 'dark'
                    ? 'rounded-lg border border-slate-700 bg-slate-900 px-5 py-4'
                    : 'rounded-lg border border-slate-200 bg-white px-5 py-4'}
                >
                  <div className="flex items-stretch gap-3">
                    <div
                      className={theme === 'dark'
                        ? 'shrink-0 mr-8 w-24 sm:w-28 rounded-md border border-indigo-300/60 bg-indigo-500/20 px-3 py-1.5 text-center text-white shadow-sm'
                        : 'shrink-0 mr-8 w-24 sm:w-28 rounded-md border border-indigo-300 bg-indigo-100 px-3 py-1.5 text-center text-indigo-950 shadow-sm'}
                    >
                      <div className="text-4xl sm:text-5xl font-semibold leading-none tabular-nums">{matchDate.day}</div>
                      <div className="mt-0.5 text-sm sm:text-base uppercase tracking-wide leading-none">{matchDate.month}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="space-y-2 min-w-0">
                        <h4 className={`text-xl font-semibold flex items-center gap-2 min-w-0 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          <span className="inline-flex items-center gap-2 min-w-0">
                            <img
                              src={homeLogo}
                              alt={`${homeTeamName} logo`}
                              className="h-11 w-11 rounded-full border border-slate-300/40 bg-white object-cover"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = fallbackLogo;
                              }}
                            />
                            <span className="truncate">{homeTeamName}</span>
                          </span>
                          <span className="text-slate-400">vs.</span>
                          <span className="inline-flex items-center gap-2 min-w-0">
                            <img
                              src={awayLogo}
                              alt={`${awayTeamName} logo`}
                              className="h-11 w-11 rounded-full border border-slate-300/40 bg-white object-cover"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = fallbackLogo;
                              }}
                            />
                            <span className="truncate">{awayTeamName}</span>
                          </span>
                        </h4>
                        {match.location ? (
                          <div className={theme === 'dark' ? 'text-sm font-normal text-slate-300' : 'text-sm font-normal text-slate-600'}>
                            {locationLabel}: {match.location}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="shrink-0 flex items-start">
                      <div
                        className={theme === 'dark'
                          ? 'inline-flex min-w-20 items-center justify-center rounded-md border border-amber-400/40 bg-amber-500/20 px-2 py-1 text-amber-200'
                          : 'inline-flex min-w-20 items-center justify-center rounded-md border border-amber-300 bg-amber-100 px-2 py-1 text-amber-800'}
                      >
                        <span className="flex flex-col items-center leading-none">
                          <span className="text-4xl font-normal">{competitionDisplay.main}</span>
                          {competitionDisplay.sub ? <span className="text-sm font-normal mt-0.5">{competitionDisplay.sub}</span> : null}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default UpcomingMatchesSection;
