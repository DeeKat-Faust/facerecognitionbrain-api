const handleRegister = (
  req,
  res,
  signUpCollection,
  usersCollection,
  bcrypt
) => {
  const { email, name, password } = req.body;

  usersCollection
    .findOne({ email: email })
    .then((value) => {
      if (value) {
        res.json("Email is already in use");
      } else {
        usersCollection.insertOne(
          {
            email: email,
            name: name,
            entries: 0,
            joined: new Date(),
          },
          (err, info) => {
            if (err) {
              console.log(err);
              res.json("Error registering user!");
            } else {
              // hash the password
              const salt = bcrypt.genSaltSync(10);
              const hash = bcrypt.hashSync(password, salt);
              signUpCollection.insertOne(
                {
                  email: email,
                  hash: hash,
                },
                (err, user) => {
                  if (err) {
                    console.log(err);
                    res.json("Error registering user!");
                  } else {
                    res.json(info.ops[0]);
                  }
                }
              );
            }
          }
        );
      }
    })
    .catch((err) => {
      res.json("Error registering user!");
    });
};

module.exports = {
  handleRegister,
};
