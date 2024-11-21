const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const ExpressBrute = require('express-brute');
const moment = require('moment');
require('dotenv').config();
var session = require('express-session');
const flash = require('connect-flash');
const app = express();
app.use(flash());
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// DDOS attack prevention
const failCallback = function (req, res, next, nextValidRequestDate) {
  res.status(422).json({ message: "You've made too many attempts in a short period of time, please try again " + moment(nextValidRequestDate).fromNow() });
};

let handleStoreError = (error) => {
  log.error(error); // log this error so we can figure out what went wrong
  throw {
    message: error.message,
    parent: error.parent
  };
}

let store = new ExpressBrute.MemoryStore();
let bruteforce = new ExpressBrute(store, {
  freeRetries: 50,
  minWait: 1000, // 1 sec
  maxWait: 60 * 60 * 1000, // 1 hour,
  failCallback: failCallback,
  handleStoreError: handleStoreError
});

// Authorization middleware
const authorizeUser = (req, res, next) => {
  const token = req.headers['authorization']?.split('Bearer ')[1];
  if (!token) {
    return res.status(401).json({ details: 'Please authenticate first.' });
  }

  try {
    // Verify and decode the token
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY, { algorithms: ['HS256'] });
    req.user = decodedToken;
    next(); // Proceed to the next middleware
  } catch (error) {
    return res.status(401).json({ details: 'Invalid authorization token' });
  }
};

app.get('/auth', authorizeUser, (req, res) => {
  res.json({ role: req.user.role });
})


app.get('/', bruteforce.prevent, (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/login.html'));
});

app.get('/js/login.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/js/login.js'))
});
app.get('/js/register.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/js/register.js'))
});

app.get('/js/auth-interceptor.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/js/auth-interceptor.js'))
});

app.get('/css/login.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/css/login.css'))
});
app.get('/css/popup.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/css/popup.css'))
});
app.get('/css/loader.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/css/loader.css'))
});

app.get('/css/index.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/css/index.css'))
});
app.get('/css/register.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/css/register.css'))
});

app.get('/css/admin.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/css/admin.css'))
});

app.get('/assets/eth5.jpg', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/assets/eth5.jpg'))
});

app.get('/js/app.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/js/app.js'))
});

app.get('/admin.html', bruteforce.prevent, (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/admin.html'));
});

app.get('/index.html', bruteforce.prevent, (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/index.html'));
});

app.get('/login.html', bruteforce.prevent, (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/login.html'));
});
app.get('/register.html', bruteforce.prevent, (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/register.html'));
});

app.get('/dist/login.bundle.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/dist/login.bundle.js'));
});

app.get('/dist/app.bundle.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/dist/app.bundle.js'));
});

// Serve the favicon.ico file
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/favicon.ico'));
});

app.all("*", bruteforce.prevent, (req, res) => {
  res.status(404).json({ message: "Not found" })
})

// Start the server
app.listen(8081, () => {
  console.log('Server listening on http://localhost:8081');
});
