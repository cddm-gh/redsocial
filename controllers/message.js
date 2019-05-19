const moment = require('moment');
const mongoose_paginate = require('mongoose-pagination');

const User = require('../models/user');
const Follow = require('../models/follow');
const Message = require('../models/message');

//Crear un mensaje
function saveMessage(req, res) {

    let params = req.body;

    if (!params.text || !params.receiver) return res.status(200).json({ msg: "Envia todos los campos necesarios" });

    let message = new Message();

    message.emitter = req.user._id;
    message.receiver = params.receiver;
    message.text = params.text;
    message.created_at = moment().unix();
    message.viewed = false;

    message.save((err, messageStored) => {
        if (err) return res.status(500).json({ msg: `Error en la petición ${err}` });

        if (!messageStored) return res.status(404).json({ msg: `Error al enviar el mensaje` });

        return res.json({
            messageStored
        })
    })
}

//Ver todos los mensajes recibidos leídos y no leídos
function getReceivedMessages(req, res) {
    let user_id = req.user._id;
    let page = 1;

    if (req.params.page) page = req.params.page;

    let itemsPerPage = 4;

    Message.find({ receiver: user_id })
        .sort('-created_at')
        .populate('emitter', 'nick')
        .paginate(page, itemsPerPage, (err, messages, total) => {
            if (err) return res.status(500).json({ msg: `Error en la petición ${err}` });

            if (!messages) return res.status(404).json({ msg: `No hay mensajes` });

            return res.json({
                total_msgs: total,
                pages: Math.ceil(total / itemsPerPage),
                messages
            })
        })
}

//Ver todos los mensajes que no han sido leídos
function getUnreadedMessages(req, res) {
    let user_id = req.user._id;
    if (req.params.page) page = req.params.page;

    Message.countDocuments({ receiver: user_id, viewed: false }, (err, count) => {
        if (err) return res.status(500).json({ msg: `Error en la petición ${err}` });

        return res.json({
            unviewed: count
        })
    });
}

//Ver mensajes enviados
function getEmittedMessages(req, res) {
    let user_id = req.user._id;
    let page = 1;

    if (req.params.page) page = req.params.page;

    let itemsPerPage = 4;

    Message.find({ emitter: user_id })
        .sort('-created_at')
        .populate('emitter receiver', 'nick')
        .paginate(page, itemsPerPage, (err, messages, total) => {
            if (err) return res.status(500).json({ msg: `Error en la petición ${err}` });

            if (!messages) return res.status(404).json({ msg: `No hay mensajes` });

            return res.json({
                total_msgs: total,
                pages: Math.ceil(total / itemsPerPage),
                messages
            })
        })
}

function markMessageAsReaded(req, res) {
    let user_id = req.user._id;

    Message.updateMany({ receiver: user_id, viewed: false }, { viewed: true }, { new: true, "multi": true }, (err, msgsUpdated) => {
        if (err) return res.status(500).json({ msg: `Error en la petición ${err}` });

        return res.json({
            msgsUpdated
        })
    });
}

module.exports = {
    saveMessage,
    getReceivedMessages,
    getEmittedMessages,
    getUnreadedMessages,
    markMessageAsReaded
}