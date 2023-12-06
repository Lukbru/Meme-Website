const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');

const JWT_KEY = 'test123'
const uri = 'mongodb+srv://bruzdalukasz1c:sRIHYQmheWqCYn3W@memewebsite.y2o9img.mongodb.net/?retryWrites=true&w=majority';

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const app = express();
const port = 2000;

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
  try {
    const hashedPassword = await bcrypt.hash(password, 10); //salt rounds 10

    const database = client.db('MemeWebsite');
    const collection = database.collection('users');
    const existingUser = await collection.findOne({ username });

    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Username already taken' });
    }

    await collection.insertOne({ username, password: hashedPassword });
    res.status(201).json({success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).json({success: false, message: 'An error occurred. Please try again much later...' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const database = client.db('MemeWebsite');
  const collection = database.collection('users');

  const user = await collection.findOne({ username });

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  try {
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
        const token = jwt.sign({username}, JWT_KEY);
        return res.status(200).json({success: true, message: 'Login successful', token });
      } else {
        return res.status(401).json({success: false, message: 'Wrong password' });
      }
    } catch (error) {
      console.error('Nice try buddy - Salt 100% :', error);
      res.status(500).json({success: false, message: 'An error occurred. Please try again much later...' });
    }
});

app.get('/get-memes', async (req, res) => {
  try {
    const database = client.db('MemeWebsite');
    const collection = database.collection('memes');
    const allMemes = await collection.find().toArray();
    res.json({ success: true, memes: allMemes });
  } catch (error) {
    console.error('Error loading memes:', error);
    res.status(500).json({ success: false, message: 'An error occurred. Please try again later.' });
  }
});

app.post('/post-meme', verifyToken, async (req, res) => {
  const { memeUrl } = req.body;
  
  if (!memeUrl) {
      return res.status(400).json({ success: false, message: 'Meme URL not present' });
  }

  const newMeme = { user: req.loggedInUser.username, memeUrl };
  await SaveMeme(newMeme);

  res.status(201).json({ success: true, message: 'Meme posted successfully', meme: newMeme });
});

async function SaveMeme(meme) {
     const database = client.db('MemeWebsite');
     const collection = database.collection('memes');
     await collection.insertOne(meme);
}

client.connect().then(() => {
  app.listen(port, () => {
  
    console.log(`Server is running on port ${port}`);
  });
})