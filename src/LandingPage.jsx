import { Link } from 'react-router-dom';
import logoImg from './images/acc-logo-new.png';

const LandingPage = () => {
  const news = [
    {
      id: 1,
      title: "Season Opener Victory",
      date: "March 1, 2026",
      summary: "Our first team kicked off the season with a thrilling win against rivals."
    },
    {
      id: 2,
      title: "New Training Facilities",
      date: "February 15, 2026",
      summary: "Exciting updates on our upgraded training grounds and equipment."
    },
    {
      id: 3,
      title: "Junior Program Expansion",
      date: "January 20, 2026",
      summary: "We're expanding our junior cricket program to welcome more young players."
    }
  ];

  const events = [
    {
      id: 1,
      title: "Annual General Meeting",
      date: "March 15, 2026",
      time: "7:00 PM",
      location: "Club Pavilion"
    },
    {
      id: 2,
      title: "Charity Match",
      date: "April 5, 2026",
      time: "2:00 PM",
      location: "Main Ground"
    },
    {
      id: 3,
      title: "Youth Tournament",
      date: "April 20-22, 2026",
      time: "All Day",
      location: "Club Grounds"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <img src={logoImg} alt="ACC Logo" className="h-12 w-auto" />
              <h1 className="text-2xl font-bold text-gray-900">Australian Cricket Club</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#about" className="text-gray-700 hover:text-green-600 transition-colors">About</a>
              <a href="#news" className="text-gray-700 hover:text-green-600 transition-colors">News</a>
              <a href="#events" className="text-gray-700 hover:text-green-600 transition-colors">Events</a>
              <a href="#contact" className="text-gray-700 hover:text-green-600 transition-colors">Contact</a>
            </nav>
            <Link
              to="/admin"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to Australian Cricket Club
          </h2>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Where passion meets performance. Join our community of cricket enthusiasts and experience the thrill of the game.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/admin"
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Access Admin Portal
            </Link>
            <a
              href="#contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">About Our Club</h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Founded with a vision to promote cricket excellence, Australian Cricket Club has been a cornerstone of the community for decades.
              We offer programs for players of all ages and skill levels, from juniors learning the basics to seasoned professionals.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏏</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Excellence</h4>
              <p className="text-gray-600">Committed to developing skills and achieving success on and off the field.</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Community</h4>
              <p className="text-gray-600">Building lasting relationships and fostering a supportive environment.</p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏆</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Achievement</h4>
              <p className="text-gray-600">Celebrating victories and recognizing the dedication of our members.</p>
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section id="news" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Latest News</h3>
            <p className="text-lg text-gray-600">Stay updated with the latest happenings at our club</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {news.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h4 className="text-xl font-semibold mb-2 text-gray-900">{item.title}</h4>
                <p className="text-sm text-gray-500 mb-3">{item.date}</p>
                <p className="text-gray-600">{item.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Upcoming Events</h3>
            <p className="text-lg text-gray-600">Join us for exciting cricket events and activities</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {events.map((event) => (
              <div key={event.id} className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 border border-gray-200">
                <h4 className="text-xl font-semibold mb-2 text-gray-900">{event.title}</h4>
                <div className="space-y-1 text-gray-600">
                  <p><span className="font-medium">Date:</span> {event.date}</p>
                  <p><span className="font-medium">Time:</span> {event.time}</p>
                  <p><span className="font-medium">Location:</span> {event.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Get in Touch</h3>
            <p className="text-lg text-gray-300">Have questions? We'd love to hear from you!</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xl font-semibold mb-4">Contact Information</h4>
              <div className="space-y-3">
                <p>📍 123 Cricket Lane, Melbourne, VIC 3000</p>
                <p>📞 (03) 1234 5678</p>
                <p>✉️ info@australiancricketclub.com.au</p>
              </div>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Facebook</a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Instagram</a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Twitter</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2026 Australian Cricket Club. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;