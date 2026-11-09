const rateLimit = require('express-rate-limit');
/*
Cada dirección IP puede intentar iniciar sesión 10 veces cada 15 minutos. 
El que prueba contraseñas una tras otra, que es la base de un ataque de fuerza bruta, queda bloqueado.
La línea skip apaga el límite durante las pruebas automáticas, porque Jest define NODE_ENV como test, 
y así las pruebas no se bloquean a sí mismas. 
Este archivo es la evidencia de la medida del artículo 2 en la tabla de normativa.

*/

//OWASP A07: limita los intentos de login para frenar ataques de fuerza bruta
const limitadorLogin = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === 'test',
    message: { mensaje: 'Demasiados intentos. Intenta de nuevo en 15 minutos'},
});

module.exports = { limitadorLogin };