const express = require('express');
const mongoose = require('mongoose');
const { MongoClient, ObjectID } = require("mongodb");
const ShortURL = require('./models/shortURL');
const dotenv = require('dotenv')
const app = express();
const cors = require('cors')
const bodyParser = require('body-parser')
const Client = new MongoClient("mongodb+srv://nimishshukla01:nimish01@url-shortener.trvtrvs.mongodb.net/shortenedURL?retryWrites=true&w=majority");
dotenv.config()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( { extended:true } ));
app.use(cors());


// mongoose.connect('mongodb://127.0.0.1:27017/myapp');
mongoose.connect("mongodb+srv://nimishshukla01:nimish01@url-shortener.trvtrvs.mongodb.net/shortenedURL?retryWrites=true&w=majority",{
  useNewUrlParser:true,
  useUnifiedTopology:true
}).then(()=>console.log('connected with db')).catch((error)=>{console.log(error)})


app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
var collection;
app.get('/search',async(request,response)=>{
  try {
    
    let result = await collection.aggregate([
      {
        "$search": {
          "autocomplete":{
            "query": `${request.query.term}`,
            "path":"full",
          }
        }
      }
    ]).toArray();
    response.send(result);
  } catch (error) {
    response.status(500).send({message:error.message})
  }
});
app.get('/', async function(req, res) {
  try {
    const shortUrls = await ShortURL.find();
    res.render('Main', { shortUrls });
  } catch (error) {
    res.sendStatus(500);
  }
});
app.get("/get/:id", async (request, response) => {
  try {
      let result = await collection.findOne({ "_id": ObjectID(request.params.id) });
      response.send(result);
  } catch (e) {
      response.status(500).send({ message: e.message });
  }
});

app.post('/ShortenedURL', async function(req, res) {
  try {
    await ShortURL.create({ full: req.body.bigurl });
    res.redirect('/');
  } catch (error) {
    res.sendStatus(500);
  }
});

app.get('/:shortUrl', async function(req, res) {
  try {
    const shortUrl = await ShortURL.findOne({ short: req.params.shortUrl });
    if (!shortUrl) {
      return res.sendStatus(404);
    }
  
    shortUrl.clicks++;
    await shortUrl.save();
  
    res.redirect(shortUrl.full);
  } catch (error) {
    res.status(500).send({message: e.message});
  }
});

const port = process.env.PORT || 5000;


app.listen(port, async () => {
  try{
    await Client.connect();
    collection = Client.db("shortenedURL").collection("shorturls");
      console.log(`Server started at PORT:${port}`);
  }catch (e){
      console.error(e);
  }
});