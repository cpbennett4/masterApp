// Request Handerlers

// Dependencies
const { userNameIsValid, phoneIsValid, passwordIsValid, tosAgreementIsValid, idIsValid, extendIsValid } = require('../utils/handlers');
const _data = require('./data');
const helpers = require('./helpers');

// define handlers
const handlers = {};

// Users
handlers.users = function(data, cb) {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, cb);
    } else {
        cb(405);
    }
};

// Container for users submethods
handlers._users = {};

// Users -- post
// Requeired data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = function(data, cb) {
    const { firstName, lastName, phone, password, tosAgreement } = data.payload;
    // check that all required fields are filled out
    const checkedFirstName = userNameIsValid(firstName) ? firstName.trim() : false;
    const checkedLasttName = userNameIsValid(lastName) ? lastName.trim() : false;
    const checkedPhone = phoneIsValid(phone) ? phone.trim() : false;
    const checkedPassword = passwordIsValid(password) ? password.trim() : false;
    const checkedTosAgreement = tosAgreementIsValid(tosAgreement);

    if (checkedFirstName && checkedLasttName && checkedPhone && checkedPassword && checkedTosAgreement) {
        // make sure that the user doesn't already exist
        _data.read('users', phone, function(err, data) {
            if (err) {
                // hash password
                const hashedPassword = helpers.hash(password);

                // create the user object
                if (hashedPassword) {
                    const userObject = {
                        firstName: checkedFirstName,
                        lastName: checkedLasttName,
                        phone: checkedPhone,
                        hashedPassword,
                        tosAgreement: checkedTosAgreement
                    };

                    // Store the user
                    _data.create('users', phone, userObject, function(err) {
                        if (!err) {
                            cb(200);
                        } else {
                            console.log(err);
                            cb(500, { error: 'Could not create the new user' });
                        }
                    });
                } else {
                    cb(500, { error: 'Could not hash the user\'s password' })
                }
            } else {
                // user already exists
                cb(400, { error: 'A user with that phone number already exists'})
            }
        });
    } else {
        cb(400, { Error: 'Missing required fields' })
    }
};

// Users -- get
// Requred data: phone
// Optional data: none
// @TODO only let authenticated user access their own object, not anyone else's
handlers._users.get = function(data, cb) {
    const { phone } = data.queryStringObject;
    // check that phone number provided is valid
    const checkedPhone = typeof phone === 'string' && phone.trim() === 10 ? phone : false;
    if (checkedPhone) {
        // Lookup the user
        _data.read('users', phone, function(err, data) {
            if (!err && data) {
                // Remove hashed password from user object before returning it to consumer
                delete data.hashedPassword;
                cb(200, data);
            } else {
                cb(404);
            }
        });
    } else {
        cb(400, { error: 'Missing required field' });
    }
};

// Users -- put
// Required data : phone
// Optional data: firstName, lastName, password (at least one must be specified)
// @TODO only let authenticated user access their own object, not anyone else's
handlers._users.put = function(data, cb) {
    const { phone, firstName, lastName, password } = data.payload;
    // check for the required field
    const checkedPhone = phoneIsValid(phone) ? phone.trim() : false;
    // check for optional fields
    const checkedFirstName = userNameIsValid(firstName) ? firstName.trim() : false;
    const checkedLasttName = userNameIsValid(lastName) ? lastName.trim() : false;
    const checkedPassword = passwordIsValid(password) ? password.trim() : false;

    // error if the phone is invalid
    if (phone) {
        if (firstName || lastName || password) {
            // lookup the user
            _data.read('users', phone, function(err, userData) {
                if(!err && userData) {
                    // update the fields that are necessary
                    if(firstName) {
                        userData.firstName = firstName;
                    }
                    if(lastName) {
                        userData.lastName = lastName;
                    }
                    if(password) {
                        userData.hashedPassword = helpers.hash(password);
                    }
                    // store the new updates
                    _data.update('users', phone, userData, function(err) {
                        if(!err) {
                            cb(200);
                        } else {
                            console.log(err);
                            cb(500, { Error: 'Could not update the user' });
                        }
                    });
                } else {
                    cb(400, { Error: 'The specified user does not exist' });
                }
            })
        } else {
            cb(400, { Error: 'Missing fields to update' });
        }
    } else {
        cb(400, { Error: 'Missing required filed' });
    }
};

// Users -- delete
// Required fields: phone
// @TODO only let an authenticated user delete their object, not anyone elses
// clean up any other data files associated with this user
handlers._users.delete = function(data, cb) {
    const { phone } = data.queryStringObject;
    // check that phone number provided is valid
    const checkedPhone = phoneIsValid(phone) ? phone : false;
    if (checkedPhone) {
        // Lookup the user
        _data.read('users', phone, function(err, data) {
            if (!err && data) {
                _data.delete('users', phone, function(err) {
                    if(!err) {
                        cb(200);
                    } else {
                        cb(500, { Error: 'Could not delete the specified user' });
                    }
                });
            } else {
                cb(400, { Error: 'Could not find the specified user' });
            }
        });
    } else {
        cb(400, { error: 'Missing required field' });
    }
};

// Tokens
handlers.tokens = function(data, cb) {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, cb);
    } else {
        cb(405);
    }
};

// container for tokens methods
handlers._tokens = {};

// Tokens - post
// required data: phone, password
// Optional data: none
handlers._tokens.post = function(data, cb) {
    const { phone, password } = data.payload;
    const checkedPhone = phoneIsValid(phone) ? phone.trim() : false;
    const checkedPassword = passwordIsValid(password) ? password.trim() : false;
    if(phone && password) {
        // lookup the user who matches that phone number
        _data.read('users', phone, function(err, userData) {
            if(!err && userData) {
                // has sent password and compare to existing password in user object
                const hashedPassword = helpers.hash(password);
                if(hashedPassword === userData.hashedPassword) {
                    // create a new token with a random name
                    // set expiration date 1 hour into the future
                    const tokenId = helpers.createRandomString(20);
                    const expires = Date.now() + 1000 * 60 * 60;
                    const tokenObject = {
                        phone,
                        id: tokenId,
                        expires
                    };
                    // store the token
                    _data.create('tokens', tokenId, tokenObject, function(err) {
                        if(!err) {
                            cb(200, tokenObject);
                        } else {
                            cb(500, { Error: 'Could not create the new token' });
                        }
                    });
                } else {
                    cb(400, { Error: "Password did not match the specified user's stored password" });
                }
            } else {
                cb(400, { Error: 'Could not find specified user' });
            }
        });
    } else {
        cb(400, { Error: 'Missing required fields' });
    }
};

// Tokens - get
// required data: id
// optional data: none
handlers._tokens.get = function(data, cb) {
    // check that the id that was sent is valid
    const { id } = data.queryStringObject;
    // check that id number provided is valid
    const checkedId = idIsValid(id) ? id.trim() : false;
    if (checkedId) {
        // Lookup the user
        _data.read('tokens', id, function(err, tokenData) {
            if (!err && tokenData) {
                cb(200, tokenData);
            } else {
                cb(404);
            }
        });
    } else {
        cb(400, { error: 'Missing required field' });
    }
};

// Tokens - put
// required fields: id, extend
// optional data: none
handlers._tokens.put = function(data, cb) {
    const { id, extend } = data.payload;
    const checkedId = idIsValid(id) ? id.trim() : false;
    const checkedExtend = extendIsValid(extend);
    if(checkedId && checkedExtend) {
        // lookup the token
        _data.read('tokens', id, function(err, tokenData) {
            if(!err && tokenData) {
                // check to make sure the token isn't already expired
                if(tokenData.expires > Date.now()) {
                    // set the expiration an hour from now
                    tokenData.expires = Date.now() + 1000 * 60 * 60;
                    // store new updates
                    _data.update('tokens', id, tokenData, function(err) {
                        if(!err) {
                            cb(200);
                        } else {
                            cb(500, { Error: 'Could not update the token\'s expiration' })
                        }
                    });
                } else {
                    cb(400, { Error: 'The token has already expired and cannot be extended' });
                }
            } else {
                cb(400, { Error: 'specified token does not exist' });
            }
        });
    } else {
        cb(400, { Error: 'Missing required field(s) or field(s) are invalid' });
    }
};

// Tokens - delete
// required data: id
// optional data: none
handlers._tokens.delete = function(data, cb) {
    const { queryStringObject: { id } } = data;
    // check that id provided is valid
    const checkedId = idIsValid(id) ? id : false;
    if (checkedId) {
        // Lookup the user
        _data.read('tokens', id, function(err, data) {
            if (!err && data) {
                _data.delete('tokens', id, function(err) {
                    if(!err) {
                        cb(200);
                    } else {
                        cb(500, { Error: 'Could not delete the specified token' });
                    }
                });
            } else {
                cb(400, { Error: 'Could not find the specified token' });
            }
        });
    } else {
        cb(400, { error: 'Missing required field' });
    }
};

// Ping handler
handlers.ping = function(data, cb) {
    cb(200);
};

// not found handler
handlers.notFound = function(data, cb) {
    cb(404);
};

// export handlers
module.exports = handlers;
