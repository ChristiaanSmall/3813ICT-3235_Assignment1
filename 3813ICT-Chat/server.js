const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const apiRoutes = require('./routes/api');  // Assuming your routes will be in a file called api.js inside a 'routes' folder

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve Angular App (replace 'your-angular-app-name' with the actual name of your built Angular app)
app.use(express.static(path.join(__dirname, 'dist', '3813-ict-chat')));

// Use the API routes
app.use('/api', apiRoutes);

// Serve Angular Routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', '3813-ict-Chat', 'index.html'));
  });

const port = process.env.PORT || 3000;
app.listen(port, () => {
console.log(`Server is running on port ${port}`);
});