// Users

const userNameIsValid = function(name) {
    return typeof name === 'string' && name.trim().length > 0;
}

const phoneIsValid = function(number) {
    return typeof number === 'string' && number.trim().length === 10;
}

const passwordIsValid = function(password) {
    return typeof password === 'string' && password.trim().length > 0;
}

const tosAgreementIsValid = function(tosAgreement) {
    return typeof tosAgreement === 'boolean' && tosAgreement === true;
}

module.exports = { userNameIsValid, phoneIsValid, passwordIsValid, tosAgreementIsValid };
