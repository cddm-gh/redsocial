const express = require('express');
const PublicationController = require('../controllers/publication');
const api = express.Router();
const { verificaToken } = require('../middlewares/autenticacion');

api.get('/publications_prueba', verificaToken, PublicationController.probando);
api.post('/new_publication', verificaToken, PublicationController.savePublication);
api.get('/publications/:page?', verificaToken, PublicationController.getPublications);
api.get('/publication/:id', verificaToken, PublicationController.getPublication);
api.delete('/publication/:id', verificaToken, PublicationController.eliminarPublication);

module.exports = api;