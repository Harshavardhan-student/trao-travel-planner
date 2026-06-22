import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <p className="text-5xl mb-6">✈️</p>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Trao AI Travel Planner</h1>
        <p className="text-gray-500 mb-8 text-lg">Plan your perfect trip with AI — day by day itineraries, budget estimates, and hotel suggestions.</p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/register"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="bg-white text-indigo-600 border border-indigo-300 px-6 py-3 rounded-lg font-medium hover:bg-indigo-50 transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}