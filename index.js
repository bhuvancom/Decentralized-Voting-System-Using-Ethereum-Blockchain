const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const ExpressBrute = require('express-brute');
const moment = require('moment');
require('dotenv').config();
var session = require('express-session');
const flash = require('connect-flash');
const app = express();
const axios = require('axios')
const bodyParser = require('body-parser');


app.use(flash());
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: true,
    saveUninitialized: true
  })
);
// Alternative using Express built-in middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:8081', // Your frontend URL
  credentials: true, // Important for cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'CSRF-Token']
}));

const helmet = require('helmet');
// Set Content Security Policies
const scriptSources = ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.0/umd/popper.min.js", "'unsafe-eval'", "https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"];
const styleSources = ["'self'", "'unsafe-inline'"];
const connectSources = ["'self'", "http://127.0.0.1:8081", "http://localhost:8081"];

app.use(helmet());
app.use(helmet.noSniff());
app.use(helmet.xssFilter()); //xss 
app.use(helmet.hidePoweredBy());
app.use(helmet.contentSecurityPolicy({
  directives: {
    scriptSrc: scriptSources,
    scriptSrcElem: scriptSources,
    styleSrc: styleSources,
    connectSrc: connectSources,
  }
}))

// CSRF protection middleware
const csrfProtection = (req, res, next) => {
  next();
};

// Apply CSRF protection to all routes that need it
app.use(csrfProtection);

// Error handler for CSRF errors
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      error: 'CSRF token validation failed'
    });
  }
  next(err);
});

// Authorization middleware
const authorizeUser = (req, res, next) => {
  const cookies = req.headers.cookie?.split('; ').reduce((acc, cookie) => {
    const [name, value] = cookie.split('=');
    acc[name] = value;
    return acc;
  }, {});
  const token1 = cookies.jwtToken ?? "Bearer ";
  if (!token1) {
    return res.status(401).json({ details: 'Please authenticate first.' });
  }

  try {
    // Verify and decode the token
    const decodedToken = jwt.verify(token1, process.env.SECRET_KEY, { algorithms: ['HS256'] });
    req.user = decodedToken;
    next(); // Proceed to the next middleware
  } catch (error) {
    return res.status(401).json({ details: 'Invalid authorization token' });
  }
};
app.post('/login', csrfProtection, (req, res) => {
  const data = req.body;
  toFastApi(data, res, "login");
});
app.post('/register', csrfProtection, (req, res) => {
  const data = req.body;
  toFastApi(data, res, "register");
});
const toFastApi = (data, res, path) => {
  axios.post("http://localhost:8000/" + path, data).then((result) => {
    const token = result.data.token;
    res.cookie('jwtToken', token, {
      httpOnly: true,        // Prevents JavaScript access
      sameSite: 'strict',   // Protects against CSRF
      maxAge: 3600000      // Cookie expiry time in milliseconds
    });
    res.json(result.data);

  }).catch(e => {
    res.status(e.status).json({ "message": e.response.data.detail });
  })
}
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

app.get('/js/notifier.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/js/notifier.js'))
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

app.get("*", bruteforce.prevent, (_req, res) => {
  res.status(404).json({ message: "Not found" })
})

// Start the server
app.listen(8081, () => {
  console.log('Server listening on http://localhost:8081');
});
