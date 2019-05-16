const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const app = express();

const { verificaToken } = require('../middlewares/autenticacion');

const Usuario = require('../models/user');

app.use(fileUpload());

app.post('/user-img/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    if (Object.keys(req.files).length == 0) {
        return res.status(400).json({
            ok: false,
            msg: 'No files were uploaded.'
        });
    }


    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let archivo = req.files.archivo; //archivo es el nombre del input en el html
    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[1];
    //extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            msg: "Extensión del archivo no válida"
        })
    }


    //Cambiar nombre del archivo para hacerlo único
    // let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;
    let nombreArchivo = `${id}.${extension}`;

    // Use the mv() method to place the file somewhere on your server
    archivo.mv(`uploads/${nombreArchivo}`, function(err) {
        if (err)
            return res.status(500).json({
                ok: false,
                msg: `${err}`
            });

        imagenUsuario(id, res, nombreArchivo);
    });

});


function imagenUsuario(id, res, nombreArchivo) {

    Usuario.findById(id, (err, usuarioDB) => {

        if (err) {
            borraArchivo(nombreArchivo);

            return res.status(500).json({
                ok: false,
                msg: `Error ${err}`
            });
        }
        if (!usuarioDB) {
            borraArchivo(nombreArchivo);

            return res.status(400).json({
                ok: true,
                msg: "Usuario no existe"
            });
        }

        //borraArchivo(usuarioDB.image);

        usuarioDB.image = nombreArchivo;

        usuarioDB.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    msg: `Error ${err}`
                });
            }

            return res.json({
                ok: true,
                usuario: usuarioGuardado
            });

        });

    });
}


function borraArchivo(nombreArchivo) {

    //Para eliminar archivos anteriores
    let pathImagen = path.resolve(__dirname, `../uploads/${nombreArchivo}`);

    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;