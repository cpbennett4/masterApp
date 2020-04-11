// Request Handerlers

// Dependencies
const { userNameIsValid, phoneIsValid, passwordIsValid, tosAgreementIsValid } = require('../utils/handlers');
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
    const { queryStringObject: { phone } } = data;
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
    const { payload: { phone, firstName, lastName, password } } = data;
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
    const { queryStringObject: { phone } } = data;
    // check that phone number provided is valid
    const checkedPhone = typeof phone === 'string' && phone.trim().length === 10 ? phone : false;
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
