const express = require('express');
const router = express.Router();

let users = [
  { id: '1', username: 'super', password: '123', role: 'Super Admin', groups: [] },
  { id: '2', username: 'groupadmin', password: '123', role: 'Group Admin', groups: [] },
  { id: '3', username: 'user', password: '123', role: 'User', groups: [] }
];

let groups = [
  { id: '1', name: 'Group1', channels: ['Channel1', 'Channel2'], admins: ['2'] },
  { id: '2', name: 'Group2', channels: ['Channel1'], admins: ['2', '3'] }
];

// Authentication
router.post('/authenticate', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    res.json({ success: true, user });
  } else {
    res.json({ success: false, message: 'Invalid credentials' });
  }
});

// Create Group
router.post('/createGroup', (req, res) => {
  const { groupName, adminId } = req.body;
  const newGroupId = (groups.length + 1).toString();
  const newGroup = { id: newGroupId, name: groupName, channels: [], admins: [adminId] };
  groups.push(newGroup);
  res.json({ success: true, newGroup });
});

// Other routes can go here

module.exports = router;
