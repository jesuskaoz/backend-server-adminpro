// Requires
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

// Inicializar variables
var app = express();

var Usuario = require('../models/usuario');

app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                error: err
            });
        }
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales invalidas! - email',
                error: err
            });
        }
        if (!bcrypt.compareSync(body.password, usuario.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales invalidas! - password',
                error: err
            });
        }

        usuario.password = ';)!';
        //Crear Token
        var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 }); //14400 es igual a 4 horas


        res.status(200).json({
            ok: true,
            usuario: usuario,
            token: token,
            id: usuario._id
        });
    });


});


module.exports = app;