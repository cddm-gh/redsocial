const path = require('path');
const fs = require('fs');
const moment = require('moment');
const mongoosePaginate = require('mongoose-pagination');

const Publication = require('../models/publication');
const User = require('../models/user');
const Follow = require('../models/follow');

function probando(req, res) {
    res.json({
        ok: true,
        msg: "Saludo desde publications"
    })
}

function savePublication(req, res) {

    let params = req.body;
    let publication = new Publication();

    if (!params.text) {
        return res.status(200).json({ ok: false, msg: "Debe enviar un texto" })
    }
    publication.text = params.text;
    publication.file = 'null';
    publication.user = req.user._id;
    publication.created_at = moment().unix();

    publication.save((err, publication_saved) => {
        if (err) return res.status(500).json({ ok: false, msg: `Error ${err}` })

        if (!publication_saved) return res.status(404).json({ msg: "La publicación no ha sido guardada" })

        return res.json({ publication: publication_saved })
    })
}

function getPublications(req, res) {
    let page = 1;
    if (req.params.page) page = req.params.page;

    let items_per_page = 4;
    Follow.find({ user: req.user._id })
        .populate('user_followed')
        .exec((err, follows) => {
            if (err) return res.status(500).json({ msg: `Error al buscar seguidores ${err}` })

            if (!follows) return res.status(404).json({ msg: `Timeline vácio` })

            //Buscar los usuarios que estoy siguiendo y agregarlos al arreglo
            let follows_clean = [];
            follows.forEach((follow) => {
                follows_clean.push(follow.user_followed);
            })

            //Buscar en publicaciones todas las que sean de los usuarios que están en el arreglo (los que sigo)
            Publication.find({ user: { "$in": follows_clean } })
                .sort('-created_at')
                .populate('user')
                .paginate(page, items_per_page, (err, publications, total) => {
                    if (err) return res.status(500).json({ msg: `Error al devolver publicaciones ${err}` })

                    if (!publications) return res.status(404).json({ msg: `No hay publicaciones` })

                    return res.json({
                        total_items: total,
                        pages: Math.ceil(total / items_per_page),
                        page,
                        publications
                    })
                });
        });
}

function getPublication(req, res) {
    let publication_id = req.params.id;

    Publication.findById(publication_id, (err, publication) => {
        if (err) return res.status(500).json({ msg: `Error al devolver la publicacion ${err}` })

        if (!publication) return res.status(404).json({ msg: `No existe esa publicación` })

        return res.json({
            publication
        })
    })
}

function eliminarPublication(req, res) {
    let publication_id = req.params.id;
    let user_id = req.user._id;

    //Buscar solo mis publicaciones
    Publication.findOneAndDelete({ _id: publication_id, user: user_id }, (err, publication_removed) => {
        if (err) return res.status(500).json({ msg: `Error al eliminar la publicacion ${err}` })

        if (!publication_removed) return res.status(404).json({ msg: `No existe esa publicación` })

        return res.json({
            msg: "Publicación eliminada.",
            publication_removed
        })
    })
}

module.exports = {
    probando,
    savePublication,
    getPublication,
    getPublications,
    eliminarPublication
}