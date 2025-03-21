# Tech Stack Document

This document explains in everyday language the technology choices for our interactive English learning app. Each section below breaks down how different parts of our app work together and why we chose them.

## Frontend Technologies

Our frontend is all about creating a fun, responsive, and child-friendly experience. Here are the key components:

*   **React with TypeScript**:

    *   React is a popular framework for building dynamic web pages. We use it to create a smooth and responsive interface that works across mobile, tablet, and desktop devices.
    *   TypeScript adds a layer of safety by catching errors early in the development process, ensuring a more robust application.

*   **Chakra UI**:

    *   This library provides pre-built UI components that are both visually appealing and easy to use, making our design child-friendly and engaging.

*   **Web Speech API**:

    *   This is used to capture the child's spoken English and convert it into text in real time. It helps make the learning experience interactive by allowing voice input.

*   **Web Audio API**:

    *   Complementing the speech recognition, this API is used for voice effects. It lets us modify the voice output so that it matches the chosen theme – for example, a friendly panda tone or a deep Darth Vader-inspired voice.

## Backend Technologies

The backend is the engine behind the app, ensuring all data and communications work smoothly. Here’s what we use:

*   **Node.js with Express**:

    *   Node.js allows us to run JavaScript on the server side. Express is a lightweight framework that helps us handle web requests easily. Together, they form a RESTful API that processes data and communicates with the frontend.

*   **MongoDB**:

    *   This NoSQL database stores data such as user progress and profiles. Its flexibility means we can easily manage the various types of data our app creates, and it is hosted on Railway.

*   **Supabase**:

    *   Used for user authentication and profile management. It integrates seamlessly to handle Google Sign-In and ensures user details are secure and easily managed.

*   **AI Agents Integration**:

    *   Our multi-agent system is a custom lightweight framework inspired by AWS Labs' multi-agent orchestration.
    *   **OpenAI GPT-3.5-Turbo** and **Anthropic Claude** APIs are used to process language inputs and provide real-time feedback, corrections, and explanations tailored for the app’s young users.

## Infrastructure and Deployment

Reliability and ease of deployment are vital for our app. Here’s the setup:

*   **Railway**:

    *   Our app is hosted on Railway. This platform makes it easy to deploy, update, and scale the application as we add more features or as user numbers grow.

*   **CI/CD Pipelines & Version Control**:

    *   Although specific tools for continuous integration and deployment are managed via Railway, we also rely on standard version control practices (for example, through Git) to track changes and ensure smooth updates.

*   **Cursor**:

    *   We use the Cursor IDE, an advanced coding tool with real-time suggestions, making the coding process smoother and helping the development team catch issues early.

## Third-Party Integrations

To ensure a seamless and familiar experience for our users, we integrate several services:

*   **Google Sign-In**:

    *   Makes it simple for users to log in securely and quickly, which is especially important for young learners and their parents.

*   **External AI Services**:

    *   **OpenAI GPT-3.5-Turbo** and **Anthropic Claude** are integrated for natural language processing. They allow the app to offer natural, real-time feedback that feels like a conversation.

## Security and Performance Considerations

We’ve built the tech stack keeping safety and speed in mind:

*   **User Authentication & Data Security**:

    *   By using Supabase for user management, we make sure that login information is securely handled. MongoDB also stores user data in a secure manner.

*   **Error Handling**:

    *   Our system monitors external API responses. If services like OpenAI or Anthropic Claude are too slow or unresponsive, the app displays a clear, user-friendly error message so that children aren’t confused or frustrated.

*   **Performance Optimization**:

    *   The combination of React, lightweight voice APIs, and well-integrated AI agents ensures our app processes voice input and feedback quickly, keeping delays minimal and the experience smooth.

## Conclusion and Overall Tech Stack Summary

To sum up, our technology choices are carefully selected to support an engaging and easy-to-use English learning experience for Hebrew-speaking children:

*   **Frontend**: React with TypeScript, Chakra UI, Web Speech API, and Web Audio API ensure that the interface is engaging, responsive, and fun.
*   **Backend**: Node.js with Express, MongoDB, and Supabase work together to manage data and provide a secure and scalable environment. AI agents powered by OpenAI and Anthropic Claude enrich the learning experience with real-time feedback.
*   **Infrastructure and Deployment**: Hosting on Railway, along with CI/CD benefits and the use of a smart IDE (Cursor), ensures that we can maintain and scale the app efficiently.
*   **Third-Party Integrations**: Google Sign-In and AI processing APIs add an extra layer of convenience and intelligence to the app without complicating the user experience.
*   **Security and Performance**: Thoughtful error handling and performance optimizations keep the app safe, secure, and consistently fast.

Overall, every component of our tech stack is aimed at making the learning journey as seamless, friendly, and effective as possible for our young users.
