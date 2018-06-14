// Requires
var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');
var mdAutentificacion = require('../middlewares/autentificacion');

// Inicializar variables
var app = express();
// default options
app.use(fileUpload());

var Hospital = require('../models/hospital');
var Medicos = require('../models/medico');
var Usuario = require('../models/usuario');

// =================================================
// Busquedas por coleccion
// =================================================

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;
    //Tipos de coleccion
    var Colecciones = ['usuarios', 'medicos', 'hospitales'];

    if (Colecciones.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Coleccion no valida',
            error: { message: 'las Colecciones validas son :' + Colecciones.join(', ') }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            error: { message: 'Debe de seleccionar una imagen!' }
        });
    }
    // Obtenemos los datos del archivo
    var archivo = req.files.imagen;
    var arregloImagen = archivo.name.split('.');
    var extension = arregloImagen[arregloImagen.length - 1].toLowerCase();
    // Extensiones validas
    var extensionesValidas = ['jpg', 'png', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            error: { message: 'las extensiones validas son :' + extensionesValidas.join(', ') }
        });
    }

    // Nombre archivo
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds()}.${extension}`;
    // Mover el archivo temporal al path
    var path = `./upload/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                error: err
            });
        }

        SubirTipo(tipo, id, nombreArchivo, res);

        /*
        res.status(200).json({
            ok: true,
            mensaje: 'exito!',
            extension: extension
        });*/
    });

});

function SubirTipo(tipo, id, imagen, res) {

    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No existe el usuario',
                    error: { message: 'No se encontro al usuario especificado' }
                });
            }

            var oldpath = './upload/usuarios/' + usuario.img;
            //Verificamos si existe la imagen y la borramos
            if (fs.existsSync(oldpath)) {
                fs.unlinkSync(oldpath);
            }
            usuario.img = imagen;
            usuario.save((err, useract) => {
                useract.password = ";)";

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar el usuario',
                        error: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada!',
                    usuario: useract
                });
            });
        });
    }
    if (tipo === 'medicos') {
        Medicos.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No existe el medico',
                    error: { message: 'No se encontro al medico especificado' }
                });
            }
            var oldpath = './upload/medicos/' + medico.img;
            //Verificamos si existe la imagen y la borramos
            if (fs.existsSync(oldpath)) {
                fs.unlinkSync(oldpath);
            }
            medico.img = imagen;
            medico.save((err, medicoact) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar el medico',
                        error: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada!',
                    medico: medicoact
                });
            });
        });
    }
    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No existe el hospital',
                    error: { message: 'No se encontro al hospital especificado' }
                });
            }

            var oldpath = './upload/hospitales/' + hospital.img;
            //Verificamos si existe la imagen y la borramos
            if (fs.existsSync(oldpath)) {
                fs.unlinkSync(oldpath);
            }
            hospital.img = imagen;
            hospital.save((err, hospitalact) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar el hospital',
                        error: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada!',
                    hospital: hospitalact
                });
            });
        });
    }
}
module.exports = app;