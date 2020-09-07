DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures (
     id SERIAL PRIMARY KEY,
     first VARCHAR NOT NULL CHECK (first != ''),
     last VARCHAR NOT NULL CHECK (last != ''),
     signature TEXT NOT NULL CHECK (signature != '')
);

DROP TABLE IF EXISTS users;

CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     fist_name VARCHAR NOT NULL,
     last_name VARCHAR NOT NULL,
     email VARCHAR NOT NULL UNIQUE,
     password VARCHAR NOT NULL,
     created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);