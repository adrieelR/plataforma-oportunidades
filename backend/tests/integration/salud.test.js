const request = require('supertest');
const app = require('../../src/app');



// la funcion describe agrupa pruebas relacionadas, y Test define una prueba con un nombre que se lee como una frase
// request(app) es de supertest: simula una peticion HTTP a tu aplicación sin encender el servidor en un puerto
// expect (toBe) es una comprobacion. si el valor real no coincide con el esperado, la prueba falla y te dice cual era la diferencia

describe('GET /api/salud', () =>{
    test('responde 200 y estado ok', async()=>{
        const respuesta = await request(app).get('/api/salud');

        expect(respuesta.statusCode).toBe(200);
        expect(respuesta.body).toEqual({estado: 'ok'});
    });
});