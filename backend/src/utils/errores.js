const crearError = (mensaje, estado) => {
  const error = new Error(mensaje);
  error.estado = estado;
  return error;
};

module.exports = { crearError };