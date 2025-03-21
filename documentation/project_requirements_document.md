# Project Requirements Document

## 1. Project Overview

This project is an interactive English learning application designed specifically for Hebrew-speaking children aged 5 to 12. The app uses speech recognition to convert spoken English into text and employs AI agents to provide real-time feedback, explanations, and encouragement. The goal is to create a fun, engaging, and supportive learning environment that encourages children to practice their spoken English naturally and confidently.

The application is built to address the core challenge of making language learning accessible and enjoyable for young learners. By leveraging cutting-edge speech processing and AI technology, it delivers personalized guidance and corrections. Success in this project will be measured by the effectiveness of capturing natural speech, the accuracy and appropriateness of AI feedback, user engagement, and overall improvement in language proficiency.

## 2. In-Scope vs. Out-of-Scope

**In-Scope:**

*   Development of a responsive user interface using React with TypeScript and Chakra UI.

*   Implementation of speech-to-text functionality using the Web Speech API.

*   Integration of real-time feedback and voice modulation using the Web Audio API.

*   Development of a multi-agent system including:

    *   Classification Agent: Determines if input is conversation, vocabulary-based, or a question.
    *   Conversation Agent: Facilitates natural dialogue with adjustments, corrections, and simplifications.
    *   Vocabulary Agent: Provides definitions and example sentences in both English and Hebrew.

*   Theming feature that changes both UI appearance and voice characteristics (e.g., friendly panda vs. Darth Vader).

*   User authentication through Google Sign-In and profile management with progress tracking.

*   Backend API using Node.js with Express, and database integration with MongoDB (hosted on Railway) alongside Supabase for user management.

*   Deployment on the Railway platform.

*   Graceful error handling to display user-friendly messages in case of delays or issues with external AI services.

**Out-of-Scope:**

*   Parental control or progress reporting features; no additional parental oversight functionality is planned for the first release.
*   Offline functionality; the application requires consistent Internet connectivity due to reliance on AI and speech processing APIs.
*   Advanced gamification or reward systems; while the application is engaging, it will not include extra gamification elements like points or reward systems in phase one.
*   Accessibility adjustments for special needs beyond the basic child-friendly design.

## 3. User Flow

When a child or parent opens the app, they are warmly welcomed by a colorful interface showcasing character avatars themed as either a friendly panda or Darth Vader. The user is prompted to sign in using the Google Sign-In feature, which streamlines the onboarding process while keeping the language simple and age-appropriate. After authentication, the child is briefly introduced to the app’s purpose and functionality.

Post-login, the user lands on the main learning interface. Here, a large, clearly labeled recording button invites the child to speak. As the child speaks, their English is processed through the Web Speech API, instantly converting their speech into text on the screen. The application then routes this input through a multi-agent system: a classification agent decides whether the input is for conversation or vocabulary inquiry, and one of the specialized agents provides age-appropriate feedback, corrections, or explanations. The UI includes simple navigation elements and options to switch themes, ensuring that each interaction is both intuitive and engaging while tracking the child’s progress.

## 4. Core Features

*   **Speech-to-Text Conversion:**\
    Uses the Web Speech API to capture spoken English and display real-time textual transcription, allowing children to see their words and correct them if needed.

*   **Multi-Agent System:**

    *   *Classification Agent:* Analyzes the input type (conversation, vocabulary, or question) and directs it to the correct processing agent.
    *   *Conversation Agent:* Engages the child in conversation, adjusts language complexity, and offers gentle corrections, all in an age-appropriate manner.
    *   *Vocabulary Agent:* Provides clear definitions and examples in both English and Hebrew to help enrich the child’s vocabulary.

*   **User Interface and Theming:**\
    Features a child-friendly design using React, TypeScript, and Chakra UI. Offers themes that not only change the visual look (e.g., Panda or Darth Vader) but also alter the tone of voice modulation to match the selected theme.

*   **User Profiles and Progress Tracking:**\
    Supports multiple user profiles to track individual learning paths, including progress in pronunciation and vocabulary development. Progress is visually represented through simple progress indicators.

*   **Error Handling and Resilience:**\
    Implements mechanisms to monitor external AI services (e.g., GPT-3.5-Turbo via OpenAI and Anthropic Claude). In cases of significant delays or unresponsiveness, a clear and reassuring error message is displayed.

*   **Voice Interaction and Modulation:**\
    Integrates the Web Audio API to apply voice effects that correspond to the selected theme, ensuring that the auditory feedback is engaging and consistent with the visual design.

*   **User Authentication:**\
    Integrates Google Sign-In for secure and easy user access, leveraging Supabase for authentication and user management.

## 5. Tech Stack & Tools

*   **Frontend:**

    *   Framework: React with TypeScript
    *   UI Library: Chakra UI for a responsive and child-friendly interface
    *   Browser APIs: Web Speech API for speech recognition and Web Audio API for voice modulation effects

*   **Backend:**

    *   Language & Framework: Node.js with Express for building a RESTful API
    *   Database: MongoDB for data storage (hosted on Railway)
    *   User Management: Supabase for managing user authentication and profiles

*   **AI Agents & Libraries:**

    *   Uses a custom lightweight multi-agent framework inspired by AWS Labs' multi-agent-orchestrator
    *   Integrates AI models/APIs: OpenAI GPT-3.5-Turbo and Anthropic Claude for processing natural language inputs

*   **Deployment:**

    *   Platform: Railway for hosting and continuous deployment

*   **IDE & Plugins:**

    *   Cursor as an advanced IDE tool for AI-powered coding with real-time suggestions

## 6. Non-Functional Requirements

*   **Performance:**

    *   The app should process speech-to-text and provide real-time AI feedback with minimal latency.
    *   Acceptable minor delays are allowed, but if external API responses take too long, the system must display clear error messages promptly.

*   **Security:**

    *   Secure handling of user data through Supabase authentication and MongoDB data storage.
    *   Use standard security practices for API communication and data encryption.

*   **Reliability:**

    *   The application should maintain a high uptime, and gracefully handle errors or slow responses from AI services.
    *   Must be responsive and consistent across mobile, tablet, and desktop devices.

*   **Usability:**

    *   The interface is designed to be intuitive for young users with simple navigation and clear visual cues.
    *   Auditory and visual feedback should align with the chosen themes to enhance engagement.

*   **Compliance:**

    *   Although special compliance measures (e.g., COPPA) are not specifically required, ensure data handling follows best practices for child users.

## 7. Constraints & Assumptions

*   The application requires a constant Internet connection due to the reliance on external AI APIs (OpenAI GPT-3.5-Turbo and Anthropic Claude) and speech processing services.
*   It assumes that the selected external AI and speech APIs are available and respond within acceptable timeframes.
*   The system is designed for Hebrew-speaking children with no additional parental control or advanced gamification features planned for the first release.
*   Voice modulation must reflect the selected themes accurately, whether that results in a friendly panda tone or a deep Darth Vader-inspired voice.
*   Developers assume that all UI elements, speech, and audio functionalities are optimally supported by major modern browsers.

## 8. Known Issues & Potential Pitfalls

*   **External API Delays:**\
    There may be instances where external AI services (OpenAI and Anthropic Claude) may be slow or unresponsive. To mitigate this, the app will allow for slight delays but will display an error message if the response time becomes excessively long.
*   **Speech Recognition Accuracy:**\
    Speech-to-text accuracy could be affected by background noise, accent variations, or unclear pronunciation. Consider implementing additional noise filtering or encouraging the use of headphones in noisier environments if needed.
*   **UI/UX for Young Audiences:**\
    The user interface must be extremely intuitive given the young demographic. Continuous user testing and feedback should be used to refine the experience and avoid any navigational or comprehension issues.
*   **Voice Modulation Matching Themes:**\
    There is potential complexity in accurately modulating the voice to match different themes. Ensure clear guidelines and testing scenarios are in place to consistently deliver the right voice effects.
*   **Data Consistency:**\
    Synchronizing user progress and multiple authentication sources (e.g., Google Sign-In and Supabase) might pose data consistency challenges. Rely on robust database schema and testing to handle potential synchronization issues.

This document serves as the comprehensive blueprint for the AI model and development teams to build subsequent technical documentation. Each section is designed to be easily understood and implemented, ensuring a smooth development process without ambiguity.
