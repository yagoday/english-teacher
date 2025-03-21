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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 