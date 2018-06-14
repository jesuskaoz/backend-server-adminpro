// Requires
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutentificacion = require('../middlewares/autentificacion');

// Inicializar variables
var app = express();

var Hospital = require('../models/hospital');

// =================================================
// Obtener todos los hospitales
// =================================================
app.get('/', (req, res, next) => {
    var page = req.query.page || 0;
    page = Number(page);
    Hospital.find({})
        .populate('usuario', 'nombre email')
        .skip(page)
        .limit(5)
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospitales',
                    error: err
                });
            }

            Hospital.count({}, (err, contador) => {
                res.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    contador: contador
                });
            });
        })
});


// =================================================
// Crear un nuevo hospital
// =================================================

app.post('/', mdAutentificacion.VerificarToken, (req, res) => {
    var body = req.body;
    var user = req.usuario;
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: user._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear Hospital',
                error: err
            });
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            usuariotoken: user
        });
    });
});




// =================================================
// Actualizar Hospital
// =================================================

app.put('/:id', mdAutentificacion.VerificarToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    var user = req.usuario;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'No se encontro el Hospital',
                error: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ', no existe',
                error: { message: '¡No existe hospital con ese ID' }
            });
        }

        hospital.nombre = body.nombre;

        hospital.usuario = user._id;

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar Hospital',
                    error: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado,
                usuariotoken: user
            });
        });

    });


});

// =================================================
// Borrar un hospital por id
// =================================================

app.delete('/:id', mdAutentificacion.VerificarToken, (req, res) => {
    var id = req.params.id;
    var user = req.usuario;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                error: err
            });
        }
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ', no existe',
                error: { message: '¡No existe el  hospital con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado,
            usuariotoken: user
        });
    });

});
module.exports = app;