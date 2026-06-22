'use client';

import { useAuth } from '@/lib/authContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      api.get('/trips')
        .then((data) => setTrips(data.trips))
        .catch(console.error);
    }
  }, [user]);

  const handleDelete = async (tripId) => {
    if (!confirm('Delete this trip? This cannot be undone.')) return;
    try {
      await api.delete(`/trips/${tripId}`);
      setTrips((prev) => prev.filter((t) => t._id !== tripId));
    } catch (err) {
      console.error(err.message);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome, {user.name} ✈️</h1>
            <p className="text-gray-500 text-sm mt-1">Your AI travel planner</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/trips/new"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              + New Trip
            </Link>
            <button
              onClick={logout}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {trips.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-4xl mb-4">🗺️</p>
            <h2 className="text-lg font-semibold text-gray-700">No trips yet</h2>
            <p className="text-gray-400 text-sm mt-1 mb-6">Plan your first AI-powered trip</p>
            <Link
              href="/trips/new"
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              Plan a Trip
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {trips.map((trip) => (
              <div
                key={trip._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition flex justify-between items-center group"
              >
                <Link href={`/trips/${trip._id}`} className="flex-1">
                  <h3 className="font-semibold text-gray-800">{trip.destination}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    📅 {trip.days} days · 💰 {trip.budgetType} · 🎯 {trip.interests.join(', ')}
                  </p>
                </Link>
                <button
                  onClick={() => handleDelete(trip._id)}
                  className="ml-4 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition text-sm"
                >
                  🗑️ Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}