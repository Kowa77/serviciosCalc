const listaCarrito = document.getElementById('lista-carrito');
const totalCarritoElement = document.getElementById('total-carrito');
const carritoItems = JSON.parse(localStorage.getItem('carrito')) || [];
const serviciosDataGlobalString = localStorage.getItem('serviciosDataGlobal');
const serviciosDataGlobal = serviciosDataGlobalString ? JSON.parse(serviciosDataGlobalString) : {};
let totalCarrito = 0;

function mostrarCarrito() {
  listaCarrito.innerHTML = '';
  totalCarrito = 0;
  let precioFinalCarrito = 0;
  let descuentoTextoCarrito = '';
  let todosLosServiciosEnCarrito = false;

  if (carritoItems.length > 0) {
    carritoItems.forEach((servicio, index) => {
      const listItem = document.createElement('li');
      listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
      listItem.innerHTML = `
        <div>
          <img src="../../assets/${servicio.imagen}" alt="${servicio.nombre}" width="24" height="24" class="me-2">
          ${servicio.nombre} - $${servicio.precio}
        </div>
        <button class="btn btn-danger btn-sm eliminar-servicio" data-index="${index}">Eliminar</button>
      `;
      listaCarrito.appendChild(listItem);
      totalCarrito += servicio.precio;
    });

    // Verificar si todos los servicios están en el carrito
    const nombresServiciosEnCarrito = carritoItems.map(item => item?.nombre);
    const nombresTodosLosServicios = Object.values(serviciosDataGlobal).map(servicio => servicio?.nombre);

    if (nombresTodosLosServicios.length > 0 && nombresServiciosEnCarrito.length === nombresTodosLosServicios.length && nombresTodosLosServicios.every(nombre => nombresServiciosEnCarrito.includes(nombre))) {
      todosLosServiciosEnCarrito = true;
    }

    precioFinalCarrito = totalCarrito;
    if (todosLosServiciosEnCarrito) {
      precioFinalCarrito = parseFloat((totalCarrito * 0.9).toFixed(2));
      descuentoTextoCarrito = ' <span style="color: green;">📉 -10% aplicado</span>';
    }

  } else {
    listaCarrito.innerHTML = '<li class="list-group-item">No hay servicios en el carrito.</li>';
  }

  totalCarritoElement.innerHTML = precioFinalCarrito.toFixed(2) + descuentoTextoCarrito;
  actualizarCantidadNavbar();
}

// Event listener para eliminar servicios
listaCarrito.addEventListener('click', function(event) {
  if (event.target.classList.contains('eliminar-servicio')) {
    const indexAEliminar = parseInt(event.target.dataset.index);
    carritoItems.splice(indexAEliminar, 1);
    localStorage.setItem('carrito', JSON.stringify(carritoItems));
    mostrarCarrito();
  }
});

// Función para actualizar la cantidad del carrito en la navbar
function actualizarCantidadNavbar() {
  const carritoCantidadNavbarCarrito = document.getElementById('carrito-cantidad-navbar');
  if (carritoCantidadNavbarCarrito) {
    carritoCantidadNavbarCarrito.textContent = carritoItems.length;
  }
}

// Mostrar el carrito al cargar la página
mostrarCarrito();