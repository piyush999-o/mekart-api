const express = require("express");
const ConnectToMongo = require("../db/db.js");
const Product = require("../models/product.js");
const multer = require("multer");

const { google } = require("googleapis");
const OAuth2Data = require("../credentials.json");

const router = express.Router();

// Connecting to MongoDB
ConnectToMongo();

// Google API Connection
const CLIENT_ID = OAuth2Data.web.client_id;
const CLIENT_SECRET = OAuth2Data.web.client_secret;
const REDIRECT_URI = OAuth2Data.web.redirect_uris[0];

const OAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

let authed = false;

const SCOPES =
    "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile";

// multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/uploads");
    },
    filename: (req, file, cb) => {
        const date = Date.now().toString();
        let filename = date.replace(" ", "-");
        cb(null, filename + file.originalname);
    },
});

let upload = multer({ storage: storage });

router.get("/", async (req, res, next) => {
    const products = await Product.find();
    res.json(products);
});

router.post("/new", upload.single("productImage"), async (req, res) => {
    try {
        const { title, description, category, price } = req.body;
        let { path } = req.file;
        path = path.replace('uploads\\/public\\/', '/')
        path = path.replace("public\\", "/")

        const product = new Product({
            title,
            description,
            category,
            price,
            productImage: path,
        });
        const savedProduct = await product.save();
        res.json(savedProduct);
    } catch (error) {
        console.log(error);
    }
});

// ROUTE:3 for Deleting product using DELETE - /product/delete/:id
router.delete("/:_id", async (req, res, next) => {
    const productId = req.params._id;
    const product = await Product.findByIdAndDelete(productId);
    res.json(`(${product}) deleted Successfully`);
  });
  
  // ROUTE:4 for Getting Particular Product information using GET - /product/:id
  router.get("/:_id", async (req, res, next) => {
    const productId = req.params._id;
    const product = await Product.findById(productId);
    res.json(product);
  });
  

// google APIs
router.get("/google/api", (req, res) => {
    if (!authed) {
        let url = OAuth2Client.generateAuthUrl({
            access_type: "offline",
            scope: SCOPES,
        });
        // res.redirect(url)
        console.log(url);
        res.redirect(url);
    } else {
        let OAuth2 = google.oauth2({
            auth: OAuth2Client,
            version: "v2",
        });
        // User Info
        OAuth2.userinfo.get((err, response) => {
            if (err) throw err;
            console.log(response.data);
            res.send(response.data);
        });
    }
});

router.get("/google/callback", (req, res) => {
    const code = req.query.code;

    if (code) {
        OAuth2Client.getToken(code, (err, tokens) => {
            if (err) {
                console.log(err);
            } else {
                console.log("Succesfully Log in");
                console.log(tokens);

                OAuth2Client.setCredentials(tokens);
                authed = true;
            }
        });
    }

    res.send(`<h1>Succesfully Log in with G-mail</h1>`);
});

module.exports = router;
