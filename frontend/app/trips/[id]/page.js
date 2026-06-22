'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/authContext';

export default function TripDetailPage() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [trip, setTrip] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('itinerary');
  const [addingTo, setAddingTo] = useState(null);
  const [newActivity, setNewActivity] = useState({ time: '', activity: '', description: '', estimatedCost: '' });
  const [regeneratingDay, setRegeneratingDay] = useState(null);
  const [regenInstruction, setRegenInstruction] = useState('');
  const [savingDay, setSavingDay] = useState(null);
  const [shareUrl, setShareUrl] = useState('');
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!id) return;
    api.get(`/trips/${id}`)
      .then((data) => setTrip(data.trip))
      .catch((err) => setError(err.message));
  }, [id]);

  const handleRemoveActivity = async (dayIndex, activityIndex) => {
    try {
      const data = await api.delete(`/trips/${id}/day/${dayIndex}/activity/${activityIndex}`);
      setTrip(data.trip);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddActivity = async (dayIndex) => {
    try {
      const data = await api.post(`/trips/${id}/day/${dayIndex}/activity`, newActivity);
      setTrip(data.trip);
      setAddingTo(null);
      setNewActivity({ time: '', activity: '', description: '', estimatedCost: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRegenerateDay = async (dayIndex) => {
    setSavingDay(dayIndex);
    try {
      const data = await api.post(`/trips/${id}/day/${dayIndex}/regenerate`, { instruction: regenInstruction });
      setTrip(data.trip);
      setRegeneratingDay(null);
      setRegenInstruction('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingDay(null);
    }
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const data = await api.post(`/trips/${id}/share`, {});
      const url = `${window.location.origin}/share/${data.shareToken}`;
      setShareUrl(url);
      await navigator.clipboard.writeText(url);
      alert('Share link copied to clipboard!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSharing(false);
    }
  };

  if (loading || !trip) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Loading trip...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">

        <button onClick={() => router.push('/dashboard')} className="text-sm text-indigo-600 hover:underline mb-6 block">
          ← Back to Dashboard
        </button>

        {/* Trip Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{trip.destination}</h1>
              <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                <span>📅 {trip.days} days</span>
                <span>💰 {trip.budgetType} budget</span>
                <span>🎯 {trip.interests.join(', ')}</span>
              </div>
            </div>
            <button
              onClick={handleShare}
              disabled={sharing}
              className="bg-indigo-50 text-indigo-600 border border-indigo-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100 transition disabled:opacity-50"
            >
              {sharing ? 'Generating...' : '🔗 Share Trip'}
            </button>
          </div>
          {shareUrl && (
            <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-xs text-gray-600 break-all">
              {shareUrl}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

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

        {/* Itinerary Tab */}
        {activeTab === 'itinerary' && trip.itinerary && (
          <div className="space-y-4">
            {trip.itinerary.map((day, dayIndex) => (
              <div key={day.day} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold text-gray-800">Day {day.day} — {day.title}</h2>
                  <button
                    onClick={() => setRegeneratingDay(regeneratingDay === dayIndex ? null : dayIndex)}
                    className="text-xs text-indigo-600 border border-indigo-200 px-3 py-1 rounded-full hover:bg-indigo-50 transition"
                  >
                    🔄 Regenerate
                  </button>
                </div>

                {regeneratingDay === dayIndex && (
                  <div className="mb-4 p-4 bg-indigo-50 rounded-lg">
                    <input
                      type="text"
                      placeholder='e.g. "More outdoor activities" or "Focus on food"'
                      value={regenInstruction}
                      onChange={(e) => setRegenInstruction(e.target.value)}
                      className="w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-2"
                    />
                    <button
                      onClick={() => handleRegenerateDay(dayIndex)}
                      disabled={savingDay === dayIndex}
                      className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                      {savingDay === dayIndex ? '🤖 Regenerating...' : 'Regenerate Day'}
                    </button>
                  </div>
                )}

                <div className="space-y-3">
                  {day.activities.map((act, actIndex) => (
                    <div key={actIndex} className="flex gap-4 text-sm group">
                      <span className="text-indigo-500 font-medium w-20 shrink-0">{act.time}</span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{act.activity}</p>
                        <p className="text-gray-500">{act.description}</p>
                        <p className="text-green-600 text-xs mt-0.5">{act.estimatedCost}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveActivity(dayIndex, actIndex)}
                        className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {addingTo === dayIndex ? (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        placeholder="Time (e.g. Morning)"
                        value={newActivity.time}
                        onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                        className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                      <input
                        placeholder="Estimated Cost"
                        value={newActivity.estimatedCost}
                        onChange={(e) => setNewActivity({ ...newActivity, estimatedCost: e.target.value })}
                        className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                    </div>
                    <input
                      placeholder="Activity name"
                      value={newActivity.activity}
                      onChange={(e) => setNewActivity({ ...newActivity, activity: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <input
                      placeholder="Description"
                      value={newActivity.description}
                      onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddActivity(dayIndex)}
                        className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-indigo-700 transition"
                      >
                        Add Activity
                      </button>
                      <button
                        onClick={() => setAddingTo(null)}
                        className="text-gray-500 px-4 py-1.5 rounded-lg text-sm border border-gray-300 hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingTo(dayIndex)}
                    className="mt-4 text-sm text-indigo-600 hover:underline"
                  >
                    + Add Activity
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Budget Tab */}
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

        {/* Hotels Tab */}
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

      </div>
    </div>
  );
}