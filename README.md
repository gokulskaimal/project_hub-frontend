# Project Hub - Frontend Client

This is the frontend client for Project Hub, built with Next.js 15 (App Router), Tailwind CSS, Framer Motion, and Redux Toolkit.

## 🚀 Features

- **Modern UI**: Glassmorphism aesthetic with Framer Motion animations.
- **State Management**: Redux Toolkit & RTK Query for efficient data fetching and caching.
- **Authentication**: JWT-based session management and Google OAuth integration.
- **Forms & Validation**: React Hook Form combined with Zod for robust client-side validation.
- **Real-Time Features**: Integrated with Socket.io for chat/notifications and Zego Cloud for video conferencing.

## 💻 Tech Stack

- Next.js 15
- React 18
- Tailwind CSS
- Framer Motion
- Redux Toolkit & RTK Query
- React Hook Form + Zod
- Socket.io Client
- Zego Cloud

## 🛠️ Local Development

### Prerequisites
- Node.js v18 or higher
- npm or yarn

### Setup

1. Clone the repository and navigate to the `client` directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env.local` and fill in your values.
   ```bash
   cp .env.example .env.local
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Hosting on Vercel

1. Import the `/client` directory as a new Next.js project in Vercel.
2. Vercel will automatically detect Next.js and apply the correct build settings (`npm run build`).
3. Add all `NEXT_PUBLIC_*` environment variables from your `.env.local` to the Vercel project settings.
