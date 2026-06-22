'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import { useEffect } from 'react';

const INTERESTS = ['Food', 'Culture', 'Adventure', 'Shopping', 'Nature', 'Nightlife'];

const INTEREST_ICONS = {
  Food: '🍜',
  Culture: '🏛️',
  Adventure: '🧗',
  Shopping: '🛍️',
  Nature: '🌿',
  Nightlife: '🎉',
};

export default function NewTripPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    destination: '',
    days: '',
    budgetType: '',
    interests: [],
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleInterest = (interest) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.interests.length === 0) {
      return setError('Please select at least one interest');
    }

    setSubmitting(true);
    try {
      const data = await api.post('/trips', {
        ...form,
        days: Number(form.days),
      });
      router.push(`/trips/${data.trip._id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-indigo-600 hover:underline mb-4 block"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Plan a New Trip ✈️</h1>
          <p className="text-gray-500 text-sm mt-1">Tell us about your trip and AI will do the rest</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Destination */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination
              </label>
              <input
                name="destination"
                type="text"
                placeholder="e.g. Tokyo, Japan"
                value={form.destination}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Number of Days */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Days
              </label>
              <input
                name="days"
                type="number"
                placeholder="e.g. 5"
                value={form.days}
                onChange={handleChange}
                required
                min={1}
                max={30}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Budget Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['Low', 'Medium', 'High'].map((budget) => (
                  <button
                    key={budget}
                    type="button"
                    onClick={() => setForm({ ...form, budgetType: budget })}
                    className={`py-2.5 rounded-lg text-sm font-medium border transition ${
                      form.budgetType === budget
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                    }`}
                  >
                    {budget === 'Low' ? '💰 Low' : budget === 'Medium' ? '💰💰 Medium' : '💰💰💰 High'}
                  </button>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interests <span className="text-gray-400 font-normal">(select all that apply)</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {INTERESTS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`py-2.5 rounded-lg text-sm font-medium border transition ${
                      form.interests.includes(interest)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                    }`}
                  >
                    {INTEREST_ICONS[interest]} {interest}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !form.budgetType}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 text-sm"
            >
              {submitting ? '🤖 AI is generating your itinerary...' : 'Generate Itinerary →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}