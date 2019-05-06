const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const _ = require('underscore');
//Importar modelo
const User = require('../models/user');


function home(req, res) {
    res.json({ ok: true, msg: "home de usuarios" });
}

//Devolver todos los usuarios paginados
function getAllUsers(req, res) {

    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 10;
    limite = Number(limite);

    User.find({ status: true })
        .skip(desde)
        .limit(limite)
        .sort('_id')
        .exec((err, usuarios) => {

            if (err) { return res.status(500).json({ ok: false, msg: `Error ${err}` }); }

            //Debe tener el mismo parámetro de Usuario.find para que los cuente de la misma manera
            User.countDocuments({ status: true }, (err, conteo) => {

                if (err) { return res.status(500).json({ msg: `${err}` }); }

                return res.status(200).json({ ok: true, total: conteo, pages: Math.ceil(conteo / limite), usuarios });

            });

        });
}

function getUsuario(req, res) {
    //El id del user llega por la url
    let id = req.params.id;

    User.findById(id, (err, usuarioDB) => {
        if (err) { return res.status(500).send({ ok: false, msg: `Error ${err}` }); }

        if (!usuarioDB) { res.status(401).send({ ok: false, msg: 'No existe un user con ese id' }); }

        return res.send({ usuarioDB });
    });
}

function saveUser(req, res) {

    //Recibimos los datos enviados
    let body = req.body;
    //Se crea un nuevo Objeto Usuario con los datos recibidos

    let user = new User({
        name: body.name,
        surname: body.surname,
        nick: body.nick,
        email: body.email,
        //Encriptación del password
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });
    //Se guarda el user en la BD
    user.save((err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                msg: `Error ${err}`
            })
        }

        return res.send({
            ok: true,
            user: usuarioDB,
            msg: "Usuario creado exitosamente."
        })
    });

}

function loginUser(req, res) {

    let body = req.body;

    User.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({ ok: false, msg: `Error ${err}` });
        }

        if (!usuarioDB) {
            return res.status(400).json({ ok: false, msg: "Email incorrecto" });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({ ok: false, msg: "Password incorrecto" });
        }
        //creando el token
        let token = jwt.sign({
            user: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });


        if (usuarioDB) {
            return res.send({
                ok: true,
                user: usuarioDB,
                token
            })
        }
    });

}

function actualizarUsuario(req, res) {

    let id = req.params.id;
    //Evitar que el campo password y google puedan ser actualizados desde lugar diferente a la aplicación
    let body = _.pick(req.body, ['name', 'surname', 'nick', 'email', 'image', 'role', 'status']);

    User.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {

        if (err) { return res.status(500).json({ ok: false, msg: `Error ${err}` }); }

        if (!usuarioDB) { return res.status(404).send({ ok: false, msg: "No se actualizó el user" }); }

        return res.send({ ok: true, msg: "Usuario actualizado.", user: usuarioDB });
    });
}

module.exports = {
    home,
    saveUser,
    loginUser,
    getUsuario,
    getAllUsers,
    actualizarUsuario
}