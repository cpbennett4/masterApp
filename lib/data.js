// Library for storing and editing data

// Dependencies
const fs = require('fs');
const path = require('path');

// Container for the module
const lib = {};

// Base directory of data folder
lib.baseDir = path.join(__dirname, '../.data/');

// Write data to a file
lib.create = function(dir, filename, data, cb) {
    // open the file for writing
    fs.open(`${lib.baseDir}${dir}/${filename}.json`,'wx', function(err, fileDescriptor) {
        if (!err && fileDescriptor) {
            // convert data to a string
            const stringData = JSON.stringify(data);
            // Write to file and close it
            fs.writeFile(fileDescriptor, stringData, function(err) {
                if (!err) {
                    fs.close(fileDescriptor, function(err) {
                        if (!err) {
                            cb(false);
                        } else {
                            cb('Error closing new file');
                        }
                    });
                } else {
                    cb('Error writing to file');
                }
            });
        } else {
            cb('Could not create new file, it may already exist');
        }
    });
}

// Read data from a file
lib.read = function(dir, filename, cb) {
    fs.readFile(`${lib.baseDir}${dir}/${filename}.json`, 'utf-8', function(err, data) {
        cb(err, data);
    })
}

// Update data inside a file
lib.update = function(dir, filename, data, cb) {
    // open the file for writing
    fs.open(`${lib.baseDir}${dir}/${filename}.json`, 'r+', function(err, fileDescriptor) {
        if (!err && fileDescriptor) {
            // Convert data to string
            const stringData = JSON.stringify(data);
            // Truncate the file
            fs.ftruncate(fileDescriptor, function (err) {
                if (!err) {
                    // write to file and close it
                    fs.writeFile(fileDescriptor, stringData, function (err) {
                        if (!err) {
                            fs.close(fileDescriptor, function(err) {
                                if (!err) {
                                    cb(false);
                                } else {
                                    cb('error closing the file');
                                }
                            })
                        } else {
                            cb('error writing to existing file');
                        }
                    })
                } else {
                    cb('error truncating file');
                }
            });
        } else {
            cb(err);
        }
    })
}

lib.delete = function(dir, filename, cb) {
    // unlink file from filesystem
    fs.unlink(`${lib.baseDir}${dir}/${filename}.json`, function(err) {
        if(!err) {
            cb(false);
        } else {
            cb(err);
        }
    });
}

// Export module
module.exports = lib;