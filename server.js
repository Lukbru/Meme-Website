const express = require('express'); // Zaimportuj biblioteke express, która ulatwia tworzenie serwera
const bcrypt = require('bcrypt'); // Zaimportuj biblioteke bcrypt do hashowania hasel
const jwt = require('jsonwebtoken'); // Zaimportuj biblioteke jsonwebtoken do obslugi tokenow 
const { MongoClient, ServerApiVersion } = require('mongodb'); // Zaimportuj MongoClient i ServerApiVersion z biblioteki MongoDB

const JWT_KEY = 'test123' // Sekretny klucz dla JSON Web Tokens
const uri = 'mongodb+srv://bruzdalukasz1c:sRIHYQmheWqCYn3W@memewebsite.y2o9img.mongodb.net/?retryWrites=true&w=majority'; // Połaczenie MongoDB

const client = new MongoClient(uri, { // Tworzy instancje MongoClient, aby polaczyc sie z MongoDB
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const app = express(); // Tworzy instancje aplikacji Express
const port = 2000; // Port na ktorym dziala strona z memami

app.use(express.json()); // Oprogramowanie psredniczace do analizowania JSON 
app.use(express.static('public')); // Udostpepnia pliki z „public”

const verifyToken = (req, res, next) => { // Weryfikauje tokenu JWT
  const token = req.headers.authorization; 

  if (!token) { // Jesli nie ma tokena 
    return res.status(401).json({ message: 'Token not provided' }); // Ta wiadomosc wyswietla sie jesli nie ma tokena
  }

  jwt.verify(token.slice('Bearer '.length), JWT_KEY, (err, decoded) => { // Sprawdza czy token sie zgadza
    if (err) {
      return res.status(401).json({ message: 'Token doesnt exist yet' }); // Wiadomosc ta wyswietli sie jesli wystapil blad przy sprawdzaniu poprawnosci tokena
    }

    req.loggedInUser = decoded; 
    next(); // Idzie do kolejnej operacji/rzeczy
  });
};

app.get('/', (req, res) => { // Link dla strony rejestracji
  res.sendFile(__dirname + '/public/register.html'); 
});

app.get('/memes', (req, res) => { // Link dla strony z memami
  res.sendFile(__dirname + '/public/meme.html');
});

app.post('/registerr', async (req, res) => { //Dla rejestracji
  const { username, password } = req.body; // Bierze nazwe i haslo uzytkownika 
  if (!username || !password) { // Jesli nie ma nazwy lub hasla uzytkownika
    return res.status(400).json({ message: 'Invalid input. Please provide both username and password.' }); // Ta wiadomosc wyskakuje jesli pole przy rejestracji nie zostalo wypelnione
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10); //salt rounds 10 ,czyli wzmacnia mocnosc hasla

    const database = client.db('MemeWebsite'); 
    const collection = database.collection('users');
    const existingUser = await collection.findOne({ username }); // Bierze z serwera (kolekcji uzytkownicy), nazwy uzytkownikow

    if (existingUser) { // Sprawdza czy nazwa uzytkownika juz istnieje
      return res.status(409).json({ success: false, message: 'Username already taken' }); // Ta wiadomosc wyskakuje jesli juz taka nazwa uzytkownika istnieje
    }

    await collection.insertOne({ username, password: hashedPassword }); // Czeka na zapisanie na serwer nazwy i zhasowanego hasla uzytkownika
    res.status(201).json({success: true, message: 'User registered successfully' }); // Ta wiadomosc wyskakuje jesli uzytkownikowi sie udalo zarejestrowac
  } catch (error) { // Jesli wystapil blad
    console.error('Error hashing password:', error); // Blad w konsoli z hashowaniem hasla
    res.status(500).json({success: false, message: 'An error occurred. Please try again much later...' }); // Ta wiadomosc wyskakuje jesli wystapil blad przy zapisywaniem danych na serwer
  }
});

app.post('/login', async (req, res) => { // Dla loginu
  const { username, password } = req.body;  // Bierze nazwe i haslo uzytkownika 

  const database = client.db('MemeWebsite');
  const collection = database.collection('users'); 
  const user = await collection.findOne({ username }); // Bierze z serwera (kolekcji uzytkownicy), nazwy uzytkownikow

  if (!user) { // Jesli nie znaleziono uzytkownika z taka nazwa
    return res.status(404).json({ success: false, message: 'User not found' }); // Ta wiadomosc wyskakuje jestli nie znaleziono uzytkownika z taka nazwa
  }

  try {
    const passwordMatch = await bcrypt.compare(password, user.password); // Sprawdza czy haslo podane jest takie samo jak zhasowane
    if (passwordMatch) { // Jesli haslo sie zgadza
        const token = jwt.sign({username}, JWT_KEY); // Uzytkownik dostaje tokena
        return res.status(200).json({success: true, message: 'Login successful', token }); // Ta wiadomosc wyswietla sie jesli udalo sie zalogowac
      } else {
        return res.status(401).json({success: false, message: 'Wrong password' }); // Ta wiadomosc wyswietla sie jesli nie udalo sie zalogowac
      }
    } catch (error) { // Jesli wystapil blad
      console.error('Nice try buddy - Salt 100% :', error);
      res.status(500).json({success: false, message: 'An error occurred. Please try again much later...' }); // Ta wiadomosc wyswietla sie jesli wystapil blad przy logowaniu
    }
});

app.get('/get-memes', async (req, res) => { // Do ladowania memow
  try {
    const database = client.db('MemeWebsite');
    const collection = database.collection('memes'); // Bierze z serwera (kolekcji memy), memy

    const sortOrder = req.query.sort === 'oldest' ? 1 : -1; // Ustawia kolejnosc sortowania
    const allMemes = await collection.find().sort({ _id: sortOrder }).toArray(); // Czeka za wszystkie memy zostana zaladowane
    res.json({ success: true, memes: allMemes });

  } catch (error) {
    console.error('Error loading memes:', error); // Blad przy ladowaniu memow
    res.status(500).json({ success: false, message: 'An error occurred. Please try again later.' }); // Ta wiadomosc wyskakuje jesli wystapil blad przy ladowaniu moemow
  }
});

app.post('/post-meme', verifyToken, async (req, res) => { // Do postowania memow
  const { memeUrl } = req.body; 
  
  if (!memeUrl) { // Jesli pole na Url memow jest puste
      return res.status(400).json({ success: false, message: 'Meme URL not present' }); // Ta wiadomosc wyskakuje jesli nie wpisalo sie nic w pole na Url mema
  }

  const newMeme = { user: req.loggedInUser.username, memeUrl }; 
  await SaveMeme(newMeme); // Zapisuje memy na serwerze MongoDB w kolekcji meme

  res.status(201).json({ success: true, message: 'Meme posted successfully', meme: newMeme }); // Ta wiadomosc wyskakuje jesli udalo sie dodac meme
});

async function SaveMeme(meme) { // Zapisuje memy na serwerze MongoDB w kolekcji meme
     const database = client.db('MemeWebsite');
     const collection = database.collection('memes');
     await collection.insertOne(meme);
}

client.connect().then(() => { // Uruchamia połączenie MongoDB i serweru Express
  app.listen(port, () => {
  
    console.log(`Server is running on port ${port}`);
  });
})