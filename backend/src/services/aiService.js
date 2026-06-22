const Groq = require('groq-sdk');

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const generateItinerary = async ({ destination, days, budgetType, interests }) => {
  const prompt = `You are an expert travel planner. Generate a detailed day-by-day travel itinerary and budget estimate.

Trip Details:
- Destination: ${destination}
- Number of Days: ${days}
- Budget Type: ${budgetType}
- Interests: ${interests.join(', ')}

Respond ONLY with a valid JSON object in this exact format, no extra text, no markdown backticks:
{
  "itinerary": [
    {
      "day": 1,
      "title": "Day title",
      "activities": [
        {
          "time": "Morning",
          "activity": "Activity name",
          "description": "Brief description",
          "estimatedCost": "$10-20"
        }
      ]
    }
  ],
  "budget": {
    "flights": "$XXX",
    "accommodation": "$XXX",
    "food": "$XXX",
    "activities": "$XXX",
    "total": "$XXX",
    "notes": "Brief budget notes"
  },
  "hotels": [
    {
      "name": "Hotel name",
      "type": "Budget/Mid-range/Luxury",
      "pricePerNight": "$XX",
      "rating": 4.5,
      "description": "Brief description"
    }
  ]
}`;

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 4000,
  });

  const text = response.choices[0].message.content;
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};
const generateDay = async ({ destination, dayNumber, budgetType, interests, instruction }) => {
  const prompt = `You are an expert travel planner. Regenerate a single day itinerary.

Trip: ${destination}, Day ${dayNumber}, ${budgetType} budget, Interests: ${interests.join(', ')}
${instruction ? `Special instruction: ${instruction}` : ''}

Respond ONLY with a valid JSON object, no markdown:
{
  "day": ${dayNumber},
  "title": "Day title",
  "activities": [
    {
      "time": "Morning",
      "activity": "Activity name",
      "description": "Brief description",
      "estimatedCost": "$10-20"
    }
  ]
}`;

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1500,
  });

  const text = response.choices[0].message.content;
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};

module.exports = { generateItinerary, generateDay };
module.exports = { generateItinerary };