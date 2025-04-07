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
- Next.js (React framework)
- Tailwind CSS for styling
- Supabase for authentication
- Socket.io client for real-time communication
- Zustand for state management
- Deployed on Netlify

### Backend
- Node.js with Express
- Socket.io for real-time communication
- Supabase for data storage and authentication
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
