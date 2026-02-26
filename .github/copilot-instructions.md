# Copilot Instructions for AmethPong Codebase

## Overview
This document provides essential guidance for AI coding agents working within the AmethPong codebase. Understanding the architecture, workflows, and conventions is crucial for effective contributions.

## Architecture
- **Components**: The application is divided into several key components, including the frontend, platform API, game API, and nginx configurations. Each component has its own directory under `src/`.
- **Service Boundaries**: The frontend communicates with the platform and game APIs, which handle different aspects of the application logic. The `src/front/app/src/routes.ts` file defines the routing structure, ensuring that user navigation is handled correctly.
- **Data Flows**: Data is primarily exchanged between the frontend and backend services via RESTful APIs. Services like `RelationService` and `UserEditService` manage user-related data and interactions.

## Developer Workflows
- **Building the Application**: Use the Makefile to build the application. Run `make up` for development or `make prod` for production builds. This will set up the necessary Docker containers and volumes.
- **Testing**: Each module has its own testing setup. For the frontend, navigate to `src/front/app` and run `npm test` to execute tests using Vitest. The platform and game APIs follow similar procedures.
- **Debugging**: Utilize the built-in logging and error handling mechanisms. The Fastify server in the platform API provides detailed error responses that can be logged for debugging purposes.

## Project-Specific Conventions
- **File Naming**: Follow camelCase for JavaScript/TypeScript files and PascalCase for class names. HTML files should use kebab-case.
- **Service Patterns**: Services like `RelationService` and `UserEditService` encapsulate API calls and business logic. They should be used consistently across components to maintain a clean architecture.

## Integration Points
- **External Dependencies**: The project relies on several external libraries, including Fastify for the API, Vite for the frontend build process, and Vitest for testing. Ensure these are correctly installed and configured in your local environment.
- **Cross-Component Communication**: Components communicate through well-defined APIs. For example, the `RelationService` handles friend-related operations, while the `UserEditService` manages user profile updates.

## Key Files and Directories
- **Frontend**: `src/front/app` - Contains all frontend components and services.
- **Platform API**: `src/platform/api` - Contains the backend logic and API routes.
- **Game API**: `src/game/api` - Manages game-related functionalities.
- **Nginx Configurations**: `src/nginx` - Contains configurations for serving the application.

## Conclusion
This document should serve as a foundational guide for AI agents working within the AmethPong codebase. For any unclear sections or additional details needed, please provide feedback for further iterations.