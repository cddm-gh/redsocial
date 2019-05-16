const express = require('express');
const FollowController = require('../controllers/follow');
const { verificaToken, verificaAdminRol } = require('../middlewares/autenticacion');

const api = express.Router();

api.post('/follow', verificaToken, FollowController.saveFollow);
api.delete('/unfollow/:id', verificaToken, FollowController.unfollow);
api.get('/following/:id?/:page?', verificaToken, FollowController.getFollowingUsers);
api.get('/followers', verificaToken, FollowController.getFollowers);


module.exports = api;