import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js"; // Importar la función que inicializa la app de Firebase
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js"; // Importar las funciones necesarias para la base de datos de Firebase

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBblG3qsZT7uNZ-oJnrFqTXrI5ZGZ9RnPA", //   Clave API de Firebase
  authDomain: "servicephoto-ad95d.firebaseapp.com", // Dominio de autenticación de Firebase
  databaseURL: "https://servicephoto-ad95d-default-rtdb.firebaseio.com", // URL de la base de datos de Firebase
  projectId: "servicephoto-ad95d", // ID del proyecto de Firebase
  storageBucket: "servicephoto-ad95d.firebasestorage.app", // Almacén de Firebase
  messagingSenderId: "428185830342", // ID del remitente de mensajes de Firebase
  appId: "1:428185830342:web:6595150205ccbc04d7a8c7",
  measurementId: "G-NYRSRSKN5B" //  ID de medición (opcional)
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig); // Inicializa la app de Firebase
const database = getDatabase(app); // Inicializa la base de datos
const serviciosRef = ref(database, 'servicios'); // Referencia a la base de datos de servicios

// Elementos del DOM
const listaServicios = document.getElementById('lista-servicios'); // Elemento donde se mostrarán los servicios
const totalPrecioElement = document.getElementById('total-precio');// Elemento donde se mostrará el total
const agregarTodoDescuentoBtn = document.getElementById('agregar-todo-descuento'); // Botón para agregar todos los servicios con descuento
const enviarCarritoBtn = document.getElementById('enviar-carrito');// Botón para enviar el carrito
const carritoCantidadNavbar = document.getElementById('carrito-cantidad-navbar'); // Elemento donde se mostrará la cantidad de servicios en el carrito


// Variables globales
let total = 0;  // Variable para almacenar el total de los servicios
let serviciosDataGlobal = {}; // Variable global para almacenar los datos de servicios (Objeto vacío por defecto)
let carritoGuardado = JSON.parse(localStorage.getItem('carrito')) || []; // Inicializa el carrito guardado desde localStorage
let aplicarDescuentoGlobal = false; // Nueva variable para rastrear el descuento global

// Inicializa el carrito y el total al cargar la página
function inicializarCarrito() {
  total = 0;
  carritoGuardado.forEach(item => { // Recorre los elementos del carrito guardado en localStorage
    if (item?.precio) {             // Verifica si el precio existe
      total += item.precio;         // Suma el precio al total  
    }
  });
  actualizarTotal();            // Actualiza el total en la interfaz    
  actualizarCantidadNavbar();   // Actualiza la cantidad en la navbar              
}

// Función para actualizar el total y en caso que sean todos los servicios seleccionados, aplicar el descuento
function actualizarTotal() {
  const checkboxes = listaServicios.querySelectorAll('input[type="checkbox"]');
  const todosSeleccionados = Array.from(checkboxes).every(cb => cb.checked);
  let precioFinal = total;
  let descuentoTexto = '';

  if (todosSeleccionados && Object.keys(serviciosDataGlobal).length > 0 && checkboxes.length === Object.keys(serviciosDataGlobal).length) {
    precioFinal = parseFloat((total * 0.9).toFixed(2));
    descuentoTexto = ' <span style="color: green;">📉 -10% aplicado</span>';
    aplicarDescuentoGlobal = true; // Se aplica el descuento global
  } else {
    aplicarDescuentoGlobal = false; // No se aplica el descuento global
  }

  localStorage.setItem('descuentoGlobalAplicado', JSON.stringify(aplicarDescuentoGlobal)); // Guardar el estado del descuento
  totalPrecioElement.innerHTML = precioFinal.toFixed(2) + descuentoTexto;
}

// Función para actualizar la cantidad del carrito en la navbar
function actualizarCantidadNavbar() {
  if (carritoCantidadNavbar) {
    carritoCantidadNavbar.textContent = carritoGuardado.length;
  }
}

// Función para actualizar el texto del botón de descuento
// Cambia el texto del botón de descuento dependiendo de si todos los servicios están seleccionados o no
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
  localStorage.setItem('serviciosDataGlobal', JSON.stringify(serviciosDataGlobal)); // Guardar los datos de los servicios
  const serviciosData = serviciosDataGlobal;
  total = 0; // Reiniciar el total al cargar los servicios                                   // Reiniciar el total al cargar los servicios

  if (serviciosData) {
    Object.keys(serviciosData).forEach(servicioId => { // Recorre cada servicio en los datos de Firebase, Objet.keys() devuelve un array con las claves del objeto
                                                       // y forEach() ejecuta una función para cada elemento del array, serviceId es la clave del servicio (en este caso, el ID del servicio). 

      const servicio = serviciosData[servicioId]; // Obtener el servicio correspondiente a la clave actual
      if (!servicio) return;                      // Si el servicio no existe, salir de la función, esto es para evitar errores si el servicio no tiene datos  

      // Crear un elemento de lista para cada servicio
      const listItem = document.createElement('li');
      listItem.classList.add('list-group-item');

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = servicioId;
      checkbox.classList.add('form-check-input', 'me-2');
      checkbox.id = `servicio-${servicioId}`;
      checkbox.dataset.precio = servicio.precio; // Almacenar el precio en el dataset, dataset permite almacenar datos personalizados en un elemento HTML
      
      // Verificar si el servicio ya está en el carrito guardado y marcar el checkbox si es así
      // Esto es para que cuando el usuario vuelva a la página, los checkboxes se mantengan marcados si el servicio ya está en el carrito
      const estaEnCarrito = carritoGuardado.some(item => item?.nombre === servicio.nombre);
      if (estaEnCarrito) {
        checkbox.checked = true;    // Marcar el checkbox si el servicio ya está en el carrito
        total += servicio.precio;   // Sumar el precio al total si el servicio ya está en el carrito
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
  const checkboxes = listaServicios.querySelectorAll('input[type="checkbox"]'); // Obtener todos los checkboxes
  const todosSeleccionadosAhora = Array.from(checkboxes).every(cb => cb.checked);// Verificar si todos están seleccionados

  total = 0;
  carritoGuardado = []; // Reiniciar el carrito guardado
  aplicarDescuentoGlobal = false; // Reiniciar el estado del descuento al interactuar con el botón

  if (!todosSeleccionadosAhora) {
    Object.values(serviciosDataGlobal).forEach(servicio => {
      total += servicio.precio;
      carritoGuardado.push(servicio);
    });
    checkboxes.forEach(checkbox => {
      checkbox.checked = true;
    });
    aplicarDescuentoGlobal = true; // Se aplica el descuento global
  } else {
    checkboxes.forEach(checkbox => {
      checkbox.checked = false;
    });
    total = 0;
    carritoGuardado = [];
    aplicarDescuentoGlobal = false; // No se aplica el descuento global
  }

  localStorage.setItem('carrito', JSON.stringify(carritoGuardado));
  localStorage.setItem('descuentoGlobalAplicado', JSON.stringify(aplicarDescuentoGlobal)); // Guardar el estado del descuento
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