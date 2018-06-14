// Requires
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

// Inicializar variables
var app = express();

var Usuario = require('../models/usuario');

// Referencias Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// =================================================
// Autentificación de Google
// =================================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async(req, res) => {

    var token = req.body.token;

    var googleUser = await verify(token).catch(e => {
        return res.status(403).json({
            ok: false,
            mensaje: 'Token no valido',
            err: e
        });
    });

    Usuario.findOne({ email: googleUser.email }, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                error: err
            });
        }
        if (usuario) {
            if (!usuario.google) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe usar la autentificacion normal!'
                });
            } else {
                usuario.password = ';)!';
                //Crear Token
                var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 144000 }); //14400 es igual a 4 horas


                return res.status(200).json({
                    ok: true,
                    usuario: usuario,
                    token: token,
                    id: usuario._id
                });
            }
        } else {
            // El usuario no existe
            var usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.password = ';)';
            usuario.google = true;

            usuario.save((err, usuarioGuardado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar usuarios',
                        error: err
                    });
                }
                var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 144000 }); //14400 es igual a 4 horas

                res.status(200).json({
                    ok: true,
                    usuario: usuarioGuardado,
                    token: token,
                    id: usuarioGuardado._id
                });
            });
        }

    });
    /*
    return res.status(200).json({
        ok: true,
        mensaje: 'Todo bien',
        googleUser: googleUser
    });*/
});

// =================================================
// Autentificación normal
// =================================================
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