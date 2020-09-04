const spicedPg = require("spiced-pg");

const db = spicedPg("postgres:postgres:postgres@localhost:5432/musicians-info");

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

module.exports.addMusician = (first, last, sig) => {
    return db.query(
        `
    INSERT INTO signatures (first, last, signature)
    VALUES ($1, $2, $3)
    RETURNING id
    `, // dollar signs corresponds with each argument representing tha arguments in order they come in. Protects us from SQL injections // RETURN to get something back
        [first, last, sig] // array goes hand in hand with dollar sign syntax
    );
};