# Trao AI Travel Planner

An AI-powered full-stack travel planning app that generates day-by-day itineraries, budget estimates, and hotel suggestions based on user preferences.

## Tech Stack

- **Frontend:** Next.js + Tailwind CSS (deployed on Vercel)
- **Backend:** Node.js + Express (deployed on Railway)
- **Database:** MongoDB Atlas
- **AI:** Groq API (Llama 3.3 70B)
- **Language:** JavaScript

## Features

- User authentication with JWT
- AI-generated day-by-day itineraries
- Budget estimation per trip
- Hotel suggestions
- Editable itinerary (add, remove, regenerate activities)
- Trip share link (public read-only, no login needed)
- Delete trips from dashboard

## Creative Feature — Trip Share Link

Users can generate a public read-only link to share their itinerary with friends without requiring them to log in. This solves a real problem: you plan a trip and want to share it instantly with travel companions who don't use the app.

## Project Structure

\`\`\`
trao-travel-planner/
├── frontend/        # Next.js app
│   ├── app/         # App router pages
│   ├── components/  # Reusable components
│   ├── lib/         # API client, auth context
│   └── hooks/
├── backend/         # Node.js + Express API
│   └── src/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       └── services/
└── README.md
\`\`\`

## Local Setup

### Backend

\`\`\`bash
cd backend
cp .env.example .env
# Fill in your values in .env
npm install
npm run dev
\`\`\`

### Frontend

\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

Visit http://localhost:3000

## Architecture

- Frontend communicates with backend via REST API
- All trip routes are JWT-protected
- Users can only access their own trips (strict data isolation)
- AI service is isolated in `services/aiService.js` — easy to swap LLM providers
- Share links use a random token stored on the trip — no auth needed to view

## Authentication & Authorization

- Passwords hashed with bcryptjs
- JWT stored in localStorage, sent as Bearer token
- All protected routes use `protect` middleware
- Trip ownership verified on every mutation

## AI Agent Design

- Single prompt sent to Groq (Llama 3.3 70B) returns itinerary + budget + hotels as JSON
- Day regeneration uses a focused prompt for a single day with optional custom instruction
- JSON parsing with markdown fence stripping for reliability

## Key Design Decisions

- **Groq over OpenAI/Anthropic** — free tier, fast inference, sufficient quality for travel planning
- **MongoDB** — flexible schema suits itinerary data which varies in structure
- **Next.js App Router** — route groups keep auth pages separate from protected pages
- **Services layer** — LLM logic isolated from controllers, easy to swap providers

## Known Limitations

- AI responses may occasionally have formatting issues (handled with JSON cleanup)
- No real hotel availability — suggestions are AI-generated, not live data
- Share links are permanent once generated (no expiry)

## Deployment

- Frontend: Vercel
- Backend: Railway
- Database: MongoDB Atlas