# Implementation Plan (Revised)

## Phase 1: Environment Setup

1.  Create a new Git repository for the project and initialize directories for `/frontend` and `/backend`. (Reference: Project Overview - Application Structure)
2.  Install Node.js (latest LTS) and ensure npm is available. Run `node -v` and `npm -v` to validate installations. (Reference: Tech Stack - Backend Tools)
3.  Set up a shared environment configuration file at `/config/.env` for storing API keys and environment variables. (Reference: Tech Stack - Deployment)
4.  Configure a Railway account and note the connection details for MongoDB and deployment. (Reference: Tech Stack - Deployment)

## Phase 2: Local Database Setup

1.  **Docker Setup for MongoDB**: Create a Docker Compose file at the project root to run a local MongoDB instance:

`version: '3.1' services: mongodb: image: mongo:latest container_name: local-mongo environment: MONGO_INITDB_ROOT_USERNAME: admin MONGO_INITDB_ROOT_PASSWORD: password ports: - "27017:27017"`

(Reference: Additional Context - Local Development)

1.  **Validation**: Ensure Docker is running. Execute `docker-compose up` in the command line and verify that MongoDB starts correctly by connecting with a tool like MongoDB Compass. Validate the connection using credentials from the Docker Compose file. (Reference: Q&A - Connectivity)

## Phase 3: Frontend Development

1.  In the `/frontend` directory, set up a new React project with TypeScript using the command: `npx create-react-app . --template typescript`. (Reference: Tech Stack - Frontend)
2.  Install Chakra UI and its dependencies by running: `npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion`. (Reference: Tech Stack - Frontend)
3.  Integrate the Web Speech API and Web Audio API as these are native to browsers; include necessary polyfills if needed. (Reference: Core Features - Speech-to-Text, Voice Modulation)
4.  Create the main learning interface component at `/frontend/src/components/MainLearningInterface.tsx` which will include the recording feature, display of speech-to-text, and streaming responses. (Reference: App Structure/Flow - Main Learning Interface)
5.  In `/frontend/src/components/RecordingFeature.tsx`, implement a recording button that uses the Web Speech API to capture spoken English. (Reference: Core Features - Speech-to-Text)
6.  Add noise filtering logic (using simple audio processing techniques) within the recording component to improve speech-to-text accuracy. (Reference: Important Considerations - Speech-to-text Accuracy)
7.  Create a theme selector component at `/frontend/src/components/ThemeSelector.tsx` that allows the user to choose between the Panda theme and the Darth Vader theme. (Reference: Core Features - Theme Customization)
8.  Develop a voice modulation module inside `/frontend/src/utils/voiceModulation.ts` that uses the Web Audio API to adjust voice output based on the selected theme (friendly for Panda and deep for Darth Vader). (Reference: Implementation Plan Focus Points - Voice Modulation)
9.  Build a streaming responses component at `/frontend/src/components/StreamingFeedback.tsx` that displays continuous AI responses. (Reference: Core Features - Continuous Interaction)
10. Create an API service file at `/frontend/src/services/api.ts` to abstract API calls to the backend using axios. (Reference: App Structure/Flow - Integration)
11. **Validation**: Run the frontend server with `npm start` and verify that the basic UI, recording button, and theme selector render properly. (Reference: Q&A - Pre-Launch Checklist)

## Phase 4: Backend Development

1.  In the `/backend` directory, initialize a new Node.js project with `npm init -y` and install Express with `npm install express`. (Reference: Tech Stack - Backend)

2.  Create the main application file `/backend/index.js` and set up a basic Express server. (Reference: Tech Stack - Backend)

3.  Define middleware for JSON parsing in `/backend/index.js` by adding `app.use(express.json())`. (Reference: Tech Stack - Backend)

4.  Create an API endpoint at `/backend/routes/aiAgents.js` to handle AI requests, including the multi-agent system. (Reference: Core Features - Multi-Agent System)

5.  Inside `/backend/routes/aiAgents.js`, implement three endpoints:

    *   `POST /api/ai/classify` for routing input classification.
    *   `POST /api/ai/conversation` for conversation-based interactions.
    *   `POST /api/ai/vocabulary` for vocabulary definitions and examples. (Reference: Core Features - Multi-Agent System)

6.  In `/backend/config/db.js`, set up the MongoDB connection using the connection string from your local Docker MongoDB instance (e.g., `mongodb://admin:password@localhost:27017`). (Reference: Tech Stack - Backend/MongoDB)

7.  **Validation**: Create and run a simple script `node /backend/config/db.js` to verify a successful connection to MongoDB. (Reference: Q&A - Connectivity)

8.  Integrate Supabase for authentication: install the Supabase client with `npm install @supabase/supabase-js` and create `/backend/auth/supabaseClient.js` to initialize it using your Supabase project credentials. (Reference: Tech Stack - Backend, Supabase Integration)

9.  In `/backend/routes/auth.js`, implement endpoints for user registration and Google Sign-In integration using Supabase. (Reference: Core Features - User Profiles)

10. **Validation**: Test the authentication endpoints using Postman or curl to ensure sign-in and registration work as expected. (Reference: Q&A - Authentication)

11. Develop the multi-agent orchestration system in `/backend/agents/`. Create separate modules:

    *   `/backend/agents/ClassificationAgent.js`
    *   `/backend/agents/ConversationAgent.js`
    *   `/backend/agents/VocabularyAgent.js` Use the OpenAI GPT-3.5-Turbo and Anthropic Claude APIs for natural language processing. (Reference: Core Features - Multi-Agent System; Implementation Plan Focus Points - API Responsiveness)

12. **Validation**: Write and execute unit tests in `/backend/tests/agents.test.js` to simulate agent responses and verify correct routing of requests. (Reference: Q&A - Testing)

## Phase 5: Integration and Local Testing

1.  In the frontend service file `/frontend/src/services/api.ts`, add axios calls for each backend endpoint (recording submission, AI agent interactions, and auth flows). (Reference: App Structure/Flow - Integration)
2.  Update the main learning interface component to connect the recording feature with the `/api/ai/*` endpoints using the API service. (Reference: Core Features - Continuous Interaction)
3.  Connect the theme selector to the voice modulation module so that changing the theme updates the modulation behavior in real time. (Reference: Implementation Plan Focus Points - Voice Modulation)
4.  Implement frontend error handling to catch API delays or failures and display user-friendly error messages. (Reference: Implementation Plan Focus Points - API Responsiveness)
5.  **Validation**: Run an end-to-end test locally using a local server for backend and frontend connected to your local Docker MongoDB instance. A user should be able to record speech, the transcription is sent to the backend, and AI feedback is streamed back to the UI. Verify that theme selection correctly alters voice modulation. (Reference: Q&A - End-to-End Testing)

## Phase 6: Deployment

1.  In the `/deployment` directory, create a Railway configuration file `railway.yaml` with settings for both the backend and MongoDB deployment. (Reference: Tech Stack - Deployment)
2.  Build the production version of the frontend by running `npm run build` in the `/frontend` directory. (Reference: Tech Stack - Frontend)
3.  Prepare the backend for deployment by ensuring the environment variables in `/config/.env` are set correctly for production. (Reference: Tech Stack - Deployment)
4.  Deploy the backend to Railway by connecting your GitHub repository to Railway and using the `railway.yaml` configuration. (Reference: Tech Stack - Deployment)
5.  Deploy the frontend to Railway or another static hosting service, ensuring the build output from `/frontend/build` is served correctly, and configure a reverse proxy if needed. (Reference: Tech Stack - Deployment)
6.  **Validation**: After deployment, visit the production URL, perform a complete user flow test (record speech, theme change, and receive AI feedback) and verify that error handling for API delays displays appropriate messages. (Reference: Q&A - Pre-Launch Checklist)
