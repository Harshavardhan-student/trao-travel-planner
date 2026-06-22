'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function SharedTripPage() {
  const { token } = useParams();
  const [trip, setTrip] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('itinerary');

  useEffect(() => {
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/trips/shared/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setTrip(data.trip);
        else setError(data.error);
      })
      .catch(() => setError('Failed to load trip'));
  }, [token]);

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-500">{error}</p>
    </div>
  );

  if (!trip) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Loading shared trip...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Banner */}
        <div className="bg-indigo-600 text-white rounded-2xl p-4 mb-6 flex items-center gap-3">
          <span className="text-2xl">✈️</span>
          <div>
            <p className="font-semibold">Shared Itinerary</p>
            <p className="text-indigo-200 text-xs">View-only · Created with Trao AI Travel Planner</p>
          </div>
        </div>

        {/* Trip header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{trip.destination}</h1>
          <div className="flex flex-wrap gap-3 text-sm text-gray-500">
            <span>📅 {trip.days} days</span>
            <span>💰 {trip.budgetType} budget</span>
            <span>🎯 {trip.interests.join(', ')}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['itinerary', 'budget', 'hotels'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
                activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-400'
              }`}
            >
              {tab === 'itinerary' ? '🗓️ Itinerary' : tab === 'budget' ? '💰 Budget' : '🏨 Hotels'}
            </button>
          ))}
        </div>

        {/* Itinerary */}
        {activeTab === 'itinerary' && trip.itinerary && (
          <div className="space-y-4">
            {trip.itinerary.map((day) => (
              <div key={day.day} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-gray-800 mb-4">Day {day.day} — {day.title}</h2>
                <div className="space-y-3">
                  {day.activities.map((act, i) => (
                    <div key={i} className="flex gap-4 text-sm">
                      <span className="text-indigo-500 font-medium w-20 shrink-0">{act.time}</span>
                      <div>
                        <p className="font-medium text-gray-800">{act.activity}</p>
                        <p className="text-gray-500">{act.description}</p>
                        <p className="text-green-600 text-xs mt-0.5">{act.estimatedCost}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Budget */}
        {activeTab === 'budget' && trip.budget && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-4">Estimated Budget</h2>
            <div className="space-y-3">
              {['flights', 'accommodation', 'food', 'activities'].map((key) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-gray-600 capitalize">{key}</span>
                  <span className="font-medium text-gray-800">{trip.budget[key]}</span>
                </div>
              ))}
              <div className="border-t pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-indigo-600">{trip.budget.total}</span>
              </div>
              {trip.budget.notes && <p className="text-xs text-gray-400 mt-2">{trip.budget.notes}</p>}
            </div>
          </div>
        )}

        {/* Hotels */}
        {activeTab === 'hotels' && trip.hotels?.length > 0 && (
          <div className="space-y-4">
            {trip.hotels.map((hotel, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-800">{hotel.name}</h3>
                  <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full">{hotel.type}</span>
                </div>
                <p className="text-sm text-gray-500 mb-2">{hotel.description}</p>
                <div className="flex gap-4 text-sm">
                  <span className="text-green-600 font-medium">{hotel.pricePerNight}/night</span>
                  <span className="text-yellow-500">⭐ {hotel.rating}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer CTA */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm mb-3">Want to plan your own trip?</p>
          
           <a href="/register"
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition inline-block"
          >
            Plan with Trao AI ✈️
          </a>
        </div>

      </div>
    </div>
  );
}