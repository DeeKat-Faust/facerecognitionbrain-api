const handleSignin = (req, res, signUpCollection, usersCollection, bcrypt) => {
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
}

module.exports = {
    handleSignin
}