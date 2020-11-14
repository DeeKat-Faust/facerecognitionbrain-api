const express = require('express');
const mongodb = require("mongodb");
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

dotenv.config();

let db;

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3005;
}

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const connectionString = process.env.CONNECTION_STRING;

mongodb.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((mongoClient) => {
        console.log("Database connected successfully");
        db = mongoClient.db();
        app.listen(port);
    })
    .catch((reason) => {
        console.log(reason);
    });

app.get('/', (req, res) => {
    console.log('Root');
});

app.post('/register', (req, res) => {
    const { email, name, password } = req.body;

    db.collection('users').findOne({ email: email })
        .then((value) => {
            if (value) {
                res.json('Email is already in use');
            } else {
                db.collection('users').insertOne({
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
                            db.collection('signup').insertOne({
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

    db.collection('signup').findOne({ email: email })
        .then((dbUser) => {
            if (dbUser) {
                if (bcrypt.compareSync(password, dbUser.hash)) {
                    res.json('Logged In');
                } else {
                    res.json('The provided combination of email and password is incorrect');
                }
            } else {
                res.json('The email in invalid. Please register first before Signing In');
            }
        })
});

app.put('/image', (req, res) => {
    db.collection('users').updateOne({
        email: req.body.email
    }, {
        $inc: { entries: 1 }
    }, (updateResult) => {
        res.json('Updated entries');
    })
});