const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const app = express();
const PORT = 4001;
const cPath = 'C:/Users/Bojack/Documents/GitHub/3813ICT-3235_Assignment1/3813ICT-Chat/dist/3813-ict-chat';
const { MongoClient } = require('mongodb');
const fs = require('fs');
const url = "mongodb://127.0.0.1:27017/";
const dbName = "yourDatabaseName";
const client = new MongoClient(url);
const server = http.createServer(app);
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) // Appending extension
  }
})

const upload = multer({ storage: storage })
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:4001",
    methods: ["GET", "POST"],
    credentials: true
  }
});
app.use(cors({
  origin: 'http://localhost:4001',
  credentials: true
}));
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.static(cPath));

let lastUserId = 0;

let users = [];
let groups = [];
let currentUser = null;
async function connectToDB() {
  try {
    if (client.topology && client.topology.isConnected()) {
      console.log('Already connected to MongoDB');
    } else {
      await client.connect();
      console.log('Connected to MongoDB');
    }
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
  }
}
io.on('connection', (socket) => {
  console.log('New user connected');

  socket.on('joinChannel', (data) => {
    const { channel, username } = data;
    socket.join(channel);
    io.to(channel).emit('userJoined', { text: `${username} has joined the channel` });
  });

  socket.on('leaveChannel', (data) => {
    const { channel, username } = data;
    socket.leave(channel);
    io.to(channel).emit('userLeft', { text: `${username} has left the channel` });
  });

  socket.on('sendMessage', (data) => {
    const message = data.isImage ? 
      { imagePath: data.message } : 
      { text: data.message };
  
    // Emit the new message to all connected clients
    io.emit('newMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(4000, () => {
  console.log('Server running on port 4000');
});
// Function to save users and groups data to JSON files
async function saveDataToDB() {
  try {
    if (!client.topology || !client.topology.isConnected()) {
      console.log('Manually connecting...');
      await connectToDB();
    }
    
    const db = client.db(dbName);
    const usersCollection = db.collection('users');
    const groupsCollection = db.collection('groups');
    
    await usersCollection.deleteMany({});
    if (users && users.length > 0) {
      await usersCollection.insertMany(users);
    }

    await groupsCollection.deleteMany({});
    if (groups && groups.length > 0) {
      await groupsCollection.insertMany(groups);
    }

    console.log("Data saved to DB");
  } catch (e) {
    console.log("Error saving data to DB: ", e);
  }
}


async function loadDataFromDB() {
  try {
    if (!client.topology || !client.topology.isConnected()) {
      console.log('Manually connecting...');
      await connectToDB();
    }
    
    const db = client.db(dbName);
    const usersCollection = db.collection('users');
    const groupsCollection = db.collection('groups');

    // Fetch data from MongoDB and populate the users and groups arrays
    users = await usersCollection.find({}).toArray();
    groups = await groupsCollection.find({}).toArray();

    console.log('Data loaded from DB');
  } catch (e) {
    console.log('Error loading data from DB:', e);
  }
}

// Load data from MongoDB when the server starts
loadDataFromDB().catch(console.error);

// Load data from JSON files when the server starts
function saveDataMiddleware(req, res, next) {
  // Run the route's handler function
  res.on('finish', () => {
    saveDataToDB();
  });

  next(); // Continue to the route's handler
}

// User Routes
// Authenticates user credentials and returns an authentication token.
app.post('/api/authenticate', saveDataMiddleware, (req, res) => {
  console.log('Received:', req.body);  // Logging the received data
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    console.log('User found:', user);  // Logging the found user
    currentUser = user;
    res.json(user);
  } else {
    console.log('Authentication failed for:', username);  // Logging failed attempt
    res.status(401).json({ message: 'Authentication failed' });
  }
});

// Returns the current authenticated user's information.
app.get('/api/currentUser', saveDataMiddleware, (req, res) => {
  if (currentUser) {
    res.json(currentUser);
  } else {
    res.status(401).json({ message: 'No current user' });
  }
});

// Registers a new user and returns the new user's information.
app.post('/api/register', saveDataMiddleware, (req, res) => {
  const { username, password, email } = req.body;
  const userExists = users.some(u => u.username === username || u.email === email);

  if (userExists) {
    res.status(400).json({ message: 'Username or email already exists' });
    return;
  }

  const newUser = {
    id: uuidv4(),  // Generate a unique ID
    username,
    password,
    email,
    role: 'User', // default role
    groups: [] // default groups
  };

  users.push(newUser);
  res.json({ message: 'User registered', user: newUser });
});
// Promotes an existing user to Super Admin role.
app.post('/api/promoteToSuperAdmin', saveDataMiddleware, (req, res) => {
  const { username } = req.body;
  const user = users.find(u => u.username === username);

  if (user) {
    user.role = 'Super Admin';
    res.json({ message: 'User promoted to Super Admin' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// Retrieves a list of all users.
app.get('/api/users', saveDataMiddleware, (req, res) => {
  res.json(users);
});

// Retrieves user information based on user ID.
app.get('/api/users/:id', saveDataMiddleware, (req, res) => {
  const userId = req.params.id;
  const user = users.find(u => u.id === userId);

  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// Deletes a user based on username.
app.delete('/api/users/:username', saveDataMiddleware, (req, res) => {
  const username = req.params.username;
  const userIndex = users.findIndex(u => u.username === username);

  if (userIndex !== -1) {
    users.splice(userIndex, 1);
    res.json({ message: 'User account deleted successfully' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// Group Routes
// Retrieves a list of all groups.
app.get('/api/groups', saveDataMiddleware, (req, res) => {
  res.json(groups);
});

// Add a new route to upload images
app.post('/upload', upload.single('image'), (req, res) => {
  const filePath = req.file.path;
  // Store filePath in MongoDB
  // ...
  res.json({ filePath });
});
// Update the profile picture file path for an existing user.
app.post('/api/updateProfilePicture', upload.single('image'), async (req, res) => {
  const username = req.body.username;
  const profilePath = req.file ? req.file.path : null;

  try {
    const user = users.find(u => u.username === username);

    if (!user || !profilePath) {
      return res.status(404).json({ message: 'User or image not found' });
    }

    user.profilePicture = profilePath;

    if (!client.topology || !client.topology.isConnected()) {
      console.log('Manually connecting to MongoDB...');
      await connectToDB();
    }

    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    const updatedUser = await usersCollection.findOneAndUpdate(
      { username },
      { $set: { profilePicture: profilePath } },
      { returnOriginal: false }
    );

    if (updatedUser.value) {
      res.json({ message: 'Profile picture updated successfully', profilePath });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// API to delete a group
app.delete('/api/groups/:groupId', saveDataMiddleware, (req, res) => {
  const groupId = req.params.groupId;
  const groupIndex = groups.findIndex(g => g.id === groupId);

  if (groupIndex !== -1) {
    groups.splice(groupIndex, 1);
    res.json({ message: 'Group deleted successfully' });
  } else {
    res.status(404).json({ message: 'Group not found' });
  }
});

// Creates a new group and returns the new group's information.
app.post('/api/createGroup', saveDataMiddleware, (req, res) => {
  const { groupName, adminId } = req.body;
  const newGroupId = (groups.length + 1).toString();
  const newGroup = {
    id: newGroupId,
    name: groupName,
    channels: [],
    admins: [adminId],
    members: []
  };
  groups.push(newGroup);
  res.json({ message: 'Group created', group: newGroup });
});

// Retrieves a list of groups for the authenticated user.
app.get('/api/groupsForUser', saveDataMiddleware, (req, res) => {
  const { userId, role } = req.query;
  if (role === 'Super Admin') {
    res.json(groups);
  } else {
    const userGroups = groups.filter(group => group.admins.includes(userId) || group.members.includes(userId));
    res.json(userGroups);
  }
});

// Adds a channel to a specific group.
app.post('/api/groups/:groupId/channels', saveDataMiddleware, (req, res) => {
  const { groupId } = req.params;
  const { name } = req.body;

  const group = groups.find(g => g.id === groupId);

  if (group) {
    group.channels.push({ name, messages: [] });
    res.json({ message: 'Channel created' });
  } else {
    res.status(404).json({ message: 'Group not found' });
  }
});

// Remove a user from a group
app.delete('/api/groups/:groupId/users/:userId', saveDataMiddleware, (req, res) => {
  const { groupId, userId } = req.params;
  const group = groups.find(g => g.id === groupId);

  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  const adminIndex = group.admins.findIndex(u => u === userId);
  const memberIndex = group.members.findIndex(u => u === userId);

  if (adminIndex === -1 && memberIndex === -1) {
    return res.status(404).json({ message: 'User not found in group' });
  }

  if (adminIndex !== -1) {
    group.admins.splice(adminIndex, 1);
  }

  if (memberIndex !== -1) {
    group.members.splice(memberIndex, 1);
  }

  res.status(200).json({ message: 'User removed from group' });
});

// Retrieves a list of users in a specific group.
app.get('/api/groups/:id/users', saveDataMiddleware, (req, res) => {
  console.log(`Received request for group ID: ${req.params.id}`);
  console.log(`Current groups: ${JSON.stringify(groups)}`);

  const group = groups.find(g => parseInt(g.id, 10) === parseInt(req.params.id, 10));

  if (group) {
    console.log(`Group found: ${JSON.stringify(group)}`);
    const allUsersInGroup = {
      admins: group.admins,
      members: group.members
    };
    res.json(allUsersInGroup);
  } else {
    console.log(`No group found for ID ${req.params.id}`);
    res.status(404).json({ message: 'Group not found' });
  }
});

// Adds a user to a specific group.
app.post('/api/groups/:id/users', saveDataMiddleware, (req, res) => {
  console.log(`Received request to add user to group ID: ${req.params.id}`);
  const { userId } = req.body;

  // Find the group
  const groupIndex = groups.findIndex(g => g.id === req.params.id);

  if (groupIndex !== -1) {
    // Check if user is already a member or an admin in the group
    if (groups[groupIndex].members.includes(userId) || groups[groupIndex].admins.includes(userId)) {
      res.status(400).json({ message: 'User already in group' });
      return;
    }

    // Add user to group members
    groups[groupIndex].members.push(userId);
    res.json({ message: 'User added to group', group: groups[groupIndex] });
  } else {
    res.status(404).json({ message: 'Group not found' });
  }
});

// Promotes a user to admin within a specific group.
app.post('/api/groups/:id/admins', saveDataMiddleware, (req, res) => {
  console.log(`Received request to promote user to admin in group ID: ${req.params.id}`);
  const { adminId } = req.body;

  // Find the group
  const groupIndex = groups.findIndex(g => g.id === req.params.id);

  if (groupIndex !== -1) {
    // Check if user is already an admin in the group
    if (groups[groupIndex].admins.includes(adminId)) {
      res.status(400).json({ message: 'User is already an admin' });
      return;
    }

    // Check if user is a member in the group
    if (!groups[groupIndex].members.includes(adminId) && !groups[groupIndex].admins.includes(adminId)) {
      res.status(400).json({ message: 'User is not in the group' });
      return;
    }

    // Promote user to admin
    groups[groupIndex].admins.push(adminId);
    const index = groups[groupIndex].members.indexOf(adminId);
    if (index > -1) {
      groups[groupIndex].members.splice(index, 1);
    }

    // Find the user and update their role
    const userIndex = users.findIndex(user => user.id === adminId);
    if (userIndex !== -1) {
      users[userIndex].role = 'Group Admin';
    }

    res.json({ message: 'User promoted to admin and role updated', group: groups[groupIndex] });
  } else {
    res.status(404).json({ message: 'Group not found' });
  }
});

// Channel Routes
// Retrieves messages for a specific channel in a specific group.
app.get('/api/groups/:groupId/channels/:channelId/messages', saveDataMiddleware, (req, res) => {
  const { groupId, channelId } = req.params;
  const group = groups.find(g => g.id === groupId);
  if (group) {
    const channel = group.channels.find(c => c.name === channelId);
    if (channel) {
      res.json(channel.messages);
    } else {
      res.status(404).json({ message: 'Channel not found' });
    }
  } else {
    res.status(404).json({ message: 'Group not found' });
  }
});

// Posts a new message to a specific channel in a specific group.
app.post('/api/groups/:groupId/channels/:channelId/messages', saveDataMiddleware, (req, res) => {
  const { groupId, channelId } = req.params;
  const { message } = req.body;
  const group = groups.find(g => g.id === groupId);
  if (group) {
    const channel = group.channels.find(c => c.name === channelId);
    if (channel) {
      channel.messages.push(message);
      res.json({ message: 'Message sent' });
    } else {
      res.status(404).json({ message: 'Channel not found' });
    }
  } else {
    res.status(404).json({ message: 'Group not found' });
  }
});


// Deletes a channel from a specific group based on channel name.
app.delete('/api/groups/:groupId/channels/:channelName', saveDataMiddleware, (req, res) => {
  const { groupId, channelName } = req.params;
  const group = groups.find(g => g.id === groupId);

  if (group) {
    const channelIndex = group.channels.findIndex(c => c.name === channelName);

    if (channelIndex !== -1) {
      group.channels.splice(channelIndex, 1);
      res.json({ message: 'Channel deleted successfully' });
    } else {
      res.status(404).json({ message: 'Channel not found in the group' });
    }
  } else {
    res.status(404).json({ message: 'Group not found' });
  }
});

// Access Request Routes
// Requests access to a group, adding the request to a queue.
app.post('/api/groups/requestAccess', saveDataMiddleware, (req, res) => {
  const { groupId, userId } = req.body;
  const group = groups.find(g => g.id === groupId);
  console.log(`Received request for group ID: ${groupId}`);

  if (group) {
    if (!group.requests) {
      group.requests = [];  // Initialize if undefined
    }
    group.requests.push(userId);
    console.log(`Added Request`);
    res.json({ status: 'Request received' });
  } else {
    console.log(`Group not found`);
    res.status(404).json({ status: 'Group not found' });
  }
});

// Retrieves a list of pending access requests for a specific group.
app.get('/api/groups/:groupId/requests', saveDataMiddleware, (req, res) => {
  console.log(`Server received request for group ID: ${req.params.groupId}`);
  const group = groups.find(g => g.id === req.params.groupId);

  if (group) {
    console.log(`Server found group, sending requests: ${JSON.stringify(group.requests)}`);
    res.json(group.requests);
  } else {
    console.log(`Server could not find group with ID: ${req.params.groupId}`);
    res.status(404).json({ message: 'Group not found' });
  }
});

// Removes a pending access request for a specific group.
app.post('/api/groups/removeRequest', saveDataMiddleware, (req, res) => {
  const { groupId, userId } = req.body;
  const group = groups.find(g => g.id === groupId);

  if (group) {
    const requestIndex = group.requests.indexOf(userId);

    if (requestIndex !== -1) {
      group.requests.splice(requestIndex, 1);
      res.json({ status: 'Request removed' });
    } else {
      res.status(404).json({ status: 'Request not found' });
    }
  } else {
    res.status(404).json({ status: 'Group not found' });
  }
});

// Redirect all other routes to Angular app
app.get('/*', saveDataMiddleware, function (req, res) {
  res.sendFile(path.join(cPath, 'index.html'));
});

// Start the server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await connectToDB();
});