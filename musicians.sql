DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     first_name VARCHAR NOT NULL,
     last_name VARCHAR NOT NULL,
     email VARCHAR NOT NULL UNIQUE,
     password VARCHAR NOT NULL,
     created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures (
     id SERIAL PRIMARY KEY,
     signature TEXT NOT NULL CHECK (signature != ''),
     user_id INT NOT NULL REFERENCES users(id),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


DROP TABLE IF EXISTS user_profiles CASCADE;

CREATE TABLE user_profiles(
     id SERIAL PRIMARY KEY,
     age INT,
     city VARCHAR(255),
     url VARCHAR(255),
     user_id INT NOT NULL UNIQUE REFERENCES users(id),
     created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);