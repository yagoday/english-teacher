# English Teacher App

An interactive English learning application designed for Hebrew-speaking children aged 5-12. The app uses speech recognition and AI to provide real-time feedback and guidance for learning English.

## Features

- Speech-to-text conversion for real-time English practice
- AI-powered feedback and corrections
- Theme-based interface (Panda/Darth Vader) with voice modulation
- User profiles and progress tracking
- Child-friendly interface

## Tech Stack

- Frontend: React with TypeScript, Chakra UI
- Backend: Node.js with Express
- Database: MongoDB (hosted on Railway)
- Authentication: Supabase with Google Sign-In
- AI Services: OpenAI GPT-3.5-Turbo and Anthropic Claude
- APIs: Web Speech API, Web Audio API

## Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)
- MongoDB (local instance or connection string)
- Railway account (for deployment)
- Supabase account (for authentication)
- OpenAI and Anthropic API keys

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd english-teacher
   ```

2. Install dependencies:
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. Configure environment variables:
   - Copy `config/.env.example` to `config/.env`
   - Fill in your API keys and configuration values

4. Start the development servers:
   ```bash
   # Start backend server
   cd backend
   npm run dev

   # Start frontend server (in a new terminal)
   cd frontend
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development

- Frontend code is in the `/frontend` directory
- Backend code is in the `/backend` directory
- Environment configuration is in `/config`
- Database configuration and migrations are in `/backend/db`

## Deployment

The application is configured for deployment on Railway. Follow these steps:

1. Connect your GitHub repository to Railway
2. Configure environment variables in Railway dashboard
3. Deploy using the Railway CLI or automatic deployments

## Deployment Guide

### Prerequisites
1. Railway account (https://railway.app)
2. Railway CLI installed (`npm i -g @railway/cli`)
3. Git repository pushed to GitHub

### Deployment Steps

#### 1. MongoDB Setup
1. Log in to Railway Dashboard
2. Create a new project
3. Add MongoDB service from the "New Service" menu
4. Save the MongoDB connection string from the "Connect" tab

#### 2. Backend Deployment
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Initialize Railway project:
   ```bash
   railway init
   ```
3. Link to the existing project:
   ```bash
   railway link
   ```
4. Add environment variables:
   ```bash
   railway vars set \
     MONGODB_URI="your_mongodb_connection_string" \
     NODE_ENV="production" \
     OPENAI_API_KEY="your_openai_key" \
     SUPABASE_URL="your_supabase_url" \
     SUPABASE_KEY="your_supabase_key"
   ```
5. Deploy the backend:
   ```bash
   railway up
   ```

#### 3. Frontend Deployment
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Initialize Railway project:
   ```bash
   railway init
   ```
3. Link to the existing project:
   ```bash
   railway link
   ```
4. Add environment variables:
   ```bash
   railway vars set \
     VITE_API_URL="your_backend_url" \
     VITE_SUPABASE_URL="your_supabase_url" \
     VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"
   ```
5. Deploy the frontend:
   ```bash
   railway up
   ```

### Post-Deployment
1. Configure domains in Railway Dashboard for both frontend and backend services
2. Update CORS settings in backend to allow the new frontend domain
3. Test the application thoroughly
4. Monitor logs and performance in Railway Dashboard

### Maintenance
- Monitor application logs through Railway Dashboard
- Set up alerts for service health
- Regularly update dependencies and redeploy
- Monitor MongoDB performance and scaling needs

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 