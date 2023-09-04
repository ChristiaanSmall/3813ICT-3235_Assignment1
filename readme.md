# Chat Application with MEAN Stack, Socket.io, and Peer.js

## Table of Contents

1. [Architecture of the Application](#architecture-of-the-application)
    - [Backend](#backend)
    - [Frontend](#frontend)
    - [Database](#database)
2. [Roles and Their Permissions](#roles-and-their-permissions)
    - [Super Admin](#super-admin)
    - [Group Admin](#group-admin)
    - [User](#user)
3. [Managing State and Data](#managing-state-and-data)
4. [Git Repository Structure and Branching Strategy](#git-repository-structure-and-branching-strategy)
    - [Repository Structure](#repository-structure)
    - [Branching Strategy](#branching-strategy)

## Architecture of the Application

### Backend:

- **NodeJS** and **Express**: To handle the server-side logic and API routes.
- **Socket.io**: For real-time communication between client and server.
- **Peer.js**: For handling video chat functionality (to be implemented in Phase 2).

### Frontend:

- **Angular**: For building the client-side application.
- **Angular Services**: To manage state and API calls.

### Database:

- **MongoDB**: For storing user, groups, and chat data (to be implemented in Phase 2).

## Roles and Their Permissions

### Super Admin:

- Can create, remove, and modify any groups or channels.
- Can promote a user to a Group Admin.
- Can remove any chat user.
- Can view all groups.

### Group Admin:

- Can create new groups and channels within those groups.
- Can remove users from groups they administer.
- Can only modify/delete a group they created.

### User:

- Can join/leave groups and channels.
- Can send/receive messages in channels they are a part of.
- Cannot create or remove groups or channels.

## Managing State and Data

- **Frontend**: Angular Services will manage the state on the client side.
- **Backend**: NodeJS with Express will handle the server-side state.
- **Data Storage**: Local storage will be used in Phase 1 and MongoDB will be used in Phase 2 for persistent data storage.

## Git Repository Structure and Branching Strategy

### Repository Structure:

- `/backend`: All backend code including server and API routes.
- `/frontend`: All frontend Angular code.
- `/models`: Database models (for Phase 2).
- `README.md`: Project documentation.

### Branching Strategy:

- `main`: The main branch where the final version of the code will live.
- `development`: A branch off of `main` where most of the development will happen.
- `feature/*`: Feature branches for new features or bug fixes. Merged back into `development` when complete.

#### Workflow:

1. Create a new feature branch from `development`.
2. Work on the feature and commit changes.
3. Once the feature is complete, merge it back into `development`.
4. When all features for a release are complete, merge `development` into `main`.
