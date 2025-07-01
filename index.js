const express=require('express');
const path=require('path');
const URL =require('./models/url.js');
const app=express();
const connectToMongoDB=require('./connet.js');

const urlRoute=require('./routers/url');
const staticRoute=require('./routers/staticRouter.js');


const PORT=3000;

//MongoDB Connect
const MongoUrl="mongodb+srv://jackalxa1:RnWaxvaSUOVj2m6I@cluster0.op82zh4.mongodb.net/";
connectToMongoDB(MongoUrl).then(()=>console.log('mongoDB Connected'));

//Middlewares
app.use(express.json());
app.use(express.urlencoded({extended:false}));

//Server Side Rendering
app.set("view engine","ejs");
app.set("views",path.resolve("./views"));


//Routes
app.use('/url',urlRoute);
app.use('/',staticRoute);



app.get('/url/:shortId',async (req,res)=>{
    const shortId=req.params.shortId;
    const entry=await URL.findOneAndUpdate({
        shortId
    },{$push:{
        visitHistory: {
            timestamp:Date.now()
        }
    }});
    res.redirect(entry.redirectURL);
})

app.listen(PORT,()=>console.log(`Server started at PORT:${PORT}`));

