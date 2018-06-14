// Requires
var express = require('express');

var mdAutentificacion = require('../middlewares/autentificacion');

// Inicializar variables
var app = express();

var Hospital = require('../models/hospital');
var Medicos = require('../models/medico');
var Usuario = require('../models/usuario');

// =================================================
// Busquedas por coleccion
// =================================================

app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {
    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regex = new RegExp(busqueda, 'i');
    var promesa;
    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuario(busqueda, regex);
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
            break;
        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
            break;
        default:
            res.status(400).json({
                ok: false,
                mensaje: 'Las busquedas posibles son: usuarios, medicos u hospitales',
                err: { message: 'Tipo de coleccion invalida' }
            });
            break;
    }

    promesa.then(datos => {
        res.status(200).json({
            ok: true,
            [tabla]: datos
        });
    });

});

// =================================================
// Busquedas generales
// =================================================
app.get('/todo/:busqueda', (req, res, next) => {
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuario(busqueda, regex)
        ])
        .then(respuesta => {
            res.status(200).json({
                ok: true,
                hospitales: respuesta[0],
                medicos: respuesta[1],
                usuarios: respuesta[2],
            });
        });

});


function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospital) => {
                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospital);
                }
            });
    });
}

function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Medicos.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuario(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuario) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuario);
                }
            });
    });
}
module.exports = app;