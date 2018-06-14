// Requires
var express = require('express');
// var mongoose = require('mongoose');
var fs = require('fs');

// Inicializar variables
var app = express();

const path = require('path');

// Rutas
app.get('/:tipo/:img', (req, res, next) => {
    var tipo = req.params.tipo;
    var img = req.params.img;

    var Colecciones = ['usuarios', 'medicos', 'hospitales'];

    if (Colecciones.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Coleccion no valida',
            error: { message: 'las Colecciones validas son :' + Colecciones.join(', ') }
        });
    }

    var pathImg = path.resolve(__dirname, `../upload/${tipo}/${img}`);

    if (fs.existsSync(pathImg)) {
        res.sendFile(pathImg);
    } else {
        var fakePath = path.resolve(__dirname, '../assets/no-img.jpg');
        res.sendFile(fakePath);
    }
});

module.exports = app;