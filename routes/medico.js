// Requires
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutentificacion = require('../middlewares/autentificacion');

// Inicializar variables
var app = express();

var Medicos = require('../models/medico');

// =================================================
// Obtener todos los medicos
// =================================================
app.get('/', (req, res, next) => {
    var page = req.query.page || 0;
    page = Number(page);

    Medicos.find({})
        .skip(page)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando medicos',
                    error: err
                });
            }
            Medicos.count({}, (err, contador) => {
                res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    contador: contador
                });
            });
        })
});


// =================================================
// Crear un nuevo medicos
// =================================================

app.post('/', mdAutentificacion.VerificarToken, (req, res) => {
    var body = req.body;
    var _idHospital = body.hospital;
    var user = req.usuario;

    medicos = new Medicos({
        nombre: body.nombre,
        hospital: _idHospital,
        usuario: user._id
    });

    medicos.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                error: err
            });
        }
        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
            usuariotoken: user
        });
    });

});


// =================================================
// Actualizar medico
// =================================================

app.put('/:id', mdAutentificacion.VerificarToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    var user = req.usuario;

    Medicos.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'No se encontro el medico',
                error: err
            });
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ', no existe',
                error: { message: '¡No existe medico con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = user._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    error: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado,
                usuariotoken: user
            });
        });

    });


});

// =================================================
// Borrar un medico por id
// =================================================

app.delete('/:id', mdAutentificacion.VerificarToken, (req, res) => {
    var id = req.params.id;
    var user = req.usuario;

    Medicos.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                error: err
            });
        }
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ', no existe',
                error: { message: '¡No existe el  medico con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado,
            usuariotoken: user
        });
    });

});
module.exports = app;