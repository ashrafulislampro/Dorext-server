const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(express.json());
app.use(cors());

/* -------------------------- MONGO DB CLIENT SETUP ------------------------- */
// const uri = `mongodb+srv://@cluster0.xwgkc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// const client = new MongoClient(uri, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.q0pfb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
// client.connect((err) => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });

async function server() {
  try {
    await client.connect();
    const database = client.db("process.env.DB_NAME");
    const tourCollection = database.collection("process.env.DB_CONNECT");
    const orderCollection = database.collection("process.env.DB_CONNECT2");

    //REQUEST TO GET ALL TOURS
    app.get("/tours", async (req, res) => {
      const result = await tourCollection.find({}).toArray();
      res.send(result);
    });

    //REQUEST TO GET ONE SPECIFIC TOUR
    app.get("/tour/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await tourCollection.findOne(query);

      res.send(result);
    });

    //REQUEST GET FROM HOME TOURS
    app.get("/home/tours", async (req, res) => {
      const query = { category: "popular" };
      const result = await tourCollection.find(query).toArray();
      res.send(result);
    });

    //REQUEST TO GET CURRENT USER'S ORDERS
    app.get("/my_order/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: `${email}` };
      const result = await orderCollection.find(query).toArray();
      res.json(result);
    });

    //REQUEST TO GET ALL ORDERS
    app.get("/all_orders", async (req, res) => {
      const result = await orderCollection.find({}).toArray();
      res.json(result);
    });

    //REQUEST POST A NEW TOUR
    app.post("/tours", async (req, res) => {
      const tour = req.body;
      const result = await tourCollection.insertOne(tour);
      res.json(result);
    });

    //REQUEST POST FOR PLACE ORDER
    app.post("/tour/booking", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);

      res.json(result);
    });

    //REQUEST TO UPDATE A ORDER STATUS
    app.put("/all_orders/:id", async (req, res) => {
      const id = req.params.id;
      const order = req.body;

      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const update = {
        $set: {
          status: order.status,
        },
      };
      const result = await orderCollection.updateOne(query, update, options);
      res.json(result);
    });

    //REQUEST TO DELETE A ORDER
    app.delete("/my_order_list/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);

      res.json(result);
    });
  } finally {
    // await client.close();
  }
}

server().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from dorext project server");
});

app.listen(port, () => {
  console.log("Server running on", port);
});
