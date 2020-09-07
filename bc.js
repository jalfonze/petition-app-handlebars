const bcryptjs = require("bcryptjs");
let { genSalt, hash, compare } = bcryptjs;
const { promisify } = require("util");

genSalt = promisify(genSalt);
hash = promisify(hash);
compare = promisify(compare);

module.exports.compare = compare;
module.exports.hash = (plainTextPwFromUser) => {
    return genSalt().then((salt) => {
        return hash(plainTextPwFromUser, salt);
    });
};
