import Swal from 'sweetalert2'

const COLOR_PELIGRO = '#b42318'
const COLOR_PRIMARIO = '#0f766e'
const COLOR_CANCELAR = '#5e6b76'

export async function confirmarAccion({
  titulo,
  texto,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  peligro = true,
}) {
  const resultado = await Swal.fire({
    title: titulo,
    text: texto,
    icon: 'warning',
    showCancelButton: true,
    reverseButtons: true,
    focusCancel: true,
    confirmButtonText: textoConfirmar,
    cancelButtonText: textoCancelar,
    confirmButtonColor: peligro ? COLOR_PELIGRO : COLOR_PRIMARIO,
    cancelButtonColor: COLOR_CANCELAR,
  })

  return resultado.isConfirmed
}

export async function solicitarMotivo({
  titulo,
  texto,
  textoConfirmar = 'Confirmar',
  placeholder = 'Escribe el motivo (entre 10 y 500 caracteres).',
  minimo = 10,
  maximo = 500,
}) {
  const resultado = await Swal.fire({
    title: titulo,
    text: texto,
    icon: 'warning',
    input: 'textarea',
    inputPlaceholder: placeholder,
    inputAttributes: {
      'aria-label': 'Motivo',
      maxlength: maximo,
    },
    showCancelButton: true,
    reverseButtons: true,
    confirmButtonText: textoConfirmar,
    cancelButtonText: 'Cancelar',
    confirmButtonColor: COLOR_PELIGRO,
    cancelButtonColor: COLOR_CANCELAR,
    inputValidator: (valor) => {
      const motivo = (valor || '').trim()

      if (motivo.length < minimo) {
        return `El motivo debe tener al menos ${minimo} caracteres.`
      }

      if (motivo.length > maximo) {
        return `El motivo no puede superar los ${maximo} caracteres.`
      }

      return undefined
    },
  })

  if (!resultado.isConfirmed) {
    return null
  }

  return String(resultado.value || '').trim()
}
