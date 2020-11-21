const Clarifai = require('clarifai');

const handleAPICall = (req, res) => {

    const clarifaiApp = new Clarifai.App({
        apiKey: process.env.CLARIFAI_API_KEY
    });

    clarifaiApp.models.initModel({ id: Clarifai.FACE_DETECT_MODEL })
        .then(faceModel => faceModel.predict(req.body.input))
        .then(data => res.json(data))
        .catch(err => res.status(400).json('API is unavailable'))
}

const handleImage = (req, res, usersCollection) => {
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
}

module.exports = {
    handleImage,
    handleAPICall
}