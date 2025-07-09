const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const URL = require('../models/url.js');
const { checkForAuthentication, restrictTo } = require('../middlewares/auth.js');
const connectToMongoDB = require('../connet.js');
const userRoute = require('../routers/user.js');
const urlRoute = require('../routers/url.js');
const staticRoute = require('../routers/staticRouter.js');
const serverless = require('serverless-http');
require('dotenv').config();
const app = express();

// MongoDB Connect (make sure MongodbURL is in env vars on Vercel)
connectToMongoDB(process.env.MongodbURL)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Error', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthentication);

// Views
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "../views"));

// Routes
app.use('/url', restrictTo(['NORMAL', 'ADMIN']), urlRoute);
app.use('/user', userRoute);
app.use('/', staticRoute);

app.post('/logout', (req, res) => {
  res.clearCookie('uid');
  res.redirect('login');
});

app.get('/url/:shortId', async (req, res) => {
  const shortId = req.params.shortId;
  try {
    const entry = await URL.findOneAndUpdate(
      { shortId },
      { $push: { visitHistory: { timestamp: Date.now() } } },
      { new: true }
    );
    if (!entry) return res.status(404).send("Short URL not found");
    return res.redirect(entry.redirectURL);
  } catch (err) {
    console.error("Redirect Error:", err);
    return res.status(500).send("Internal Server Error");
  }
});

// ❌ DO NOT use app.listen on Vercel
// ✅ Export the serverless handler
module.exports = serverless(app);
