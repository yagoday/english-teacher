# Backend Structure Document

This document describes the backend setup of our interactive English learning app designed for Hebrew-speaking children. It covers the general backend architecture, database management, API design, hosting environment, infrastructure components, security strategies, and monitoring practices. The goal is to ensure that even those without technical expertise understand how everything works together to create a smooth and scalable experience.

## 1. Backend Architecture

*   **Architecture Overview**

    *   The backend is built using Node.js with the Express framework, exposing a RESTful API. This enables clear separation between business logic and client-facing endpoints.
    *   The implementation includes a custom multi-agent framework. It is composed of different agents like the Classification, Conversation, and Vocabulary agents working together to process and respond to user inputs.
    *   Real-time streaming capabilities have been integrated so that users receive near-instant feedback on their spoken English.

*   **Design Principles**

    *   **Scalability:** The use of Node.js with lightweight Express routes and non-blocking architecture ensures that the system can handle an increasing number of simultaneous users.
    *   **Maintainability:** The clear separation of modules (such as different agents for handling conversation, vocabulary, etc.) ensures that future changes or feature additions can be made with minimal disruption.
    *   **Performance:** The real-time streaming between the app and the backend, along with optimized data retrieval (thanks to MongoDB’s document model), guarantees low latency and robust performance.

## 2. Database Management

*   **Database Technologies**

    *   **MongoDB (on Railway):** The app uses MongoDB to store user profiles, conversation logs, progress data, and other interaction records. The document-based storage model is a perfect match for dynamic and semi-structured data.
    *   **Supabase:** Used for user authentication. It handles secure sign-ins (including Google sign-in) and ensures that user data is protected at all times.

*   **Data Structure and Access**

    *   Data is stored in collections as JSON documents, which means it can be easily expanded or adapted to changing requirements.
    *   Data management practices include regular backups, indexing for quick querying, and using robust querying methodologies native to MongoDB.

## 3. Database Schema

Since we are using a NoSQL database (MongoDB), our data schema is designed to be flexible with JSON-style documents. Below is a human-readable description of our key collections:

*   **Users Collection**

    *   Contains user information such as unique user ID, authentication details, profile data, and historical progress information.
    *   Fields include: userId, email, name, progress, createdAt, updatedAt, and authentication tokens.

*   **Conversations Collection**

    *   Stores logs of conversations for quality improvement, real-time analysis, and user progress tracking.
    *   Fields include: conversationId, userId (referencing the user), message history, timestamps, and sentiment analysis data (if applicable).

*   **Vocabulary Collection**

    *   Holds vocabulary items, definitions, translations (English & Hebrew), and related metadata.
    *   Fields include: vocabId, word, definitionEnglish, definitionHebrew, usage examples, and lastUpdated timestamps.

*   **Agent Logs Collection**

    *   Keeps track of requests and responses from the AI agents (Classification, Conversation, Vocabulary) for debugging and analytics.
    *   Fields include: logId, agentType, requestPayload, responsePayload, status, and timestamp.

## 4. API Design and Endpoints

*   **API Design**

    *   We use a RESTful API design built on Express. This approach makes it easy to integrate new endpoints or modify existing ones and ensures the frontend can communicate smoothly with the backend.

*   **Key Endpoints**

    *   **/api/speech-to-text**: Receives audio input from the Web Speech API and converts it into text.
    *   **/api/conversation**: Manages the dialogue between the user and the AI agents by processing user input and returning modified or supplemented text responses.
    *   **/api/vocabulary**: Serves definitions, translations, and example usages for vocabulary items.
    *   **/api/user**: Deals with user profile management, including registration, login (using Google Sign-In via Supabase), and progress tracking.
    *   **/api/error**: Provides a unified error handling route to manage slow or unresponsive AI agents and relay user-friendly error messages.

## 5. Hosting Solutions

*   **Hosting Environment**

    *   Our backend (Node.js/Express application) and MongoDB are hosted on Railway. Railway offers a cloud-based platform that simplifies deployment, scaling, and managing our database as well as the server process.

*   **Benefits**

    *   **Reliability:** Railway’s managed services offer high uptime and systems designed to handle sudden changes in load.
    *   **Scalability:** As user demand grows, Railway makes it easy to scale both the application servers and the database.
    *   **Cost-Effectiveness:** The pay-as-you-go model and efficient resource allocation provide a budget-friendly hosting solution.

## 6. Infrastructure Components

*   **Load Balancers:** Automatically handled by Railway’s hosting environment to distribute incoming requests evenly across our backend instances.
*   **Caching Mechanisms:** While not explicitly detailed, caching strategies (such as in-memory caching via Redis) can be incorporated to reduce latency and speed up frequently accessed data.
*   **Content Delivery Network (CDN):** Though mainly used for static content, a CDN can help optimize delivery of media-rich assets, especially for voice modulation resources.
*   **Authentication Service:** Supabase plays a role in securely managing user authentication data, ensuring that access to the backend is controlled and monitored.

## 7. Security Measures

*   **User Authentication & Authorization**

    *   Secure authentication is managed via Supabase, which includes Google Sign-In as an option. This provides a secure and user-friendly sign-in experience.
    *   Role-based access control is enforced so that only authorized users can access or modify data.

*   **Data Protection and Encryption**

    *   All user data is transmitted over secure channels (HTTPS). Sensitive data in the database is encrypted and access is strictly controlled.
    *   Regular security audits and compliance checks are performed to ensure that all data is handled according to the latest best practices.

*   **Error Handling:**

    *   The backend includes error management routes that catch and log errors, allowing for quick mitigation and clear user feedback if AI services are slow or unresponsive.

## 8. Monitoring and Maintenance

*   **Monitoring Tools:**

    *   Railway offers built-in monitoring tools to track the performance, uptime, and health of our application.
    *   Additional logging services and performance dashboards help ensure that any bottlenecks or errors are promptly identified and resolved.

*   **Maintenance Strategies:**

    *   Regular updates to dependencies and platforms (Node.js, MongoDB, etc.) keep the system secure and efficient.
    *   Scheduled performance reviews and load testing ensure that the backend continues to meet the project’s performance and reliability targets.

## 9. Conclusion and Overall Backend Summary

*   The backend of our interactive English learning app is designed with a clear, modular architecture using Node.js and Express, ensuring high performance and scalability.
*   MongoDB on Railway provides a flexible and efficient data storage solution, while the RESTful API guarantees smooth communication between the frontend and backend.
*   Hosting on Railway, combined with integrated services like Supabase for authentication, offers reliability, scalability, and overall cost-effectiveness.
*   Security, monitoring, and error handling are built into every level of the backend, ensuring that the system remains robust and responsive, even during peak usage.
*   Unique elements like the multi-agent system and theme-based voice modulation set this project apart from traditional language learning applications.

This comprehensive structure supports our goal of providing a seamless, real-time learning experience that is both intuitive for young users and robust against the technical challenges of real-time processing and AI integration.
