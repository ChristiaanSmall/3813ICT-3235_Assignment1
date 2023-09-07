# 3813ICT-3235_Assignment1 - Chat System

## Repository Structure

This repository contains both server-side and client-side code. These are organized into separate folders to provide clarity.

## Branching Strategy: Feature Branching

Each branch in the repository is a feature branch, dedicated to implementing a specific aspect of the chat system:

### Feature Branches

1. **UI**: 
   - Focuses on the User Interface for different roles (Super Admin, Group Admin, Users) as well as how the UI looks to keep a professional look.

2. **register**: 
   - Implements the user registration process, including form validation and initial role assignment.

3. **channels**: 
   - Manages functionalities for chat channels within groups.

4. **ban-users-from-group**: 
   - Enables Group Admins to ban or remove users from groups.

5. **User-Requests**: 
   - Handles incoming user requests for joining groups and the subsequent admin approval process.

6. **Base-UI-and-Routing**: 
   - Establishes the foundational user interface and routing configurations.

## Update Frequency

Multiple commits are made to various feature branches each day, indicating an agile and active development process.

## Frontend/Backend Code Organization

Frontend code, developed using Angular, and backend code, built on Node.js with Express, are organized into distinct folders within the repository.

# Data Structures

## Users

- `id`: String - Unique identifier for each user.
- `username`: String - The username for login.
- `password`: String - The password for login.
- `email`: String - Email associated with the user.
- `role`: String - Specifies if the user is a 'Super Admin', 'Group Admin', or 'User'.
- `groups`: Array of Strings - IDs of groups that the user belongs to.

## Groups

- `id`: String - Unique identifier for each group.
- `name`: String - The name of the group.
- `channels`: Array of Channel objects - Contains the channels within the group.
- `admins`: Array of Strings - IDs of users who are administrators of the group.
- `members`: Array of Strings - IDs of users who are members of the group.
- `requests`: Array of Strings - IDs of users who have requested to join the group.

## Channels

- `name`: String - Name of the individual channel within a group.
- `messages`: Array - Contains the messages sent within the channel.

---


# Angular Architecture

## Components

### LoginComponent
Responsible for providing the login interface to the user. Validates user credentials and routes the user to the dashboard upon successful authentication.

### DashboardComponent
Serves as the landing page after login, offering an overview of groups and channels available to the user based on their role and permissions.

### ChatWindowComponent
This component is where the real-time chat happens. It displays messages for a specific channel within a specific group.

### GroupChannelsComponent
Displays all channels within a specific group and allows for navigation between them.

### RegisterComponent
Provides a form for new user registration. Validates input fields and communicates with the `AuthService` for creating a new user.

## Services

### AuthService
A singleton service that serves as the communication bridge between the Angular application and the server-side API. All HTTP requests are funneled through this service.

### Models

The models mirror the server-side data structures:

#### User
  id: String,
  username: String,
  password: String,
  email: String,
  role: String,
  groups: Array of Strings

#### Groups
  id: String,
  name: String,
  channels: Array of Channel objects,
  admins: Array of Strings,
  members: Array of Strings,
  requests: Array of Strings


#### Channels
  name: String,
  messages: Array

### Routes

## Routes

### `/login`
Navigates the user to the `LoginComponent` where they can enter their credentials.

### `/dashboard`
Takes the user to the `DashboardComponent` where they can see an overview of available groups and channels.

### `/group/:groupId/channel/:channelId`
Dynamic route that takes the user to the `ChatWindowComponent` for chatting within a specific channel and group.

### `/group-channels/:groupId`
Dynamic route that directs the user to the `GroupChannelsComponent` where they can see all channels within a specific group.

### `/register`
Leads to the `RegisterComponent` where new users can register.

### `**`
Catches all undefined paths and redirects the user to the `LoginComponent`.

## User Routes

### `POST /api/authenticate`

- **Purpose**: Authenticate user credentials.
- **Request Body**: JSON containing `username` and `password`.
- **Response**: JSON containing user details on success; 401 Unauthorized with message 'Authentication failed' on failure.
- **Use-Case**: User login.

---

### `GET /api/currentUser`

- **Purpose**: Get current authenticated user information.
- **Response**: JSON containing current user details on success; 401 Unauthorized with message 'No current user' on failure.
- **Use-Case**: Fetch current user details for session management.

---

### `POST /api/register`

- **Purpose**: Register a new user.
- **Request Body**: JSON containing `username`, `password`, and `email`.
- **Response**: JSON containing new user details on success; 400 Bad Request with message 'Username or email already exists' on failure.
- **Use-Case**: User registration.

---

### `POST /api/promoteToSuperAdmin`

- **Purpose**: Promote a user to Super Admin role.
- **Request Body**: JSON containing `username`.
- **Response**: JSON message 'User promoted to Super Admin' on success; 404 Not Found with message 'User not found' on failure.
- **Use-Case**: Administrative elevation of a user.

---

### `GET /api/users`

- **Purpose**: Get all users.
- **Response**: JSON array containing all users.
- **Use-Case**: Fetch all users for administrative purposes.

---

### `GET /api/users/:id`

- **Purpose**: Get user information based on user ID.
- **Response**: JSON containing user details on success; 404 Not Found with message 'User not found' on failure.
- **Use-Case**: Fetch specific user details.

---

### `DELETE /api/users/:username`

- **Purpose**: Delete a user based on username.
- **Response**: JSON message 'User account deleted successfully' on success; 404 Not Found with message 'User not found' on failure.
- **Use-Case**: Delete a user account.

---

## Group Routes

### `GET /api/groups`

- **Purpose**: Get all groups.
- **Response**: JSON array containing all groups.
- **Use-Case**: Fetch all groups for dashboard or administrative purposes.

---

### `DELETE /api/groups/:groupId`

- **Purpose**: Delete a group by its ID.
- **Response**: JSON message 'Group deleted successfully' on success; 404 Not Found with message 'Group not found' on failure.
- **Use-Case**: Delete a group.

---

### `POST /api/createGroup`

- **Purpose**: Create a new group.
- **Request Body**: JSON containing `groupName` and `adminId`.
- **Response**: JSON containing new group details.
- **Use-Case**: Create a new group for collaboration.

---

### `GET /api/groupsForUser`

- **Purpose**: Get groups for the authenticated user.
- **Query Params**: `userId` and `role`.
- **Response**: JSON array containing groups for which the user is an admin or a member.
- **Use-Case**: Dashboard functionality specific to a user.

---

### `POST /api/groups/:groupId/channels`

- **Purpose**: Add a new channel to a specific group.
- **Request Body**: JSON containing `name`.
- **Response**: JSON message 'Channel created' on success; 404 Not Found with message 'Group not found' on failure.
- **Use-Case**: Add a new channel to a group.

---

### `DELETE /api/groups/:groupId/users/:userId`

- **Purpose**: Remove a user from a specific group.
- **Response**: JSON message 'User removed from group' on success; 404 Not Found with message 'User not found in group' or 'Group not found' on failure.
- **Use-Case**: Remove a user from a group, either from the admin list or the member list.

---

### `GET /api/groups/:id/users`

- **Purpose**: Get a list of users in a specific group.
- **Response**: JSON object containing admins and members of the group on success; 404 Not Found with message 'Group not found' on failure.
- **Use-Case**: To know who is part of a specific group.

---

### `POST /api/groups/:id/users`

- **Purpose**: Add a user to a specific group.
- **Request Body**: JSON containing `userId`.
- **Response**: JSON containing updated group details on success; 404 Not Found with message 'Group not found' on failure.
- **Use-Case**: Add a new member to a group.

---

### `POST /api/groups/:id/admins`

- **Purpose**: Promote a user to admin within a specific group.
- **Request Body**: JSON containing `adminId`.
- **Response**: JSON containing updated group details on success; 404 Not Found with message 'Group not found' on failure.
- **Use-Case**: Promote a user to an admin role in a group.

---

## Channel Routes

### `GET /api/groups/:groupId/channels/:channelId/messages`

- **Purpose**: Get messages for a specific channel in a group.
- **Response**: JSON array containing messages on success; 404 Not Found with message 'Channel not found' or 'Group not found' on failure.
- **Use-Case**: Display messages in a specific channel.

---

### `POST /api/groups/:groupId/channels/:channelId/messages`

- **Purpose**: Post a new message to a specific channel in a group.
- **Request Body**: JSON containing `message`.
- **Response**: JSON message 'Message sent' on success; 404 Not Found with message 'Channel not found' or 'Group not found' on failure.
- **Use-Case**: Send a new message in a specific channel.

---

### `DELETE /api/groups/:groupId/channels/:channelName`

- **Purpose**: Delete a channel from a specific group based on channel name.
- **Response**: JSON message 'Channel deleted successfully' on success; 404 Not Found with message 'Channel not found in the group' or 'Group not found' on failure.
- **Use-Case**: Delete a channel from a group.

---

## Access Request Routes

### `POST /api/groups/requestAccess`

- **Purpose**: Request access to a group.
- **Request Body**: JSON containing `groupId` and `userId`.
- **Response**: JSON message 'Request received' on success; 404 Not Found with message 'Group not found' on failure.
- **Use-Case**: Requesting access to join a group.

---

### `GET /api/groups/:groupId/requests`

- **Purpose**: Get pending access requests for a specific group.
- **Response**: JSON array containing pending requests on success; 404 Not Found with message 'Group not found' on failure.
- **Use-Case**: For group admins to see pending access requests.

---

### `POST /api/groups/removeRequest`

- **Purpose**: Remove a pending access request for a specific group.
- **Request Body**: JSON containing `groupId` and `userId`.
- **Response**: JSON message 'Request removed' on success; 404 Not Found with message 'Request not found' or 'Group not found' on failure.
- **Use-Case**: For group admins to manage access requests.

---

# Server Architecture

## Modules

- `express`: For handling HTTP requests and responses.
- `body-parser`: For parsing JSON and URL-encoded data.
- `cors`: For Cross-Origin Resource Sharing (CORS) support.
- `path`: For file and directory path manipulation.

## Functions

- `app.post`, `app.get`, `app.delete`: Express functions to handle POST, GET, and DELETE requests, respectively.
- `app.use`: For adding middleware to the application.
- `app.listen`: For starting the server.

---

## Data Changes on Server-Side

1. **User Registration**: When a new user registers, the `users` array on the server is updated.
2. **Group Creation**: Creating a new group updates the `groups` array.
3. **Message Sending**: When a message is sent in a channel, the corresponding `messages` array in the channel object is updated.

## Angular Component Page Updates

1. **LoginComponent**: Upon successful login, navigates to the `DashboardComponent`.
2. **DashboardComponent**: Fetches and displays the list of groups and channels from the server.
3. **ChatWindowComponent**: Fetches and displays messages from the server. Updates in real-time when a new message is sent.
4. **GroupChannelsComponent**: Lists all channels within a specific group. Updated when a new channel is added.
5. **RegisterComponent**: Clears the form and navigates to `DashboardComponent` upon successful registration.

---

# Authors

- Christiaan Small s5255201

---
