const express = require("express");
const app = express();
const db = require("./db");

const handlebars = require("express-handlebars");
// const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");

app.engine("handlebars", handlebars());
app.set("view engine", "handlebars");

app.use(
    express.urlencoded({
        extended: false,
    })
);

// app.use(cookieParser());
app.use(
    cookieSession({
        secret: "Hello There, General Kenobi",
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

app.use(express.static("./public"));

app.get("/", (req, res) => {
    res.redirect("/petition");
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
    // console.log("line 32: ", req.body);
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
        // console.log("linte 45: ", firstName, lastName, signature);
    }
});

app.get("/thank-you", (req, res) => {
    let numOfSigners;
    db.getMusicians().then((data) => {
        numOfSigners = data.rows.length;
        console.log("num of signers: ", numOfSigners);
        res.render("thank-you", {
            num: numOfSigners,
        });
    });
});

app.get("/our-signers", (req, res) => {
    let ourSigners;
    db.getMusicians().then((data) => {
        ourSigners = data.rows;
        console.log("OUR SIGNERS", ourSigners);
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
