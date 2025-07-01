const express=require('express');
const path=require('path');
const cookieParser=require('cookie-parser');
const URL =require('./models/url.js');
const app=express();
const {restrictToLoggedinuserOnly,checkAuth}=require('./middlewares/auth.js');
const connectToMongoDB=require('./connet.js');

const userRoute=require('./routers/user.js');
const urlRoute=require('./routers/url');
const staticRoute=require('./routers/staticRouter.js');


const PORT=3000;

//MongoDB Connect
const MongoUrl="mongodb+srv://jackalxa1:RnWaxvaSUOVj2m6I@cluster0.op82zh4.mongodb.net/";
connectToMongoDB(MongoUrl).then(()=>console.log('mongoDB Connected'));

//Middlewares
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());

//Server Side Rendering
app.set("view engine","ejs");
app.set("views",path.resolve("./views"));


//Routes
app.use('/url',restrictToLoggedinuserOnly,urlRoute);
app.use('/user',userRoute);
app.use('/',checkAuth,staticRoute);
app.post('/logout', (req, res) => {
  res.clearCookie('uid'); 
  res.redirect('login');
});



app.get('/url/:shortId', async (req, res) => {
  const shortId = req.params.shortId;

  try {
    const entry = await URL.findOneAndUpdate(
      { shortId },
      {
        $push: {
          visitHistory: {
            timestamp: Date.now()
          }
        }
      },
      { new: true } // return the updated document
    );

    if (!entry) {
      return res.status(404).send("Short URL not found");
    }

    return res.redirect(entry.redirectURL);

  } catch (err) {
    console.error("Redirect Error:", err);
    return res.status(500).send("Internal Server Error");
  }
});

app.listen(PORT,()=>console.log(`Server started at PORT:${PORT}`));

