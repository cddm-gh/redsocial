//Validador para evitar que se inserten objetos con una misma propiedad
const uniqueValidator = require('mongoose-unique-validator');
const mongoose = require('mongoose');
let Schema = mongoose.Schema;

//Roles válidos
let rolesValidos = {
    values: ['ADMIN', 'USER'],
    message: '{VALUE} no es un rol válido'
};

let UserSchema = new Schema({

    name: {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    surname: {
        type: String,
        required: [true, 'El apellido es necesario']
    },
    nick: {
        type: String,
        unique: true,
        required: [true, 'El nick es necesario']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'El email es necesario']
    },
    password: {
        type: String,
        required: [true, 'El password es necesario']
    },
    role: {
        type: String,
        default: "USER",
        required: true,
        enum: rolesValidos
    },
    image: {
        type: String
    },
    status: {
        type: Boolean,
        default: true
    }
});

//Método para eliminar el campo password en la respuesta de la petición.
UserSchema.methods.toJSON = function() {
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;

    return userObject;
}

//Plugin para evitar que se puedan crear Objetos con un mismo campo (email)
UserSchema.plugin(uniqueValidator, {
    message: '{PATH} ya se encuentra registrado en la Base de Datos.'
})


module.exports = mongoose.model('User', UserSchema);