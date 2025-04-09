# iChat - Modern Real-time Chat Application

A full-featured chat application similar to WhatsApp and WeChat, built with modern web technologies.

## Features

- Real-time messaging with Socket.io
- User authentication with Supabase
- Private and group chats
- Message status (sent, delivered, read)
- Typing indicators
- User presence (online/offline status)
- Mobile-responsive design

## Tech Stack

### Frontend
- Next.js 15.2.4 (React framework)
- React 19.0.0
- TypeScript 5+
- Tailwind CSS 4 for styling
- Supabase JS for authentication and data storage
- Socket.io Client 4.8.1 for real-time communication
- Zustand 5.0.3 for state management
- React Hook Form 7.55.0 for form handling
- React Icons 5.5.0 for UI icons
- date-fns 4.1.0 for date formatting and manipulation
- Turbopack for development
- Google Tag Manager for analytics
- Deployed on Netlify

### Backend
- Node.js
- TypeScript 5+
- Express 5.1.0 as the web framework
- Socket.io 4.8.1 for real-time communication
- Supabase JS for data storage and authentication
- Cors for cross-origin resource sharing
- Dotenv for environment variable management
- Nodemon and ts-node for development
- Deployed on Google Cloud

## Project Structure

```
ichat-app/
├── frontend/         # Next.js frontend application
│   ├── src/          # Source code
│   │   ├── app/      # Next.js app router pages
│   │   ├── components/ # React components
│   │   ├── hooks/    # Custom React hooks
│   │   ├── lib/      # Utility functions and libraries
│   │   └── store/    # Zustand state management
│   ├── public/       # Static assets
│   └── ...
├── backend/          # Express.js backend application
│   ├── src/          # Source code
│   │   ├── services/ # Business logic services
│   │   └── ...
│   └── ...
└── ...
```

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Supabase account
- Google Cloud account (for production deployment)

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd ichat-app
```

2. Set up the frontend:
```bash
cd frontend
npm install
```

3. Create a `.env.local` file in the frontend directory with the following content:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000 # Backend URL
```

4. Set up the backend:
```bash
cd ../backend
npm install
```

5. Create a `.env` file in the backend directory with the following content:
```
PORT=8000
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_key
FRONTEND_URL=http://localhost:3000
```

### Running the Application

1. Start the backend:
```bash
cd backend
npm run dev
```

2. Start the frontend:
```bash
cd frontend
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Frontend Deployment (Netlify)

1. Push your code to a Git repository (GitHub, GitLab, etc.)
2. Connect your repository to Netlify
3. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Set up environment variables in Netlify dashboard

### Backend Deployment (Google Cloud)

1. Create a Google Cloud project
2. Deploy the backend application to Google Cloud Run or App Engine
3. Set up environment variables in Google Cloud
4. Update the frontend `.env` file with the production backend URL

## Domain Setup

The application is configured to use the domain `ichat.co`. You'll need to:

1. Purchase the domain from a domain registrar
2. Configure DNS settings to point to your Netlify frontend
3. Set up appropriate subdomains for the backend (e.g., api.ichat.co)

## License

This project is licensed under the MIT License.

## Contact

For any questions or support, please contact the project maintainers.
