

/*
const express = require('express'); // express() es para crear la aplicacion, es una libreria que recibe peticiones HTTP
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Esta seccion del app.use() agrega el middlewares es decir funciones por las que pasa toda peticion antes de llegar a su ruta
app.use(helmet()); // agrega cabeceras de seguridad HTTTP
app.use(cors()); // Permite que el frontedn (que correra en otro puerto) pueda llamar a esta API
app.use(express.json()); // convierte el cuerpo de las peticiones de JSON a objeto de Js

// este bloque define la ruta cuando alguien pida GET, se ejecuta toda esta fucnion
app.get('/api/salud', (req, res)=>{ 
    res.json({estado : 'ok' });
}
);


module.exports = app; // deja la aplicación disponible para otros archivos
*/


const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/api/salud', (req, res) => {
  res.json({ estado: 'ok' });
});

module.exports = app;

app.get('/api/version',(req,res)=>{
  res.json({prueba: 'holaMundo'})
});