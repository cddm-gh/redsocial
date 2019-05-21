const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const app = express();

const { verificaToken } = require('../middlewares/autenticacion');

const Usuario = require('../models/user');
const Publication = require('../models/publication');

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
    archivo.mv(`uploads/users/${nombreArchivo}`, function(err) {
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
            borraArchivo(nombreArchivo, 'users');

            return res.status(500).json({
                ok: false,
                msg: `Error ${err}`
            });
        }
        if (!usuarioDB) {
            borraArchivo(nombreArchivo, 'users');

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
                user: usuarioGuardado
            });

        });

    });
}


function borraArchivo(nombreArchivo, tipo) {

    //Para eliminar archivos anteriores
    let pathImagen = path.resolve(__dirname, `../uploads/${tipo}/${nombreArchivo}`);

    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
}

//=================================================================
//=================Imágenes de publicaciones=======================
//=================================================================
app.post('/pub-img/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    let user_id = req.user._id;

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
    archivo.mv(`uploads/publications/${nombreArchivo}`, function(err) {
        if (err)
            return res.status(500).json({
                ok: false,
                msg: `${err}`
            });

        imagenPublicacion(id, user_id, res, nombreArchivo);
    });

});


function imagenPublicacion(id, user_id, res, nombreArchivo) {
    //Solo puede actualizar la imágen el mismo usuario que creó la publicación
    Publication.findOneAndUpdate({ _id: id, user: user_id }, { $set: { file: nombreArchivo } }, { new: true }, (err, publicationUpdated) => {
        if (err) {
            borraArchivo(nombreArchivo, 'publications');

            return res.status(500).json({
                ok: false,
                msg: `Error ${err}`
            });
        }

        if (!publicationUpdated) {
            borraArchivo(nombreArchivo, 'publications');

            return res.status(400).json({
                ok: true,
                msg: "Publicación no existe"
            });
        }

        return res.json({
            ok: true,
            publication: publicationUpdated
        });
    });

}




module.exports = app;