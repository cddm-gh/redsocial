const jwt = require('jsonwebtoken');

//==============================================
//Verificar que el token sea válido
//==============================================

let verificaToken = (req, res, next) => {

    //1- Leer el token que viene en el header llamado 'token'
    let token = req.get('token');
    //token, semilla, callback(error, objeto desencriptado)
    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: "Token no válido."
                }
            });
        }

        req.user = decoded.user;
        next();
    });

};

//====================================================================
//Verificar que el usuario sea ADMIN para crear, actualizar y eliminar
//====================================================================
let verificaAdminRol = (req, res, next) => {

    let usuario = req.user;

    if (usuario.role === 'ADMIN') {
        next(); //puedo continuar, pasó la verificación
    } else {
        return res.json({
            ok: false,
            message: "Debe tener privilegios de ADMIN para poder realizar esta operación"
        });
    }

};

let verificaTokenUrl = (req, res, next) => {

    let token = req.query.token;

    //token, semilla, callback(error, objeto desencriptado)
    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({ ok: false, message: "Token inválido" });
        }

        req.user = decoded.user;
        next();
    });
}


module.exports = {
    verificaToken,
    verificaTokenUrl,
    verificaAdminRol
}