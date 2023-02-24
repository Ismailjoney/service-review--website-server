const express = require(`express`)
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId} = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express()
//middleware
app.use(cors())
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.i8hxp3j.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


 
function tokenVerify(req, res, next){
    const authHeader = req.headers.authorization;
     
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }

    const token = authHeader.split(` `)[1]

    //token match & email check
    jwt.verify(token, process.env.SECRET_WEB_TOKEN, function(err, decoded){
        if (err) {
            console.log(err)
            return res.status(403).send({ message: 'Forbidden access' });
        }
        req.decoded = decoded;
        next();
    })
}


async function run(){
    try{
        const serviceCollections = client.db('servicereviewwebsite').collection('services');
         const userServiceComment = client.db('servicereviewwebsite').collection('usersComment');
         const addServicesCollections = client.db('servicereviewwebsite').collection('addServices')


        //Jwt token :
        app.post(`/jwt`, (req,res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.SECRET_WEB_TOKEN, {expiresIn: `10d`});
            res.send({token})
        })
       

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
            const query={_id : ObjectId(id)}
            const resualt = await serviceCollections.findOne(query);
            res.send(resualt)
        })

        //user comment post
        app.post('/comments', async(req,res) =>{
            const users = req.body;
            const resualt = await  userServiceComment.insertOne(users)
            res.send(resualt)
        })
        //comment get:
        app.get('/comments', async(req,res) => {
            const query = {}
            const resualt = await userServiceComment.find(query).toArray()
            res.send(resualt)
        })

         
        //get comments by email..
        app.get(`/reviews`, tokenVerify, async(req,res) => {
            const decoded = req.decoded;
           
            if(decoded.email !== req.query.email){
                res.status(403).send({message: 'unauthoraized access'})
            }

            let query = {}
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const resualt = await userServiceComment.find(query).toArray();
            res.send(resualt);
        })

        //delete user comment:
        app.delete('/reviewdelete/:id', async(req,res)=>{
            const id = req.params.id;
            const query ={_id: ObjectId(id)}
            const resualt = await userServiceComment.deleteOne(query);
            res.send(resualt)
        })
         

        //post my service
        app.post('/addservices', async(req,res)=>{
            const services = req.body;
            const resualt = await addServicesCollections.insertOne(services);
            res.send(resualt)
        })

        //get add services
        app.get('/addservices', async (req, res) => {      
            const query = {}
            const cursor = await addServicesCollections.find(query).toArray();
            res.send(cursor);
        })

    // specific user added service data by email query:(my addservice route)
    app.get('/addservicess', tokenVerify,  async (req, res) => {
        //console.log(req.query.email)
        const decoded = req.decoded;
           
            if(decoded.email !== req.query.email){
                res.status(403).send({message: 'unauthorized access'})
            }
            let query = {}
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const  resualt = await addServicesCollections.find(query).toArray();
            res.send(resualt);
        })
        
        //delete my added service
        app.delete(`/servicedelete/:id`, async(req,res)=>{
            const id = req.params.id;
            const query ={_id: ObjectId(id)}
            const resualt = await addServicesCollections.deleteOne(query);
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