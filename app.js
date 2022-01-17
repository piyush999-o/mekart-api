const express = require('express');
const cors = require('cors');
const productRouter = require('./routes/product');

const app = express();

app.use(cors());
app.use(express.static('uploads'))
app.use('/api/product', productRouter)

app.get('/', (req, res, next) => {
    res.send("App is Running");
});

module.exports = app;
