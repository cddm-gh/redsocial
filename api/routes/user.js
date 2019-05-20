const express = require('express');
const UserController = require('../controllers/user');
const { verificaToken, verificaAdminRol } = require('../middlewares/autenticacion');

const api = express.Router();

api.get('/home', UserController.home);
api.post('/login', UserController.loginUser);
api.post('/registro', UserController.saveUser);
api.get('/listar/:id', verificaToken, UserController.getUsuario);
api.get('/listar', verificaToken, UserController.getAllUsers);
api.put('/actualizar/:id', verificaToken, UserController.actualizarUsuario);
api.put('/borrar/:id', [verificaToken, verificaAdminRol], UserController.borrarUsuario);
api.delete('/eliminar/:id', [verificaToken, verificaAdminRol], UserController.eliminarCompletoUsuario);
api.get('/stats/:id?', verificaToken, UserController.getCounters);

module.exports = api;