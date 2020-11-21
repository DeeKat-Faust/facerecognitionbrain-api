const handleDeleteUser = (req, res, usersCollection, signUpCollection) => {
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
}

module.exports = {
    handleDeleteUser
}