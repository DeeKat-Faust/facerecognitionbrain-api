const handleGetUsers = (req, res, usersCollection) => {
    usersCollection.find({}).toArray((err, docs) => {
        if (err) {
            res.json('Error getting records from DB');
        } else {
            res.json(docs);
        }
    })
}

module.exports = {
    handleGetUsers
}