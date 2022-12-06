const bcrypt = require('bcryptjs');

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// define the user schema
var userSchema = new Schema({
    "userName": { type: String, unique: true },
    "password": String,
    "email": String,
    "loginHistory": [{ "dateTime": Date, "userAgent": String }]
});

let User;

//initialize
module.exports.initialize = function () {

    return new Promise(function (resolve, reject) {

        let db = mongoose.createConnection(`mongodb+srv://dbuser:dbpass@senecaweb.nfty2og.mongodb.net/assignment6?retryWrites=true&w=majority`);

        db.on('error', (err) => {
            reject(err);
        });

        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        });

    });

}

//register user
module.exports.registerUser = function (userData) {

    return new Promise(function (resolve, reject) {

        if (userData.password.length === 0 || userData.password2.length === 0 || /^\s+$/.test(userData.password) || /^\s+$/.test(userData.password2)) {
            reject("User name cannot be empty or only white spaces!");
        }
        else if (userData.password !== userData.password2) {
            reject("Passwords do not match!");
        }
        else {
            bcrypt.hash(userData.password, 10)
                .then(hash => {
                    userData.password = hash;
                    let newUser = new User(userData);

                    newUser.save()
                        .then(function () {
                            resolve();
                        }).catch(function (error) {
                            if (error.code === 11000) {
                                reject("User Name already taken!")
                            }
                            else {
                                reject("There was an error creating the user: " + error)
                            }
                        });
                }).catch(function () {
                    reject("There was an error encrypting the password");
                });
        }

    });

}

//check user
module.exports.checkUser = function (userData) {

    return new Promise(function (resolve, reject) {
        User.findOne({ userName: userData.userName }).exec()
            .then(function (foundUser) {
                if (!foundUser) {
                    reject("Unable to find user: " + userData.userName);
                }
                else {
                    bcrypt.compare(userData.password, foundUser.password)
                    .then((result) => {
                        if (result === true) {
                            foundUser.loginHistory.push({ dateTime: (new Date()).toString(), userAgent: userData.userAgent });
                            User.updateOne({ userName: foundUser.userName }, { $set: { loginHistory: foundUser.loginHistory } }).exec()
                                .then(function () {
                                    resolve(foundUser);
                                })
                                .catch(function (error) {
                                    reject("There was an error verifying the user: " + error);
                                })
                        }
                        else if (result === false) {
                            reject("Incorrect Password for user: " + userData.userName);
                        }
                    });
                }
            })
            .catch(function (error) {
                reject("Unable to find user: " + userData.userName);
            });
    });

}