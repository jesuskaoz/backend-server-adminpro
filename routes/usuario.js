// Requires
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutentificacion = require('../middlewares/autentificacion');

// Inicializar variables
var app = express();

var Usuario = require('../models/usuario');


// =================================================
// Obtener todos los usuarios
// =================================================
app.get('/', (req, res, next) => {
    Usuario.find({}, 'nombre email img role')
        .exec((err, usuarios) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuarios',
                    error: err
                });
            }

            res.status(200).json({
                ok: true,
                usuarios: usuarios
            });
        })
});

// =================================================
// Crear un nuevo usuario
// =================================================

app.post('/', mdAutentificacion.VerificarToken, (req, res) => {
    var body = req.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                error: err
            });
        }
        res.status(201).json({
            ok: true,
            usuarios: usuarioGuardado,
            usuariotoken: req.usuario
        });
    });
});




// =================================================
// Actualizar usuario
// =================================================

app.put('/:id', mdAutentificacion.VerificarToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'No se encontro el usuario',
                error: err
            });
        }
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ', no existe',
                error: { message: '¡No existe usuario con ese ID' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;
        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    error: err
                });
            }
            usuarioGuardado.password = ';)';
            res.status(200).json({
                ok: true,
                usuarios: usuarioGuardado,
                usuariotoken: req.usuario
            });
        });

    });


});

// =================================================
// Borrar un usuario por id
// =================================================

app.delete('/:id', mdAutentificacion.VerificarToken, (req, res) => {
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                error: err
            });
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ', no existe',
                error: { message: '¡No existe usuario con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            usuarios: usuarioBorrado,
            usuariotoken: req.usuario
        });
    });

});
module.exports = app;