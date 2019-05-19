require('../config/config');
const mongoose = require('mongoose');
const app = require('./app');

const port = process.env.PORT;

//Conexión DB
mongoose.Promise = global.Promise;
mongoose.connect(process.env.URLDB, { useCreateIndex: true, useNewUrlParser: true })
    .then(() => {
        console.log('Conectado a la BD correctamente.');

        //Crear servidor
        app.listen(port, () => {
            console.log(`Servidor inciado en el puerto ${port}`);
        });
    })
    .catch(err => {
        console.log(`Error BD ${err}`);
    });