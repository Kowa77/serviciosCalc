document.addEventListener('DOMContentLoaded', () => {
    const listaCarrito = document.getElementById('lista-carrito');
    const totalCarritoElement = document.getElementById('total-carrito');
    const carritoItems = JSON.parse(localStorage.getItem('carrito')) || [];
    let totalCarrito = 0;
  
    function mostrarCarrito() {
      listaCarrito.innerHTML = '';
      totalCarrito = 0;
  
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
      } else {
        listaCarrito.innerHTML = '<li class="list-group-item">No hay servicios en el carrito.</li>';
      }
      totalCarritoElement.textContent = totalCarrito.toFixed(2);
      actualizarCantidadNavbar();
    }
  
    function eliminarServicio(index) {
      carritoItems.splice(index, 1);
      localStorage.setItem('carrito', JSON.stringify(carritoItems));
      mostrarCarrito();
    }
  
    function actualizarCantidadNavbar() {
      const cantidadNavbar = document.getElementById('carrito-cantidad-navbar');
      if (cantidadNavbar) {
        cantidadNavbar.textContent = carritoItems.length;
      }
    }
  
    listaCarrito.addEventListener('click', (event) => {
      if (event.target.classList.contains('eliminar-servicio')) {
        const index = parseInt(event.target.dataset.index);
        eliminarServicio(index);
      }
    });
  
    mostrarCarrito();
  });