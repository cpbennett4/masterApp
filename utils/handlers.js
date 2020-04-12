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

const idIsValid = function(id) {
    return typeof id === 'string' && id.trim().length === 20;
}

const extendIsValid = function(extend) {
    console.log('extned: ', extend);
    console.log('extned: ', typeof extend);
    return typeof extend === 'boolean' && extend === true;
}

module.exports = { userNameIsValid, phoneIsValid, passwordIsValid, tosAgreementIsValid, idIsValid, extendIsValid };
