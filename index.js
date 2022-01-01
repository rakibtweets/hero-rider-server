const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yyvj2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db('hero-rider');
    const usersCollection = database.collection('users');
    const riderCollection = database.collection('riders');

    // post user
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });

    //Get all Riders
    app.get('/riders', async (req, res) => {
      const cusor = riderCollection.find({});
      const result = await cusor.toArray();
      res.send(result);
    });

    //search registered user

    app.get('/allRiders', async (req, res) => {
      const search = req.query.search;
      const query = { email: search, fullName: search, phoneNo: search };
      const cusor = riderCollection.find(query);
      const result = await cusor.toArray();
      res.send(result);
    });

    //GET riders details
    app.get('/riders/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await riderCollection.findOne(query);
      res.json(result);
    });
    // post Rider
    app.post('/riders', async (req, res) => {
      const riderInfo = req.body;
      const result = await riderCollection.insertOne(riderInfo);
      res.json(result);
    });

    //get admin
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === 'admin') {
        isAdmin = true;
      }
      res.send({ admin: isAdmin });
    });

    // make an user admin

    app.put('/users/admin', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: 'admin' } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
  } finally {
    //   await client.close();
  }
}
run().catch(console.dir);

// listening to the server

app.get('/', (req, res) => {
  res.send('Hero Rider server running');
});

app.listen(port, () => {
  console.log('Running server on port', port);
});
