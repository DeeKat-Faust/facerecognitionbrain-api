const express = require("express");
const mongodb = require("mongodb");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const cors = require("cors");

const GetUsers = require("./controllers/GetUsers");
const Register = require("./controllers/Register");
const Signin = require("./controllers/Signin");
const Image = require("./controllers/Image");
const DeleteUser = require("./controllers/DeleteUser");

dotenv.config();

let db;
let usersCollection;
let signUpCollection;
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3005;
}

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

const connectionString = process.env.CONNECTION_STRING;

mongodb
  .connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((mongoClient) => {
    console.log("Database connected successfully");
    db = mongoClient.db();
    usersCollection = db.collection("users");
    signUpCollection = db.collection("signup");
    console.log(usersCollection);
    console.log(signUpCollection);
    app.listen(port);
  })
  .catch((reason) => {
    console.log(reason);
  });

app.get("/", (req, res) => GetUsers.handleGetUsers(req, res, usersCollection));
app.post("/register", (req, res) =>
  Register.handleRegister(req, res, signUpCollection, usersCollection, bcrypt)
);
app.post("/signin", (req, res) =>
  Signin.handleSignin(req, res, signUpCollection, usersCollection, bcrypt)
);
app.put("/image", (req, res) => Image.handleImage(req, res, usersCollection));
app.post("/imageurl", (req, res) => Image.handleAPICall(req, res));
app.delete("/delete", (req, res) =>
  DeleteUser.handleDeleteUser(req, res, usersCollection, signUpCollection)
);
