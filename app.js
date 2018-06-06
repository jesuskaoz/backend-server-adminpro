// Requires
var express = require('express');
var mongoose = require('mongoose');


// Inicializar variables
var app = express();

//Conexion

mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {

    if (err) throw err;
    console.log('Base de Datos status: \x1b[32m%s\x1b[0m', 'online');

});

// Rutas
app.get('/', (req, res, next) => {

    res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    });
});

//Escuchar peticiones
app.listen(3001, () => {
    console.log('Node/Express Port: 300 status: \x1b[32m%s\x1b[0m', 'online');
});