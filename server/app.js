const express = require('express');
const bodyParser = require('body-parser');

const app = express();

//Cargar rutas
const user_routes = require('../routes/user');
const upload_routes = require('../routes/upload');
const imagenes_routes = require('../routes/imagenes');

const follow_routes = require('../routes/follow');
const publication_routes = require('../routes/publication');
//Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Cors


//Rutas
app.use('/api', user_routes);
app.use('/api', upload_routes);
app.use('/api', imagenes_routes);
app.use('/api', follow_routes);
app.use('/api', publication_routes);

//Exportar
module.exports = app;