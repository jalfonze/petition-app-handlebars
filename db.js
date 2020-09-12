const spicedPg = require("spiced-pg");

const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/musicians-info"
);

module.exports.getUsers = (email) => {
    return db.query(
        `
    SELECT *
    FROM users
    JOIN signatures
    ON users.id = signatures.user_id
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

module.exports.updateUsers = (fname, lname, id, email) => {
    console.log("DBDBDB: ", lname);
    return db.query(
        `
        UPDATE users
        SET first_name = ($1), last_name = ($2), email = ($4)
        WHERE id = ($3)
        `,
        [fname, lname, id, email]
    );
};
module.exports.updateUsersWPass = (fname, lname, id, email, pw) => {
    return db.query(
        `
        UPDATE users
        SET first_name = ($1), last_name = ($2), email = ($4), password = ($5)
        WHERE id = ($3)
        `,
        [fname, lname, id, email, pw]
    );
};

module.exports.updateProfile = (age, city, url, id) => {
    return db.query(
        `
        INSERT INTO user_profiles (age, city, url, user_id)
        VALUES ($1, $2, $3, $4) 
        ON CONFLICT (user_id)
        DO UPDATE SET age = $1, city = $2, url = $3, user_id = $4
        `,
        [age || null, city || null, url || null, id]
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
        WHERE user_id = ($1)
        `,
        [idNo]
    );
};

module.exports.addMusician = (userId, sig) => {
    console.log("DB USER ID: ", userId);
    return db.query(
        `
    INSERT INTO signatures (user_id, signature)
    VALUES ($1, $2)
    RETURNING id
    `, // dollar signs corresponds with each argument representing tha arguments in order they come in. Protects us from SQL injections // RETURN to get something back
        [userId, sig] // array goes hand in hand with dollar sign syntax
    );
};

module.exports.deleteSig = (id) => {
    return db.query(
        `
        DELETE FROM signatures
        WHERE user_id = ($1)
        `,
        [id]
    );
};

module.exports.deleteUser = (id) => {
    return db.query(
        `
        DELETE FROM users
        WHERE id = ($1)
        `,
        [id]
    );
};
