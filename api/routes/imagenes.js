const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const { verificaTokenUrl } = require('../middlewares/autenticacion');

//Devolver imágen del usuario
app.get('/user-img/:img', verificaTokenUrl, (req, res) => {

    let img = req.params.img;

    let pathImagen = path.resolve(__dirname, `../uploads/users/${img}`);


    //Si tiene una imágen, mostrarla
    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else { //Si no tiene, mostrar la default
        let noImgPath = path.resolve(__dirname, '../assets/no-image-found.png');
        res.sendFile(noImgPath);
    }

});

//Devolver imágen de la publicación
app.get('/pub-img/:img', verificaTokenUrl, (req, res) => {

    let img = req.params.img;

    let pathImagen = path.resolve(__dirname, `../uploads/publications/${img}`);


    //Si tiene una imágen, mostrarla
    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else { //Si no tiene, mostrar la default
        let noImgPath = path.resolve(__dirname, '../assets/no-image-found.png');
        res.sendFile(noImgPath);
    }

});

module.exports = app;