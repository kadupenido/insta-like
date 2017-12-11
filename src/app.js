const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
var bodyParser = require('body-parser');
//const mongoose = require('mongoose');
//const config = require('./config/config');
//const debug = require('debug')('');

const app = express();
const router = express.Router();

//Carrega o banco
//mongoose.connect(config.connStr, { useMongoClient: true });

//Carrega as models
//const VideoUploadModel = require('./upload-video/video-upload-model');

//Habilita cors
app.use(cors());
// app.use(function (req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Methods", "GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });

//log requests
app.use(morgan('dev'));

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//Carrega as rotas
const mainRoute = require('./app-router');
const authRoute = require('./auth/auth-router');

//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', mainRoute);
app.use('/auth', authRoute);

module.exports = app;