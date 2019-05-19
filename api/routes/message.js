const express = require('express');
const MessageController = require('../controllers/message');
const { verificaToken } = require('../middlewares/autenticacion');
const api = express.Router();

api.post('/send_msg', verificaToken, MessageController.saveMessage);
api.get('/get_msgs', verificaToken, MessageController.getReceivedMessages);
api.get('/get_sended_msgs', verificaToken, MessageController.getEmittedMessages);
api.get('/get_umsgs', verificaToken, MessageController.getUnreadedMessages);
api.get('/set_viewed_msgs', verificaToken, MessageController.markMessageAsReaded);

module.exports = api;