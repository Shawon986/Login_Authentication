const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv").config();
const app = express();
app.use(bodyParser.json());
const db_connect = require("./config/db");
const Visitors = require("./models/schema")
const authAccessToken = require("./middleware/auth")

//! MongoDb connection
db_connect()


//! Connection Check
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Login Authentication app" });
});
//! Routes
app.use("/api/visitors",require("./routes/api/route"))





//! Get a visitor profile
app.get("/visitors/profile", authAccessToken, async (req, res) => {
  try {
    const id = req.payload.id;
    const visitor = await Visitors.findById(id);
    if (!visitor) {
      res.status(404).json({ message: "Visitor  not found" });
    } else {
      res.json(visitor);
    }
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({ message: "Something went wrong with the server !!!" });
  }
});



const port = process.env.PORT;
app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});

