const express = require('express');
const mongodb = require("mongodb");
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const cors = require('cors');

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

mongodb.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((mongoClient) => {
        console.log("Database connected successfully");
        db = mongoClient.db();
        usersCollection = db.collection('users');
        signUpCollection = db.collection('signup');
        app.listen(port);
    })
    .catch((reason) => {
        console.log(reason);
    });

app.get('/', (req, res) => {
    usersCollection.find({}).toArray((err, docs) => {
        if (err) {
            res.json('Error getting records from DB');
        } else {
            res.json(docs);
        }
    })
});

app.post('/register', (req, res) => {
    const { email, name, password } = req.body;

    usersCollection.findOne({ email: email })
        .then((value) => {
            if (value) {
                res.json('Email is already in use');
            } else {
                usersCollection.insertOne({
                    email: email,
                    name: name,
                    entries: 0,
                    joined: new Date()
                }, (err, info) => {
                        if (err) {
                            console.log(err);
                            res.json('Error registering user!');
                        } else {
                            // hash the password
                            const salt = bcrypt.genSaltSync(10);
                            const hash = bcrypt.hashSync(password, salt);
                            signUpCollection.insertOne({
                                email: email,
                                hash: hash
                            }, (err, user) => {
                                if (err) {
                                    console.log(err);
                                    res.json('Error registering user!');
                                } else {
                                    res.json(info.ops[0]);
                                }
                            });
                        }
                });
            }
        })
        .catch((err) => {
            res.json('Error registering user!');
        })    
});

app.post('/signin', (req, res) => {
    const { email, password } = req.body;

    signUpCollection.findOne({ email: email })
        .then((dbUser) => {
            if (dbUser) {
                if (bcrypt.compareSync(password, dbUser.hash)) {
                    usersCollection.findOne({ email: dbUser.email })
                        .then(user => res.json(user))
                } else {
                    res.json('The provided combination of email and password is incorrect');
                }
            } else {
                res.json('The email in invalid. Please register first before Signing In');
            }
        })
        .catch(err => res.json('Error signing in'))
});

app.put('/image', (req, res) => {
    usersCollection.updateOne({
        email: req.body.email
    }, {
        $inc: { entries: 1 }
    }, (err, updateResult) => {
        if (err) {
            res.json('Error updating user data');    
        } else {
            usersCollection.findOne({ email: req.body.email })
                .then(user => res.json(user.entries))
        }
    })
});

app.delete('/delete', (req, res) => {
    const { email } = req.body;

    usersCollection.deleteOne({ 
        email: email 
    }, (err, deleteResult) => {
        if (err) {
            res.json('Error deleting user entry');
        } else {
            signUpCollection.deleteOne({
                email: email
            }, (err, result) => {
                if (err) {
                    res.json('Error deleting user entry');
                } else {
                    res.json('Entry deleted');
                }
            })
        }
    })
});