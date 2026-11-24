const nodemailer = require('nodemailer');

// ServicioCorreo: único punto del sistema que conoce al proveedor de correo (RF-10, CU-10).
// El resto del código solo llama a enviarCorreo(), sin saber si el envío es real o simulado.
const esSimulado = () => process.env.NODE_ENV === 'test' || !process.env.SMTP_HOST;

let transporte;

const obtenerTransporte = () => {
  if (transporte) return transporte;

  if (esSimulado()) {
    // Sin servidor SMTP configurado, el correo no sale: queda en memoria
    transporte = nodemailer.createTransport({ jsonTransport: true });
  } else {
    const puerto = Number(process.env.SMTP_PORT) || 587;
    transporte = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: puerto,
      secure: puerto === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }

  return transporte;
};

const enviarCorreo = async ({ destinatario, asunto, cuerpo }) => {
  await obtenerTransporte().sendMail({
    from: process.env.MAIL_FROM || 'Plataforma de Oportunidades <no-responder@plataforma.cl>',
    to: destinatario,
    subject: asunto,
    text: cuerpo, // solo texto plano: el contenido del usuario nunca se interpreta como HTML
  });

  if (esSimulado() && process.env.NODE_ENV !== 'test') {
    // Se registra solo el destinatario y el asunto, nunca el cuerpo
    console.log(`[correo simulado] Para: ${destinatario} | Asunto: ${asunto}`);
  }
};

module.exports = { enviarCorreo };