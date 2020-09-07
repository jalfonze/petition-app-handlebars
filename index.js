const express = require("express");
const app = express();
const db = require("./db");
const bc = require("./bc");

const handlebars = require("express-handlebars");
const cookieSession = require("cookie-session");
// const csurf = require("csurf");

app.engine("handlebars", handlebars());
app.set("view engine", "handlebars");

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(
    cookieSession({
        secret: "Hello There, General Kenobi",
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);
// app.use(csurf);

// app.use(function (req, res, next) {
//     //csrfToken for templates
//     res.locals.csrfToken = req.csrfToken();
//     //prevents click jacking
//     res.setHeader("x-frame-options", "deny");
//     next();
// });

app.use(express.static("./public"));

app.get("/", (req, res) => {
    res.redirect("/login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    let { first_name, last_name, email, password } = req.body;
    bc.hash(password).then((hashedPW) => {
        // console.log("HashedPW: ", hashedPW);
        req.body.password = hashedPW;
        let newPass = req.body.password;
        // console.log("password: ", password);
        if (
            first_name === "" ||
            last_name === "" ||
            email === "" ||
            password === ""
        ) {
            res.render("register", {
                error: "Something went wrong, try again!",
                red: "red",
            });
        } else {
            console.log("line 63: ", req.body);
            db.addUsers(first_name, last_name, email, newPass)
                .then((userId) => {
                    // console.log("user: ", userId.rows[0].id);
                    let userNum = userId.rows[0].id;
                    req.session.registered = true;
                    req.session.signedIn = true;
                    req.session.userId = userNum;
                    res.redirect("/petition");
                    return console.log("usersWorked");
                })
                .catch((err) => {
                    console.log(err, "error in ad user");
                    res.render("register", {
                        error: "email in use, please use a different email",
                        red: "red",
                    });
                });
        }
    });
});

app.get("/login", (req, res) => {
    if (req.session.registered) {
        res.redirect("/petition");
    } else if (!req.session.registered) {
        res.render("login");
    } else {
        res.redirect("/petition");
    }
});

app.post("/login", (req, res) => {
    let { emailLogin, passwordLogin } = req.body;
    console.log("LOG IN req.body: ", req.body);
    if (emailLogin === "" || passwordLogin === "") {
        res.render("login", {
            error: "boxes cannot be empty",
            red: "red",
        });
    } else {
        db.getUsers(emailLogin)
            .then((valid) => {
                if (valid) {
                    console.log(valid.rows[0].password);
                }
            })
            .catch((err) => {
                console.log("error in get users: ", err);
                res.render("login", {
                    error: "email not valid",
                    red: "red",
                });
            });
    }
});

app.get("/petition", (req, res) => {
    if (req.session.signed) {
        res.redirect("thank-you");
    } else {
        res.render("petition", {});
    }
});

let firstName;
let lastName;
let signature;
let signIdNo;

app.post("/petition", (req, res) => {
    firstName = req.body["first-name"];
    lastName = req.body["last-name"];
    signature = req.body.signature;
    // console.log("line 58: ", req.body);
    if (firstName === "" || lastName === "" || signature === "") {
        res.render("petition", {
            error: "something went wrong, try again!",
            red: "red",
        });

        console.log("line 44", "redirect back");
    } else {
        db.addMusician(firstName, lastName, signature)
            .then((id) => {
                signIdNo = id.rows[0].id;
                console.log("signature ID number", signIdNo);
                req.session.signed = true;
                req.session.signId = signIdNo;
                res.redirect("/thank-you");
                return console.log("worked");
            })
            .catch((err) => {
                console.log("error in add musician: ", err);
            });
        // console.log("line 79: ", firstName, lastName, signature);
    }
});

app.get("/thank-you", (req, res) => {
    db.showSignature(req.session.signId).then((signedData) => {
        db.getMusicians().then((data) => {
            let numOfSigners = data.rows.length;
            // console.log("num of signers: ", numOfSigners);
            let first = signedData.rows[0].first;
            // console.log("first NAME: ", first);
            let pic = signedData.rows[0].signature;
            // console.log("SIGNATURE PIC: ", pic);
            // console.log("num of signers: ", numOfSigners);
            res.render("thank-you", {
                num: numOfSigners,
                pic,
                first,
            });
        });
        // console.log("SIGNED DATA: ", signedData);
        // console.log("SIGNATURE URL: ", signedData.rows[0].signature);
    });
});

app.get("/our-signers", (req, res) => {
    db.getMusicians().then((data) => {
        let ourSigners = data.rows;
        // console.log("OUR SIGNERS", ourSigners);
        res.render("our-signers", {
            ourSigners,
        });
    });
});

app.listen(8080, () => {
    console.log("petition server is listening...");
});

// need to get thank you page and input number of signers via getMusicians()
//need to loop through the data form getMusicians() push them into an array, get the amount via liength
//use handlebars to put this info in the thank-you page with render??
//need to get our signers and input the list of signers on to that page
