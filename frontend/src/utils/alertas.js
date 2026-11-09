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
