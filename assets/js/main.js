import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBblG3qsZT7uNZ-oJnrFqTXrI5ZGZ9RnPA",
  authDomain: "servicephoto-ad95d.firebaseapp.com",
  databaseURL: "https://servicephoto-ad95d-default-rtdb.firebaseio.com",
  projectId: "servicephoto-ad95d",
  storageBucket: "servicephoto-ad95d.firebasestorage.app",
  messagingSenderId: "428185830342",
  appId: "1:428185830342:web:6595150205ccbc04d7a8c7",
  measurementId: "G-NYRSRSKN5B"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const serviciosRef = ref(database, 'servicios');
const listaServicios = document.getElementById('lista-servicios');
const totalPrecioElement = document.getElementById('total-precio');
const agregarTodoDescuentoBtn = document.getElementById('agregar-todo-descuento');
const enviarCarritoBtn = document.getElementById('enviar-carrito');
const carritoCantidadNavbar = document.getElementById('carrito-cantidad-navbar');
let total = 0;
let serviciosDataGlobal = {};
let carritoGuardado = JSON.parse(localStorage.getItem('carrito')) || [];

// Inicializa el carrito y el total al cargar la página
function inicializarCarrito() {
  total = 0;
  carritoGuardado.forEach(item => {
    if (item?.precio) {
      total += item.precio;
    }
  });
  actualizarTotal();
  actualizarCantidadNavbar();
}

// Función para actualizar el total y aplicar descuento si todos están seleccionados
function actualizarTotal() {
  const checkboxes = listaServicios.querySelectorAll('input[type="checkbox"]');
  const todosSeleccionados = Array.from(checkboxes).every(cb => cb.checked);
  let precioFinal = total;
  let descuentoTexto = '';

  if (todosSeleccionados && Object.keys(serviciosDataGlobal).length > 0 && checkboxes.length === Object.keys(serviciosDataGlobal).length) {
    precioFinal = parseFloat((total * 0.9).toFixed(2)); // Aplicar 10% de descuento y asegurar precisión
    descuentoTexto = ' <span style="color: green;">📉 -10% aplicado</span>';
  }

  totalPrecioElement.innerHTML = precioFinal.toFixed(2) + descuentoTexto;
}

// Función para actualizar la cantidad del carrito en la navbar
function actualizarCantidadNavbar() {
  if (carritoCantidadNavbar) {
    carritoCantidadNavbar.textContent = carritoGuardado.length;
  }
}

function actualizarTextoBotonDescuento() {
  const checkboxes = listaServicios.querySelectorAll('input[type="checkbox"]');
  const todosSeleccionados = Array.from(checkboxes).every(cb => cb.checked);

  if (todosSeleccionados && checkboxes.length > 0 && Object.keys(serviciosDataGlobal).length === checkboxes.length) {
    agregarTodoDescuentoBtn.textContent = 'No aplicar 10% Descuento';
    agregarTodoDescuentoBtn.classList.remove('boton-descuento-intermitente');
  } else {
    agregarTodoDescuentoBtn.textContent = 'Todo con ➡️ (10% menos)';
    agregarTodoDescuentoBtn.classList.add('boton-descuento-intermitente');
  }
}

// Escucha los cambios en los datos de 'servicios' en Firebase
onValue(serviciosRef, (snapshot) => {
  listaServicios.innerHTML = '';
  serviciosDataGlobal = snapshot.val() || {};
  const serviciosData = serviciosDataGlobal;
  total = 0; // Reiniciar el total al cargar los servicios

  if (serviciosData) {
    Object.keys(serviciosData).forEach(servicioId => {
      const servicio = serviciosData[servicioId];

      const listItem = document.createElement('li');
      listItem.classList.add('list-group-item');

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = servicioId;
      checkbox.classList.add('form-check-input', 'me-2');
      checkbox.id = `servicio-${servicioId}`;
      checkbox.dataset.precio = servicio.precio; // Almacenar el precio en el dataset

      const estaEnCarrito = carritoGuardado.some(item => item?.nombre === servicio.nombre);
      if (estaEnCarrito) {
        checkbox.checked = true;
        total += servicio.precio;
      }

      const label = document.createElement('label');
      label.classList.add('form-check-label');
      label.setAttribute('for', `servicio-${servicioId}`);
      label.innerHTML = `
        <img src="assets/${servicio.imagen}" alt="${servicio.nombre}" width="24" height="24" class="me-2">
        ${servicio.nombre} - $${servicio.precio}
      `;

      checkbox.addEventListener('change', (event) => {
        const servicioIdCheckbox = event.target.value;
        const servicioSeleccionado = serviciosDataGlobal[servicioIdCheckbox];
        const precioServicio = parseFloat(event.target.dataset.precio);

        if (servicioSeleccionado && !isNaN(precioServicio)) {
          if (event.target.checked) {
            total += precioServicio;
            if (!carritoGuardado.some(item => item?.nombre === servicioSeleccionado.nombre)) {
              carritoGuardado.push(servicioSeleccionado);
              localStorage.setItem('carrito', JSON.stringify(carritoGuardado));
              actualizarCantidadNavbar();
            }
          } else {
            total -= precioServicio;
            carritoGuardado = carritoGuardado.filter(item => item?.nombre !== servicioSeleccionado.nombre);
            localStorage.setItem('carrito', JSON.stringify(carritoGuardado));
            actualizarCantidadNavbar();
          }
          actualizarTotal();
          actualizarTextoBotonDescuento();
        }
      });

      listItem.appendChild(checkbox);
      listItem.appendChild(label);
      listaServicios.appendChild(listItem);
    });
    actualizarTotal();
    actualizarCantidadNavbar();
    actualizarTextoBotonDescuento();
  } else {
    listaServicios.innerHTML = '<li class="list-group-item">No hay servicios disponibles.</li>';
    totalPrecioElement.textContent = '0.00';
    actualizarCantidadNavbar();
    agregarTodoDescuentoBtn.textContent = 'Todo con ➡️ (10% menos)';
    agregarTodoDescuentoBtn.classList.remove('boton-descuento-intermitente');
  }
});

// Event listener para el botón "Agregar todo con descuento"
agregarTodoDescuentoBtn.addEventListener('click', () => {
  const checkboxes = listaServicios.querySelectorAll('input[type="checkbox"]');
  const todosSeleccionadosAhora = Array.from(checkboxes).every(cb => cb.checked);

  total = 0;
  carritoGuardado = [];

  if (!todosSeleccionadosAhora) {
    Object.values(serviciosDataGlobal).forEach(servicio => {
      total += servicio.precio;
      carritoGuardado.push(servicio);
    });
    checkboxes.forEach(checkbox => {
      checkbox.checked = true;
    });
  } else {
    checkboxes.forEach(checkbox => {
      checkbox.checked = false;
    });
    total = 0;
    carritoGuardado = [];
  }

  localStorage.setItem('carrito', JSON.stringify(carritoGuardado));
  actualizarTotal();
  actualizarCantidadNavbar();
  actualizarTextoBotonDescuento();
});

// Event listener para el botón "Agregar a Carrito"
enviarCarritoBtn.addEventListener('click', () => {
  const serviciosSeleccionados = carritoGuardado; // Usamos el carrito guardado
  if (serviciosSeleccionados.length > 0) {
    localStorage.setItem('carrito', JSON.stringify(serviciosSeleccionados));
    window.location.href = '../../paginas/carrito.html'; // Redirigir a la página del carrito
  } else {
    alert('Por favor, selecciona al menos un servicio antes de agregar al carrito.');
  }
});

// Event listener para el cambio individual de los checkboxes (REMOVED - la lógica está dentro del onValue)

// Inicializar carrito al cargar la página
inicializarCarrito();