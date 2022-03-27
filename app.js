const express = require('express');
const cors = require('cors');
const productRouter = require('./routes/product');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('uploads'))

app.use('/api/product', productRouter)

app.use((req, res, next) => {
    res.header({ "Access-Control-Allow-Origin": "*" });
    next();
});

app.get("/", (req, res) => {
    res.json({ Message: "Server is Running" });
});

module.exports = app;
