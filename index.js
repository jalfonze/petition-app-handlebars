const express = require("express");
const app = express();
const db = require("./db");
const bc = require("./bc");

const handlebars = require("express-handlebars");
const cookieSession = require("cookie-session");
const csurf = require("csurf");

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

app.use((req, res, next) => {
    next();
});
app.use(csurf());

app.use(function (req, res, next) {
    //csrfToken for templates
    res.locals.csrfToken = req.csrfToken();
    //prevents click jacking
    res.setHeader("x-frame-options", "deny");
    next();
});

app.use(express.static("./public"));

const loggedInUser = (req, res, next) => {
    if (req.session.userId) {
        res.redirect("/petition");
    } else {
        next();
    }
};

const loggedOutUser = (req, res, next) => {
    if (
        !req.session.userId &&
        req.url !== "/register" &&
        req.url !== "/login"
    ) {
        res.redirect("/register");
    } else {
        next();
    }
};

const signedUser = (req, res, next) => {
    if (!req.session.signed) {
        res.redirect("/petition");
    } else {
        next();
    }
};

app.get("/", (req, res) => {
    res.redirect("/register");
});

app.get("/register", loggedInUser, (req, res) => {
    res.render("register");
});

app.post("/register", loggedInUser, (req, res) => {
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
                    req.session.userId = resultObj.rows[0].id;

                    console.log("REQ USER ID: ", req.session.userId);

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

app.get("/login", loggedInUser, (req, res) => {
    res.render("login");
});

app.post("/login", loggedInUser, (req, res) => {
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
                            let userId = valid.rows[0].user_id;
                            req.session.userId = userId;
                            console.log("VALID: ", valid);
                            if (result) {
                                console.log("LOG IN WORKED");
                                db.getUsers(emailLogin)
                                    .then((signatures) => {
                                        console.log(signatures.rows[0]);
                                        if (signatures.rows[0].signature) {
                                            req.session.signed = true;
                                            res.redirect("/petition");
                                        }
                                    })
                                    .catch((err) =>
                                        console.log("ERROR IN if signed: ", err)
                                    );
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

app.get("/profile", loggedOutUser, (req, res) => {
    res.render("profile");
});

app.post("/profile", loggedOutUser, (req, res) => {
    let { age, city, url } = req.body;
    if (url.slice(0, 4) === "www.") {
        url = "https://" + url;
    } else if (
        url.slice(0, 7) === "http://" ||
        url.slice(0, 8) === "https://"
    ) {
        url;
    } else if (
        url.slice(0, 7) !== "http://" ||
        url.slice(0, 8) !== "https://"
    ) {
        url = "";
    }
    console.log(req.body);
    db.addProfile(age, city, url, req.session.userId)
        .then(() => {
            console.log("add profile WORKED");
            console.log("REQSESSION PROFILE: ", req.session);
        })
        .catch((err) => console.log("error in add profile", err));
    res.redirect("/petition");
});

app.get("/petition", loggedOutUser, (req, res) => {
    if (req.session.signed) {
        res.redirect("thank-you");
    } else {
        res.render("petition", {});
    }
});

let signature;
let signIdNo;

app.post("/petition", loggedOutUser, (req, res) => {
    signature = req.body.signature;
    // console.log("line 58: ", req.body);
    if (signature === "") {
        res.render("petition", {
            error: "something went wrong, try again!",
            red: "red",
        });

        console.log("line 44", "redirect back");
    } else {
        console.log("MUSICIANS:", req.session.userId);
        console.log(req.session);
        db.addMusician(req.session.userId, signature)
            .then((id) => {
                console.log("ADD MUSICIAN ID: ", id);
                signIdNo = id.rows[0].id;
                console.log("signature ID number", signIdNo);
                req.session.signed = true;
                req.session.signId = signIdNo;
                console.log("REQ SESH SIGN ID: ", req.session.signId);
                res.redirect("/thank-you");
                return console.log("worked");
            })
            .catch((err) => {
                console.log("error in add musician: ", err);
            });
        // console.log("line 79: ", firstName, lastName, signature);
    }
});

app.get("/thank-you", loggedOutUser, signedUser, (req, res) => {
    console.log(req.session);
    db.showSignature(req.session.userId)

        .then((signedData) => {
            console.log("SIGNED DATA", signedData);
            db.getUsersProfile()
                .then((data) => {
                    let numOfSigners = data.rows.length;
                    // let first = data.rows[0].first_name;
                    let pic = signedData.rows[0].signature;
                    // console.log("SIGNATURE PIC: ", pic);
                    // console.log("num of signers: ", numOfSigners);
                    res.render("thank-you", {
                        num: numOfSigners,
                        pic,
                        // first,
                    });
                })
                .catch((err) =>
                    console.log("ERROR IN get user profile  THANK YOU: ", err)
                );
        })
        .catch((err) => console.log("error in get musicians thankyou", err));
});

app.post("/thank-you", loggedOutUser, signedUser, (req, res) => {
    db.deleteSig(req.session.userId).then((sig) => {
        console.log("SIG ROWS: ", sig.rows);
        console.log("SIG ROWS: ", req.session);
        req.session.signed = false;
        res.redirect("/petition");
    });
});

app.get("/our-signers", loggedOutUser, signedUser, (req, res) => {
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
app.get("/our-signers/:city", loggedOutUser, signedUser, (req, res) => {
    const city = req.params.city;
    console.log(city);
    db.getCity(city)
        .then((result) => {
            let cityMatch = result.rows;
            // console.log("CITY MATCH: ", cityMatch);
            res.render("our-signers", {
                cityMatch,
                cityName: city,
            });
        })
        .catch((err) => console.log("error in signers :city: ", err));
});

app.get("/edit-profile", loggedOutUser, (req, res) => {
    db.getCurrentUser(req.session.userId)
        .then((userData) => {
            let uData = userData.rows;
            console.log("CURRENT USER", uData);
            res.render("edit-profile", {
                uData,
            });
        })
        .catch((err) => console.log("error in get edit-profile", err));
});

app.post("/edit-profile", loggedOutUser, (req, res) => {
    let { fname, lname, emailUpdate, ageU, cityU, urlU, passwordU } = req.body;
    if (!passwordU) {
        db.updateUsers(fname, lname, req.session.userId, emailUpdate, passwordU)
            .then(() => {
                db.updateProfile(ageU, cityU, urlU, req.session.userId)
                    .then(() => {
                        console.log("UPDATE PROFILE NO PASS WORKED");
                    })
                    .catch((err) =>
                        console.log(
                            "ERROR IN update profile NO PASS",
                            err,
                            req.body
                        )
                    );
                console.log("UPDATE WORKED");
                res.redirect("/thank-you");
            })
            .catch((err) =>
                console.log("ERROR IN UPDATE USERS NO PASS: ", err)
            );
    } else {
        bc.hash(passwordU).then((newHashedPw) => {
            console.log("NEW PW WORKED: ", newHashedPw);
            db.updateUsersWPass(
                fname,
                lname,
                req.session.userId,
                emailUpdate,
                newHashedPw
            )
                .then(() => {
                    db.updateProfile(ageU, cityU, urlU, req.session.userId)
                        .then(() => {
                            console.log("UPDATE PROFILE WORKED");
                        })
                        .catch((err) =>
                            console.log(
                                "ERROR IN update profile",
                                err,
                                req.body
                            )
                        );
                    console.log("UPDATE WORKED");
                    res.redirect("/thank-you");
                })
                .catch((err) => console.log("ERROR IN UPDATE USERS: ", err));
        });
    }
});

app.get("/delete", (req, res) => {
    res.render("delete", {});
});

app.post("/delete", (req, res) => {
    db.deleteUser(req.session.userId)
        .then(() => {
            req.session = null;
            res.redirect("/register");
        })
        .catch((err) => console.log("ERROR IN delet user: ", err));
});
app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/register");
});

app.listen(process.env.PORT || 8080, () => {
    console.log("petition server is listening...");
});

// SET RIGHT COOKIES TO RIGHT FORMS
