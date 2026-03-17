# Proactive Sports Frontend

Frontend application for the Proactive Sports platform built with Next.js.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file from `.env.local.example`:
```bash
cp .env.local.example .env.local
```

3. Update the `.env.local` file with your configuration

## Running the Application

Development mode:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Project Structure

- `src/app/` - Next.js app router pages and layouts
- `src/components/` - Reusable React components
- `src/contexts/` - React context providers
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utility libraries and configurations
- `src/services/` - API service functions
- `src/utils/` - Helper utilities

## Backend Integration

This frontend now connects to a separate backend API server. Make sure to:

1. Update API endpoints in `src/lib/api.ts` to point to your backend server
2. Start the backend server before running the frontend
3. Configure CORS settings in the backend to allow frontend requests

## Features

- User authentication and role-based access
- Booking system for assessments and trials
- AI-powered chat and recommendations
- Admin, coach, and manager dashboards
- Responsive design with Tailwind CSS