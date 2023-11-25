const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_KEY = 'test123'

const app = express();
const port = 2000;

const users = [];
const memes = [];

app.use(express.json());

app.use(express.static('public')); 

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'Token not provided' });
  }

  jwt.verify(token.slice('Bearer '.length), JWT_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token doesnt exist yet' });
    }

    req.loggedInUser = decoded; 
    next();
  });
};

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/register.html'); 
});

app.get('/memes', (req, res) => {
  res.sendFile(__dirname + '/public/meme.html');
});

app.post('/registerr', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Invalid input. Please provide both username and password.' });
  }

  if (users.some((user) => user.username === username)) {
    return res.status(409).json({ message: 'Username already taken' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10); //salt rounds 10

    users.push({ username, password: hashedPassword });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).json({ message: 'An error occurred. Please try again much later...' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = users.find((user) => user.username === username);

  if (user) {
    try {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        const token = jwt.sign({}, JWT_KEY);
        return res.status(200).json({ message: 'Login successful', token });
      } else {
        return res.status(401).json({ message: 'Wrong password' });
      }
    } catch (error) {
      console.error('Nice try buddy - Salt 100% :', error);
      res.status(500).json({ message: 'An error occurred. Please try again much later...' });
    }
  } else {
    return res.status(404).json({ message: 'User not found' });
  }
});

app.post('/post-meme', verifyToken, (req, res) => {
  const { memeUrl } = req.body;

  if (!memeUrl) {
    return res.status(400).json({ message: 'Meme URL not present' });
  }

  memes.push({ user: req.loggedInUser, memeUrl });

  res.status(201).json({ message: 'Meme posted successfully' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

