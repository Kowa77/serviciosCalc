document.addEventListener('DOMContentLoaded', () => {
    const listaServicios = document.getElementById('lista-servicios');
    const serviciosCheckboxes = document.querySelectorAll('.servicio-checkbox');
    const enviarCarritoBtn = document.getElementById('enviar-carrito');
    const carritoLista = document.getElementById('carrito-lista');
    const carritoVacio = document.getElementById('carrito-vacio');
    const totalCarritoSpan = document.getElementById('total-carrito');
    const agregarTodoDescuentoBtn = document.getElementById('agregar-todo-descuento');
    const botonPagar = document.getElementById('boton-pagar');
    let carritoItems = [];

    function calcularTotalSinDescuento() {
        let totalSinDescuento = 0;
        carritoItems.forEach(item => {
            const precioStr = item.split('$')[1];
            if (precioStr) {
                const precio = parseFloat(precioStr);
                if (!isNaN(precio)) {
                    totalSinDescuento += precio;
                } else {
                    console.warn('No se pudo parsear el precio de:', item);
                }
            } else {
                console.warn('No se encontró el símbolo "$" en:', item);
            }
        });
        return totalSinDescuento;
    }

    function actualizarTotalCarrito() {
        const totalSinDescuento = calcularTotalSinDescuento();
        let totalConDescuentoGeneral = totalSinDescuento;
        let mensajeDescuentoGeneral = '';

        // Aplicar descuento general si se seleccionan todos los servicios
        if (carritoItems.length === serviciosCheckboxes.length && carritoItems.length > 0) {
            totalConDescuentoGeneral *= 0.9; // Aplicar 10% de descuento general
            mensajeDescuentoGeneral = ' (10% de descuento aplicado)';
        }

        totalCarritoSpan.textContent = `$${totalConDescuentoGeneral.toFixed(2)}${mensajeDescuentoGeneral}`;
        return totalConDescuentoGeneral;
    }

    function actualizarCarritoVisualizacion() {
        carritoLista.innerHTML = '';
        if (carritoItems.length > 0) {
            carritoVacio.style.display = 'none';
            botonPagar.style.display = 'block'; // Mostrar el botón pagar
            carritoItems.forEach(item => {
                const listItemCarrito = document.createElement('li');
                listItemCarrito.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
                listItemCarrito.textContent = item;

                const botonEliminar = document.createElement('button');
                botonEliminar.classList.add('btn', 'btn-sm', 'btn-danger');
                botonEliminar.textContent = 'Eliminar';
                botonEliminar.addEventListener('click', () => {
                    const index = carritoItems.indexOf(item);
                    if (index > -1) {
                        carritoItems.splice(index, 1);
                        // Desmarcar el checkbox correspondiente
                        serviciosCheckboxes.forEach(checkbox => {
                            if (checkbox.value === item) {
                                checkbox.checked = false;
                                const listItem = checkbox.closest('.list-group-item');
                                if (listItem) {
                                    listItem.classList.remove('seleccionado');
                                }
                            }
                        });
                        actualizarCarritoVisualizacion();
                    }
                });
                listItemCarrito.appendChild(botonEliminar);
                carritoLista.appendChild(listItemCarrito);
            });
            enviarCarritoBtn.textContent = 'Actualizar Carrito';
        } else {
            carritoVacio.style.display = 'block';
            botonPagar.style.display = 'none'; // Ocultar el botón pagar
            enviarCarritoBtn.textContent = 'Enviar al Carrito';
        }
        actualizarTotalCarrito();
    }

    serviciosCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (event) => {
            const listItem = event.target.closest('.list-group-item');
            const servicioTexto = event.target.value;
            if (event.target.checked) {
                listItem.classList.add('seleccionado');
                carritoItems.push(servicioTexto);
            } else {
                listItem.classList.remove('seleccionado');
                const index = carritoItems.indexOf(servicioTexto);
                if (index > -1) {
                    carritoItems.splice(index, 1);
                }
            }
            actualizarCarritoVisualizacion();
        });
    });

    enviarCarritoBtn.addEventListener('click', () => {
        const totalCarrito = actualizarTotalCarrito();
        const mensajeDescuento = carritoItems.length === serviciosCheckboxes.length && carritoItems.length > 0 ? ' con 10% de descuento' : '';
        alert(`Carrito actualizado. Total: $${totalCarrito.toFixed(2)}${mensajeDescuento} (ver consola para detalles)`);
        // Aquí iría la lógica para enviar/actualizar el carrito real con el total
    });

    agregarTodoDescuentoBtn.addEventListener('click', () => {
        carritoItems = []; // Limpiar el carrito
        serviciosCheckboxes.forEach(checkbox => {
            checkbox.checked = true;
            const listItem = checkbox.closest('.list-group-item');
            listItem.classList.add('seleccionado');
            carritoItems.push(checkbox.value);
        });
        actualizarCarritoVisualizacion();
        const totalCarrito = actualizarTotalCarrito();
        alert(`Se agregaron todos los servicios. Total: $${totalCarrito.toFixed(2)} con 10% de descuento (ver consola para detalles)`);
    });

    // Inicializar la visualización del carrito al cargar la página
    actualizarCarritoVisualizacion();

    // Lógica para el modal de pago
    const modalPagar = document.getElementById('modal-pagar');
    const efectivoRadio = document.getElementById('efectivo');
    const tarjetaRadio = document.getElementById('tarjeta');
    const transferenciaRadio = document.getElementById('transferencia');
    const detalleEfectivo = document.getElementById('detalle-efectivo');
    const detalleTarjeta = document.getElementById('detalle-tarjeta');
    const detalleTransferencia = document.getElementById('detalle-transferencia');
    const confirmarPagoBtn = document.getElementById('confirmar-pago');
    const totalConDescuentoEfectivoSpan = document.getElementById('total-con-descuento-efectivo');

    function calcularTotalConDescuentoFinal() {
        let totalSinDescuento = calcularTotalSinDescuento();
        // Aplicar descuento general si todos están seleccionados
        if (carritoItems.length === serviciosCheckboxes.length && carritoItems.length > 0) {
            totalSinDescuento *= 0.9;
        }
        // Aplicar descuento adicional por efectivo
        if (efectivoRadio.checked) {
            totalSinDescuento *= 0.9;
        }
        return totalSinDescuento;
    }

    function actualizarTotalConDescuentoEfectivoModal() {
        totalConDescuentoEfectivoSpan.textContent = calcularTotalConDescuentoFinal().toFixed(2);
    }

    if (modalPagar) {
        modalPagar.addEventListener('show.bs.modal', () => {
            actualizarTotalConDescuentoEfectivoModal(); // Calcular y mostrar el descuento al abrir el modal
        });
    }

    if (efectivoRadio) {
        efectivoRadio.addEventListener('change', () => {
            detalleEfectivo.style.display = 'block';
            detalleTarjeta.style.display = 'none';
            detalleTransferencia.style.display = 'none';
            actualizarTotalConDescuentoEfectivoModal(); // Actualizar el total con descuento al seleccionar efectivo
        });
    }

    if (tarjetaRadio) {
        tarjetaRadio.addEventListener('change', () => {
            detalleEfectivo.style.display = 'none';
            detalleTarjeta.style.display = 'block';
            detalleTransferencia.style.display = 'none';
            actualizarTotalConDescuentoEfectivoModal(); // Actualizar el total al cambiar la opción de pago
        });
    }

    if (transferenciaRadio) {
        transferenciaRadio.addEventListener('change', () => {
            detalleEfectivo.style.display = 'none';
            detalleTarjeta.style.display = 'none';
            detalleTransferencia.style.display = 'block';
            actualizarTotalConDescuentoEfectivoModal(); // Actualizar el total al cambiar la opción de pago
        });
    }

    if (confirmarPagoBtn) {
        confirmarPagoBtn.addEventListener('click', () => {
            const metodoPagoSeleccionado = document.querySelector('input[name="metodoPago"]:checked').value;
            const totalAPagar = calcularTotalConDescuentoFinal();
            let mensajeDescuentoPago = '';

            if (metodoPagoSeleccionado === 'efectivo') {
                mensajeDescuentoPago = ' (10% de descuento general + 10% adicional por pago en efectivo aplicado)';
            } else if (carritoItems.length === serviciosCheckboxes.length && carritoItems.length > 0) {
                mensajeDescuentoPago = ' (10% de descuento general aplicado)';
            }

            alert(`Pago confirmado por ${metodoPagoSeleccionado} por un total de $${totalAPagar.toFixed(2)}${mensajeDescuentoPago}. ¡Gracias por su compra! (Ver consola para más detalles)`);
            console.log('Detalles del pago:', {
                metodoPago: metodoPagoSeleccionado,
                total: totalAPagar.toFixed(2),
                items: carritoItems
            });
            // Aquí iría la lógica para procesar el pago según el método seleccionado
            // y posiblemente limpiar el carrito
            carritoItems = [];
            actualizarCarritoVisualizacion();
        });
    }
});