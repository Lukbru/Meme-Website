const express = require('express');

const app = express();
const port = 2000;

const users = [];
const memes = [];

app.use(express.json());

app.use(express.static('public')); 

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/register.html'); 
});

app.get('/memes', (req, res) => {
  res.sendFile(__dirname + '/public/meme.html');
});

app.post('/registerr', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Invalid input. Please provide both username and password.' });
  }

  if (users.some((user) => user.username === username)) {
    return res.status(409).json({ message: 'Username already taken' });
  }

  users.push({ username, password });
  res.status(201).json({ message: 'User registered successfully' });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find((user) => user.username === username);

  if (user && user.password === password) {
    return res.status(200).json({ message: 'Login successful' });
  } else if (user) {
    return res.status(401).json({ message: 'Wrong password' });
  } else {
    return res.status(404).json({ message: 'User not found' });
  }
});

app.post('/post-meme', (req, res) => {
  const { memeUrl } = req.body;

  if (!req.loggedInUser) {
    return res.status(401).json({ message: 'User not logged in' });
  }
  if (!memeUrl) {
    return res.status(400).json({ message: 'Meme URL not present' });
  }

  memes.push({ user: req.loggedInUser, memeUrl });

  res.status(201).json({ message: 'Meme posted successfully' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

