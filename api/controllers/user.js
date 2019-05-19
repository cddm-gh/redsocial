const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const _ = require('underscore');
//Importar modelo
const User = require('../models/user');
const Follow = require('../models/follow');
const Publication = require('../models/publication');


function home(req, res) {
    res.json({ ok: true, msg: "home de usuarios" });
}

//Devolver todos los usuarios paginados
function getAllUsers(req, res) {

    let user_id = req.user._id;
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

                followUsersIds(user_id)
                    .then((value) => {
                        return res.status(200).json({
                            ok: true,
                            usuarios,
                            users_i_follow: value.following,
                            users_following_me: value.followed,
                            total: conteo,
                            pages: Math.ceil(conteo / limite)
                        });
                    })
            });

        });
}

async function followUsersIds(user_id) {

    //Obtener los usuarios a los que estoy siguiendo
    const following = await Follow.find({ user: user_id }, (err, follows) => {

        if (err) return res.json({ ok: false, msg: err })

        return follows;
    }).select({ '_id': 0, '__v': 0, 'user': 0 });

    //Obtener los usuarios que me siguen
    const followed = await Follow.find({ user_followed: user_id }, (err, follows) => {
        if (err) return res.json({ ok: false, msg: err })

        return follows;
    }).select({ '_id': 0, '__v': 0, 'user_followed': 0 });

    return {
        following,
        followed
    }

}

function getUsuario(req, res) {
    //El id del user llega por la url
    let user_id = req.params.id;

    User.findById(user_id, (err, usuarioDB) => {
        if (err) { return res.status(500).json({ ok: false, msg: `Error ${err}` }); }

        if (!usuarioDB) { return res.status(401).json({ ok: false, msg: 'No existe un user con ese id' }); }

        //Comprobar si ya sigo a ese usuario
        followThisUser(req.user._id, user_id).then((value) => {

            return res.json({
                usuarioDB,
                following: value.following,
                followed: value.followed
            });
        });

        // return res.json({ user: usuarioDB });
    });
}

async function followThisUser(identity_user_id, user_id) {

    let following = await Follow.findOne({ "user": identity_user_id, "user_followed": user_id }, (err, follow) => {
        if (err) return res.status(500).json({ ok: false, msg: `Error ${err}` })

        return follow;
    });

    let followed = await Follow.findOne({ "user": user_id, "user_followed": identity_user_id }, (err, follow) => {
        if (err) return res.status(500).json({ ok: false, msg: `Error ${err}` })

        return follow;
    });

    return {
        following,
        followed
    }
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

    let userId = req.params.id;
    //Evitar que el campo password pueda ser actualizado desde lugar diferente a la aplicación
    let body = _.pick(req.body, ['name', 'surname', 'nick', 'email', 'image', 'role', 'status']);

    //Verificar si el usuario logueado tiene el mismo ID que el del que se va a actualizar a menos que sea ADMIN
    if (req.user.role !== 'ADMIN') {

        if (userId !== req.user._id) {
            return res.status(500).json({
                ok: false,
                msg: "No tiene permisos para actualizar los campos de este usuario"
            });
        }
    }

    User.findByIdAndUpdate(userId, body, { new: true }, (err, usuarioDB) => {

        if (err) { return res.status(500).json({ ok: false, msg: `Error ${err}` }); }

        if (!usuarioDB) { return res.status(404).send({ ok: false, msg: "No se actualizó el user" }); }

        return res.send({ ok: true, msg: "Usuario actualizado.", user: usuarioDB });
    });
}

function borrarUsuario(req, res) {

    let id = req.params.id;
    let cambiaStatus = {
        status: false
    }

    User.findOneAndUpdate({ _id: id }, cambiaStatus, { new: true }, (err, usuarioActualizado) => {
        if (err) {
            return res.status(400).json({ ok: false, msg: "No se pudo cambiar status del usuario" });
        }
        //Si no consigue ningún usuario con ese id
        if (!usuarioActualizado) {
            return res.status(400).json({ ok: false, msg: "Usuario no encontrado en la Base de Datos." });
        }

        return res.status(200).json({
            ok: true,
            msg: `Usuario ha sido eliminado`,
            user: usuarioActualizado
        });
    });
}

function eliminarCompletoUsuario(req, res) {

    let id = req.params.id;

    User.findOneAndDelete({ _id: id }, (err, usuarioEliminado) => {

        if (err) {
            return res.status(400).json({ ok: false, msg: "No se pudo eliminar el usuario" });
        }
        //Si no consigue ningún usuario con ese id
        if (!usuarioEliminado) {
            return res.status(400).json({ ok: false, msg: "Usuario no encontrado en la Base de Datos." });
        }

        return res.status(200).json({
            ok: true,
            msg: `Usuario ha sido eliminado por completo`,
            user: usuarioEliminado
        });
    });
}

//Actualizar avatar del usuario
function uploadImage(req, res) {

    let userId = req.params.id;

    //Verificar si el usuario logueado tiene el mismo ID que el del que se va a actualizar a menos que sea ADMIN
    if (req.user.role !== 'ADMIN') {

        if (userId !== req.user._id) {
            return res.status(500).json({ ok: false, msg: "No tiene permisos para actualizar los campos de este usuario" });
        }
    }

    if (req.files) {
        let file_path = req.files.imagen.path;
        console.log(file_path);
        let file_split = file_path.split('\\');
    }
}

function getCounters(req, res) {

    if (req.params.id) {
        getCountersFollow(req.params.id).then((value) => {
            return res.json({
                following: value.following,
                followed: value.followed,
                cant_publications: value.cant_publications
            })
        }).catch((err) => { return res.json({ ok: false, msg: err }) });
    } else {
        getCountersFollow(req.user._id).then((value) => {
            return res.json({
                following: value.following,
                followed: value.followed,
                cant_publications: value.cant_publications
            })
        }).catch((err) => { return res.json({ ok: false, msg: err }) });
    }

}

async function getCountersFollow(user_id) {

    const following = await Follow.countDocuments({ "user": user_id });

    const followed = await Follow.countDocuments({ "user_followed": user_id });
    let cant_publications = await Publication.countDocuments({ user: user_id });

    return {
        following,
        followed,
        cant_publications
    }
}

module.exports = {
    home,
    saveUser,
    loginUser,
    getUsuario,
    getAllUsers,
    actualizarUsuario,
    borrarUsuario,
    eliminarCompletoUsuario,
    uploadImage,
    getCounters
}