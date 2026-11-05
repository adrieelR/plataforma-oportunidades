require('dotenv').config();

// las pruebas usan siempre la base de datos de pruebas, nunca la de desarrollo

// esta linea apunta a plataforma_test para no borrar datos importante
process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
