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
    if (req.session.userId) {
        res.redirect("/login");
    } else if (req.session.loggedId) {
        res.redirect("/petition");
    } else {
        res.redirect("/register");
    }
});

app.get("/register", (req, res) => {
    res.render("register");
});

let userNum;

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
            // console.log("/register: ", req.body);
            db.addUsers(first_name, last_name, email, newPass)
                .then((resultObj) => {
                    // console.log("RESULTOBJ", resultObj.rows[0].id);
                    userNum = resultObj.rows[0].id;
                    req.session.userId = userNum;
                    req.session.registeredId = userNum;
                    req.session.loggedId = userNum;
                    res.redirect("/profile");
                    return console.log("usersWorked");
                })
                .catch((err) => {
                    console.log(err, "error in add user");
                    res.render("register", {
                        error: "email in use, please use a different email",
                        red: "red",
                    });
                });
        }
    });
});

app.get("/login", (req, res) => {
    if (req.session.loggedId) {
        res.redirect("/petition");
    } else if (req.session.userId) {
        res.render("login");
    } else {
        res.redirect("/register");
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
                    bc.compare(passwordLogin, valid.rows[0].password).then(
                        (result) => {
                            let userId = valid.rows[0].id;
                            // console.log(result);
                            if (result) {
                                console.log("WORKED");
                                req.session.loggedId = userId;
                                res.redirect("/petition");
                            } else {
                                console.log("DENIED");
                                res.render("login", {
                                    error:
                                        "email and password not a match, try again!",
                                    red: "red",
                                });
                            }
                        }
                    );
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

app.get("/profile", (req, res) => {
    res.render("profile");
});

app.post("/profile", (req, res) => {
    let { age, city, url } = req.body;
    // if (!url.startsWith("http://") || !url.startsWith("https://")) {
    //     res.render("profile", {
    //         error: "email not valid",
    //         red: "red",
    //     });
    // console.log(req.body);
    //}
    db.addProfile(age, city, url, userNum)
        .then(() => {
            console.log("add profile WORKED");
        })
        .catch((err) => console.log("error in add profile", err));
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    if (req.session.signed) {
        res.redirect("thank-you");
    } else {
        res.render("petition", {});
    }
});

let signature;
let signIdNo;

app.post("/petition", (req, res) => {
    signature = req.body.signature;
    // console.log("line 58: ", req.body);
    if (signature === "") {
        res.render("petition", {
            error: "something went wrong, try again!",
            red: "red",
        });

        console.log("line 44", "redirect back");
    } else {
        db.addMusician(userNum, signature)
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
    db.showSignature(req.session.signId)
        .then((signedData) => {
            db.getUsersProfile().then((data) => {
                let numOfSigners = data.rows.length;
                // console.log("num of signers: ", numOfSigners);
                // let first = data.rows[0].first_name;
                // console.log("first NAME: ", first);
                let pic = signedData.rows[0].signature;
                // console.log("SIGNATURE PIC: ", pic);
                // console.log("num of signers: ", numOfSigners);
                res.render("thank-you", {
                    num: numOfSigners,
                    pic,
                    // first,
                });
            });
            // console.log("SIGNED DATA: ", signedData);
            // console.log("SIGNATURE URL: ", signedData.rows[0].signature);
        })
        .catch((err) => console.log("error in get musicians thankyou", err));
});

app.get("/our-signers", (req, res) => {
    db.getUsersProfile()
        .then((data) => {
            let ourSigners = data.rows;
            console.log("OUR SIGNERS", ourSigners);
            res.render("our-signers", {
                ourSigners,
            });
        })
        .catch((err) => console.log("error in get users profile", err));
});
app.get("/our-signers/:city", (req, res) => {
    const city = req.params.city;
    db.getCity(city)
        .then((result) => {
            let cityMatch = result.rows;
            console.log("CITY MATCH: ", cityMatch);
            res.render("our-signers", {
                cityMatch,
            });
        })
        .catch((err) => console.log("error in signers :city: ", err));
});

app.listen(8080, () => {
    console.log("petition server is listening...");
});

// SET RIGHT COOKIES TO RIGHT FORMS
