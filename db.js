const spicedPg = require("spiced-pg");

const db = spicedPg("postgres:postgres:postgres@localhost:5432/musicians-info");

module.exports.getUsers = (email) => {
    return db.query(
        `
    SELECT *
    FROM users
    WHERE email = ($1)
    `,
        [email]
    );
};

module.exports.getUsersProfile = () => {
    return db.query(
        `
    SELECT *
    FROM signatures
    JOIN user_profiles
    ON signatures.user_id = user_profiles.user_id
    JOIN users
    ON signatures.user_id = users.id
    `
    );
};

module.exports.getCity = (city) => {
    return db.query(
        `
    SELECT *
    FROM signatures
    JOIN user_profiles
    ON signatures.user_id = user_profiles.user_id
    JOIN users
    ON users.id = signatures.user_id
    WHERE LOWER (city) = LOWER($1)
    `,
        [city]
    );
};

module.exports.getCurrentUser = (idNo) => {
    return db.query(
        `
        SELECT * 
        FROM users
        JOIN user_profiles
        ON users.id = user_profiles.user_id
        WHERE users.id = ($1)
        `,
        [idNo]
    );
};

module.exports.addUsers = (firstname, lastname, email, pw) => {
    return db.query(
        `
        INSERT INTO users (first_name, last_name, email, password)
        VALUES ($1, $2, $3, $4)
        RETURNING id
        `,
        [firstname, lastname, email, pw]
    );
};

module.exports.addProfile = (age, city, url, user_id) => {
    return db.query(
        `
    INSERT INTO user_profiles (age, city, url, user_id)
    VALUES ($1, $2, $3, $4)
    `,
        [age || null, city || null, url || null, user_id]
    );
};

module.exports.getMusicians = () => {
    return db.query(`SELECT * FROM signatures`);
};

module.exports.showSignature = (idNo) => {
    return db.query(
        `
        SELECT signature
        FROM signatures
        WHERE id = ($1)
        `,
        [idNo]
    );
};

module.exports.addMusician = (userId, sig) => {
    return db.query(
        `
    INSERT INTO signatures (user_id, signature)
    VALUES ($1, $2)
    RETURNING id
    `, // dollar signs corresponds with each argument representing tha arguments in order they come in. Protects us from SQL injections // RETURN to get something back
        [userId, sig] // array goes hand in hand with dollar sign syntax
    );
};
