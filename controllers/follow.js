const path = require('path');
const fs = require('fs');
//Importar modelo
const User = require('../models/user');
const Follow = require('../models/follow');


function home(req, res) {
    res.json({ ok: true, msg: "home de follow" });
}

function saveFollow(req, res) {

    let params = req.body;
    let follow = new Follow();
    follow.user = req.user._id;
    follow.user_followed = params.follow;

    follow.save((err, followStored) => {
        if (err) return res.status(500).json({ ok: false, msg: `Error ${err}` })

        if (!followStored) {
            return res.status(404).json({ ok: false, msg: `El siguimiento no se ha guardado` });
        }

        return res.json({
            ok: true,
            follow: followStored
        })

    });
}

function unfollow(req, res) {

    let userId = req.user._id;
    let followId = req.params.id; //Por la url


    Follow.findOneAndDelete({ 'user': userId, 'user_followed': followId }, (err, response) => {
        if (err) {
            return res.status(500).json({ ok: false, msg: `Error ${err}` })
        }

        if (!response) {
            return res.status(404).json({ ok: false, msg: `No se encuentra siguiendo al usuario` })
        }

        return res.json({ ok: true, msg: `Se ha eliminado el follow.` })
    });
}

function getFollowingUsers(req, res) {

    let userId = req.user._id;

    if (req.params.id) {
        userId = req.params.id;
    }

    let page = 1;
    if (req.params.page) {
        page = req.params.page;
    }

    let itemsPerPage = req.params.limite || 10;
    itemsPerPage = Number(itemsPerPage);

    Follow.find({ user: userId })
        .populate('user_followed', 'nick')
        .exec((err, follows) => {
            if (err) {
                return res.status(500).json({ ok: false, msg: `Error ${err}` })
            }

            if (!follows) {
                return res.status(404).json({ ok: true, msg: `No sigue ningún usuario` })
            }

            Follow.countDocuments({ user: userId }, (err, conteo) => {

                if (err) {
                    return res.status(500).json({ ok: false, msg: `Error en conteo ${err}` })
                }

                return res.json({ ok: true, pages: Math.ceil(conteo / itemsPerPage), follows });

            })
        });

}

function getFollowers(req, res) {

    let userId = req.user._id;
    if (req.params.id) {
        userId = req.params.id;
    }

    let page = 1;
    if (req.params.page) {
        page = req.params.page;
    }

    let itemsPerPage = req.params.limite || 10;
    itemsPerPage = Number(itemsPerPage);

    Follow.find({ user: userId })
        .populate('user', 'nick')
        .exec((err, followers) => {
            if (err) {
                return res.status(500).json({ ok: false, msg: `Error ${err}` })
            }

            if (!followers) {
                return res.status(404).json({ ok: true, msg: `No tiene ningún usuario siguiendolo` })
            }

            Follow.countDocuments({ user: userId }, (err, conteo) => {

                if (err) {
                    return res.status(500).json({ ok: false, msg: `Error en conteo ${err}` })
                }

                return res.json({
                    ok: true,
                    pages: Math.ceil(conteo / itemsPerPage),
                    users_following_you: followers
                });

            })
        });
}

module.exports = {
    saveFollow,
    unfollow,
    getFollowingUsers,
    getFollowers
}