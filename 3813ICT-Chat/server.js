const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Initial data
let users = [
  { id: '1', username: 'super', password: '123', role: 'Super Admin', groups: [] },
  { id: '2', username: 'groupadmin', password: '123', role: 'Group Admin', groups: [] },
  { id: '3', username: 'user', password: '123', role: 'User', groups: [] }
];

let groups = [
  { id: '1', name: 'Group1', channels: ['Channel1', 'Channel2'], admins: ['2'], members: ['3'] },
  { id: '2', name: 'Group2', channels: ['Channel1'], admins: ['2', '3'], members: ['3'] }
];

let currentUser = null;
console.log('runningg');  // Logging the received data

// Authenticate
app.post('/api/authenticate', (req, res) => {
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

// Get current user
app.get('/api/currentUser', (req, res) => {
  if (currentUser) {
    res.json(currentUser);
  } else {
    res.status(401).json({ message: 'No current user' });
  }
});

// Get Groups
app.get('/api/groups', (req, res) => {
  res.json(groups);
});

// Get Groups for User
app.get('/api/groupsForUser', (req, res) => {
  const { userId, role } = req.query;
  if (role === 'Super Admin') {
    res.json(groups);
  } else {
    const userGroups = groups.filter(group => group.admins.includes(userId) || group.members.includes(userId));
    res.json(userGroups);
  }
});

// Get Users in a Group
app.get('/api/groups/:id/users', (req, res) => {
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
// Get all users
app.get('/api/users', (req, res) => {
  res.json(users);
});
// Create Group
app.post('/api/createGroup', (req, res) => {
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

// Add User to Group
app.post('/api/groups/:id/users', (req, res) => {
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
// Promote User to Admin in Group
app.post('/api/groups/:id/admins', (req, res) => {
  console.log(`Received request to promote user to admin in group ID: ${req.params.id}`);
  const { adminId } = req.body;
  
  // Find the group
  const groupIndex = groups.findIndex(g => g.id === req.params.id);
  
  if (groupIndex !== -1) {
    const group = groups[groupIndex];
    
    // Check if user is already an admin in the group
    if (group.admins.includes(adminId)) {
      return res.status(400).json({ message: 'User is already an admin' });
    }
    
    // Check if user is a member in the group
    if (!group.members.includes(adminId)) {
      return res.status(400).json({ message: 'User is not in the group' });
    }

    // Find the user to be promoted and update their role to 'Group Admin'
    const userIndex = users.findIndex(u => u.id === adminId);
    if (userIndex !== -1) {
      users[userIndex].role = 'Group Admin';
    } else {
      return res.status(404).json({ message: 'User not found' });
    }

    // Promote user to admin
    group.admins.push(adminId);
    const index = group.members.indexOf(adminId);
    if (index > -1) {
      group.members.splice(index, 1);
    }

    return res.json({ message: 'User promoted to Group Admin', group });
  } else {
    return res.status(404).json({ message: 'Group not found' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
