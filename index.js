const express = require('express');
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;

const app = express();

// middle ware

app.use(cors());
app.use(express.json());


// mongo db code start

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ectfhk2.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        const serviceCollection = client.db("carDoctors").collection('services');

        const bookingCollections = client.db("carDoctors").collection('bookingData');

        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find();
            const result = await cursor.toArray();
            res.send(result);

        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const options = {
                projection: { title: 1, price: 1, service_id: 1, img: 1 }
            }

            const result = await serviceCollection.findOne(query, options);

            res.send(result);
        })

        app.post('/bookingData', async (req, res) => {
            const data = req.body;
            const result = await bookingCollections.insertOne(data);
            res.send(result);
        })

        app.get('/bookingData' , async (req,res) => {
            const req_email = req.query.email;
            let query = {};
            
            if(req_email){
              query={email:req_email}
            }
            const result = await bookingCollections.find(query).toArray();
            res.send(result);
        })

        app.delete('/bookingData/:id' , async (req,res) => {
            const id = req.params.id;
            const query = {_id : new ObjectId(id)};
            const result = await bookingCollections.deleteOne(query);
            res.send(result);
        })

        app.patch('/bookingData/:id', async(req,res) => {
            const id = req.params.id;

            const filter = {_id: new ObjectId(id)}

            const updatedBooking = req.body;

            const updateDoc = {
                $set: {
                   status : updatedBooking.status
                },
              };
            
            const result = await bookingCollections.updateOne(filter , updateDoc);

            res.send(result);
        })


 } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


// mongodb code ends

app.get('/', (req, res) => {
    res.send("Car-Doctors Server is Prepared");
})

app.listen(port, () => {
    console.log("server is running in cmd backend")
})