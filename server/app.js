const express = require('express');
const bodyParser = require('body-parser');

const app = express();

//Cargar rutas
const user_routes = require('../routes/user');

//Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Cors


//Rutas
app.use('/user', user_routes);

//Exportar
module.exports = app;