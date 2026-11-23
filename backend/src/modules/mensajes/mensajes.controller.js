const mensajesService = require('./mensajes.service');

const parsearIdEntero = (valor) => {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0 ? numero : null;
};

const enviarMensaje = async (req, res, next) => {
  try {
    const mensaje = await mensajesService.enviarMensaje({
      ...req.body,
      remitenteId: req.usuario.id,
    });
    res.status(201).json({ mensaje });
  } catch (error) {
    next(error);
  }
};

const listarMensajes = async (req, res, next) => {
  try {
    let ofertaId;
    if (req.query.ofertaId !== undefined) {
      ofertaId = parsearIdEntero(req.query.ofertaId);
      if (!ofertaId) {
        return res.status(400).json({ mensaje: 'El identificador de oferta no es válido' });
      }
    }

    const mensajes = await mensajesService.listarMensajes({
      usuarioId: req.usuario.id,
      ofertaId,
    });
    res.status(200).json({ mensajes });
  } catch (error) {
    next(error);
  }
};

const marcarComoLeido = async (req, res, next) => {
  try {
    const mensajeId = parsearIdEntero(req.params.id);
    if (!mensajeId) {
      return res.status(400).json({ mensaje: 'El identificador no es válido' });
    }

    const mensaje = await mensajesService.marcarComoLeido({
      mensajeId,
      usuarioId: req.usuario.id,
    });
    res.status(200).json({ mensaje });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  enviarMensaje,
  listarMensajes,
  marcarComoLeido,
};