import { Link } from 'react-router-dom';
import logoImg from './images/acc-logo-new.png';

export default function BecomeMemberPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoImg} alt="ACC Logo" className="h-10 w-auto" style={{ filter: 'brightness(0) invert(1)' }} />
            <span className="text-lg font-semibold text-white">AALBORG CRICKET CLUB</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm">
            <a href="/#about" className="text-slate-300 transition hover:text-green-300">About</a>
            <a href="/#news" className="text-slate-300 transition hover:text-green-300">News</a>
            <a href="/#matches" className="text-slate-300 transition hover:text-green-300">Matches</a>
            <a href="/#events" className="text-slate-300 transition hover:text-green-300">Events</a>
            <a href="/#sponsors" className="text-slate-300 transition hover:text-green-300">Sponsors</a>
            <a href="/#contact" className="text-slate-300 transition hover:text-green-300">Contact</a>
          </nav>
        </div>
      </header>

      <main className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur">
            <h1 className="text-3xl font-bold text-white">Become a Member</h1>
            <p className="mt-3 text-slate-300">
              Join Aalborg Cricket Club and become part of our cricket community.
            </p>

            <div className="mt-6 space-y-3 text-slate-200">
              <p>To get started, please create your account in our member portal.</p>
              <p>After signup, the club admin can help you complete your membership setup.</p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/admin"
                className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-400"
              >
                Go to Signup/Login
              </Link>
              <Link
                to="/"
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
              >
                Back to Main Page
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
