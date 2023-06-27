const express = require('express');
const mongoose = require('mongoose');
const { MongoClient } = require( "mongodb");
const ShortURL = require('./models/shortURL');
const dotenv = require('dotenv')
const app = express();
dotenv.config()

// mongoose.connect('mongodb://127.0.0.1:27017/myapp');
mongoose.connect(process.env.MONGO_URI,{
  useNewUrlParser:true,
  useUnifiedTopology:true
}).then(()=>console.log('connected with db')).catch((error)=>{console.log(error)})
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
const client = new MongoClient("mongodb+srv://nimishshukla01:nimish01@url-shortener.trvtrvs.mongodb.net/shortenedURL?retryWrites=true&w=majority");
app.get('/', async function(req, res) {
  try {
    const shortUrls = await ShortURL.find();
    res.render('Main', { shortUrls });
  } catch (error) {
    res.sendStatus(500);
  }
});

var collection;
app.get('/search',async(req,res)=>{
  try {
    const { full } = req.query

		const agg = [
			{
				$search: {
					autocomplete: {
						query: full,
						path: 'full',
						fuzzy: {
							maxEdits: 2,
						},
					},
				},
			},
			{
				$limit: 5,
			},
			{
				$project: {
					_id: 0,
					full: 1,
					short: 1,
					clicks: 1,
				},
			},
		]

		const response = await ShortURL.aggregate(agg)

		return res.json(response)

  } catch (error) {
    console.log(error)
    return res.json([])
  }
})
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
      await client.connect();
      collection = client.db("shortenedURL").collection("shorturls");
      console.log(`Server started at PORT:${port}`);
  }catch (e){
      console.error(e);
  }
});