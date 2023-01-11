const express = require(`express`)
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId} = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express()
//middleware
app.use(cors())
app.use(express.json());



 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.i8hxp3j.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
 


async function run(){
    try{
        const serviceCollections = client.db('servicereviewwebsite').collection('services');
         const userServiceComment = client.db('servicereviewwebsite').collection('usersComment')


        //use limit 3
        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollections.find(query)
            const resualt = await cursor.limit(3).toArray();
            res.send(resualt);
        })

        //no limit
        app.get('/allservice', async (req, res) => {
            const query = {}
            const cursor = await serviceCollections.find(query).toArray();
            res.send(cursor);
        })
        //sspecific service:
        app.get('/service/:id', async(req,res) =>{
            const id= req.params.id;
            console.log(id)
            const query={_id : ObjectId(id)}
            const resualt = await serviceCollections.findOne(query);
            res.send(resualt)
        })

        //comment
        app.post('/comments', async(req,res) =>{
            const users = req.body;
            console.log(users)
            const resualt = await userServiceComment.insertOne(users)
            res.send(resualt)
        })
        //comment get:
        app.get('/comments', async(req,res) => {
            const query = {}
            const resualt = await userServiceComment.find(query).toArray()
            console.log(resualt);
            res.send(resualt)
        })



    }
    finally{

    }
}
run().catch(err => console.log(err))





//texting perpuse
app.get('/', (req, res) => {
    res.send(`Single service running`)
})

app.listen(port, () => {
    console.log(`the port is running ${port}`);
})