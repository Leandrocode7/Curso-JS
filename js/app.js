import StorageManager from "./storage.js";

class TiendaComponentes {
  constructor() {
    this.saldo = 0;
    this.carrito = [];
    this.historial = [];
    this.productos = [];
    this.elementos = {};
    this.storage = new StorageManager();

    this.inicializar();
  }

  // Inicializa la aplicación cargando datos y configurando eventos
  async inicializar() {
    try {
      this.obtenerElementosDOM();
      this.cargarDatosStorage();
      await this.cargarProductos();
      this.actualizarUI();
      this.asignarEventos();
    } catch (error) {
      this.mostrarNotificacion("Error al inicializar la aplicación", "error");
    }
  }

  // Obtiene referencias a los elementos del DOM y las almacena en this.elementos
  obtenerElementosDOM() {
    this.elementos = {
      saldo: document.getElementById("saldo"),
      montoInput: document.getElementById("montoInput"),
      cargarSaldoBtn: document.getElementById("cargarSaldoBtn"),
      mensajeSaldo: document.getElementById("mensajeSaldo"),
      productosGrid: document.getElementById("productosGrid"),
      carritoContainer: document.getElementById("carritoContainer"),
      carritoTotal: document.getElementById("carritoTotal"),
      vaciarCarritoBtn: document.getElementById("vaciarCarritoBtn"),
      verHistorialBtn: document.getElementById("verHistorialBtn"),
      historialContainer: document.getElementById("historialContainer"),
    };
  }

  // Carga los productos desde un archivo JSON externo
  async cargarProductos() {
    try {
      const response = await fetch("./data/productos.json");

      if (!response.ok) {
        throw new Error("Error al cargar los productos");
      }

      this.productos = await response.json();
      this.renderizarProductos();
    } catch (error) {
      this.elementos.productosGrid.innerHTML = `
        <div class="error-message">
          <p>⚠️ No se pudieron cargar los productos</p>
          <p>Por favor, intenta recargar la página</p>
        </div>
      `;
      this.mostrarNotificacion(
        "Error al cargar productos desde el servidor",
        "error"
      );
    }
  }

  // Recupera datos guardados (saldo, carrito, historial) desde el storage
  cargarDatosStorage() {
    try {
      this.saldo = this.storage.obtenerSaldo();
      this.carrito = this.storage.obtenerCarrito();
      this.historial = this.storage.obtenerHistorial();
    } catch (error) {
      this.mostrarNotificacion("Error al cargar datos guardados", "error");
    }
  }

  // Guarda los datos actuales (saldo, carrito, historial) en el storage
  guardarEnStorage() {
    try {
      this.storage.guardarSaldo(this.saldo);
      this.storage.guardarCarrito(this.carrito);
      this.storage.guardarHistorial(this.historial);
    } catch (error) {
      this.mostrarNotificacion("Error al guardar los datos", "error");
    }
  }

  // Asigna event listeners a los botones y elementos interactivos
  asignarEventos() {
    this.elementos.cargarSaldoBtn.addEventListener("click", () =>
      this.cargarSaldo()
    );

    this.elementos.montoInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.cargarSaldo();
      }
    });

    this.elementos.vaciarCarritoBtn.addEventListener("click", () =>
      this.vaciarCarrito()
    );

    this.elementos.verHistorialBtn.addEventListener("click", () =>
      this.toggleHistorial()
    );
  }

  // Añade dinero al saldo del usuario
  cargarSaldo() {
    const monto = parseFloat(this.elementos.montoInput.value);

    if (isNaN(monto) || monto <= 0) {
      this.mostrarMensaje(
        "Por favor ingrese un monto válido mayor a 0",
        "error"
      );
      this.mostrarNotificacion("Monto inválido", "error");
      return;
    }

    try {
      this.saldo += monto;
      this.guardarEnStorage();
      this.actualizarSaldo();
      this.elementos.montoInput.value = "";

      this.mostrarMensaje(
        `Se han cargado $${monto.toLocaleString("es-AR")} correctamente`,
        "exito"
      );

      this.mostrarNotificacion(
        `Saldo cargado: $${monto.toLocaleString("es-AR")}`,
        "success"
      );
    } catch (error) {
      this.mostrarNotificacion("Error al cargar el saldo", "error");
    }
  }

  // Muestra un mensaje temporal debajo del input de saldo
  mostrarMensaje(texto, tipo) {
    this.elementos.mensajeSaldo.textContent = texto;
    this.elementos.mensajeSaldo.className = `mensaje ${tipo}`;

    setTimeout(() => {
      this.elementos.mensajeSaldo.textContent = "";
      this.elementos.mensajeSaldo.className = "mensaje";
    }, 3000);
  }

  // Muestra una notificación toast en la esquina superior derecha
  mostrarNotificacion(mensaje, tipo = "info") {
    const tiposToastify = {
      success: "#28a745",
      error: "#dc3545",
      info: "#17a2b8",
      warning: "#ffc107",
    };

    Toastify({
      text: mensaje,
      duration: 3000,
      gravity: "top",
      position: "right",
      style: {
        background: tiposToastify[tipo] || tiposToastify.info,
      },
      stopOnFocus: true,
    }).showToast();
  }

  // Actualiza el texto que muestra el saldo actual
  actualizarSaldo() {
    this.elementos.saldo.textContent = `$${this.saldo.toLocaleString("es-AR")}`;
  }

  // Renderiza las tarjetas de productos en el grid
  renderizarProductos() {
    this.elementos.productosGrid.innerHTML = "";

    if (this.productos.length === 0) {
      this.elementos.productosGrid.innerHTML =
        '<p class="carrito-vacio">No hay productos disponibles</p>';
      return;
    }

    this.productos.forEach((producto) => {
      const card = document.createElement("div");
      card.className = "producto-card";

      card.innerHTML = `
        <div class="producto-imagen">
          <img src="${producto.imagen}" alt="${producto.nombre}" loading="lazy">
        </div>
        <div class="producto-content">
          <h3>${producto.nombre}</h3>
          <p class="producto-descripcion">${producto.descripcion}</p>
          <p class="producto-stock">Stock disponible: ${
            producto.stock
          } unidades</p>
          <p class="producto-precio">${producto.precio.toLocaleString(
            "es-AR"
          )}</p>
          <button class="btn btn-primary" data-id="${producto.id}">
            Agregar al Carrito
          </button>
        </div>
      `;

      const boton = card.querySelector("button");
      boton.addEventListener("click", () => this.agregarAlCarrito(producto));

      this.elementos.productosGrid.appendChild(card);
    });
  }

  // Añade un producto al carrito verificando el stock disponible
  agregarAlCarrito(producto) {
    try {
      const cantidadEnCarrito = this.carrito.filter(
        (item) => item.id === producto.id
      ).length;

      if (cantidadEnCarrito >= producto.stock) {
        this.mostrarNotificacion(
          `No hay más stock disponible de ${producto.nombre}`,
          "warning"
        );
        return;
      }

      this.carrito.push({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        categoria: producto.categoria,
      });

      this.guardarEnStorage();
      this.renderizarCarrito();

      this.mostrarNotificacion(
        `${producto.nombre} agregado al carrito`,
        "success"
      );
    } catch (error) {
      this.mostrarNotificacion("Error al agregar producto al carrito", "error");
    }
  }

  // Renderiza la lista de productos en el carrito
  renderizarCarrito() {
    if (this.carrito.length === 0) {
      this.elementos.carritoContainer.innerHTML =
        '<p class="carrito-vacio">El carrito está vacío</p>';
      this.elementos.carritoTotal.textContent = "$0";
      return;
    }

    const lista = document.createElement("ul");
    lista.className = "carrito-lista";

    this.carrito.forEach((item, index) => {
      const li = document.createElement("li");
      li.className = "carrito-item";

      li.innerHTML = `
        <div class="carrito-item-info">
          <div class="carrito-item-nombre">${item.nombre}</div>
          <div class="carrito-item-categoria">${item.categoria}</div>
          <div class="carrito-item-precio">$${item.precio.toLocaleString(
            "es-AR"
          )}</div>
        </div>
        <button class="btn btn-danger" data-index="${index}">Eliminar</button>
      `;

      const botonEliminar = li.querySelector("button");
      botonEliminar.addEventListener("click", () =>
        this.eliminarDelCarrito(index, item.nombre)
      );

      lista.appendChild(li);
    });

    this.elementos.carritoContainer.innerHTML = "";
    this.elementos.carritoContainer.appendChild(lista);

    const botonComprar = document.createElement("button");
    botonComprar.className = "btn btn-primary";
    botonComprar.textContent = "Finalizar Compra";
    botonComprar.style.marginTop = "15px";
    botonComprar.addEventListener("click", () => this.finalizarCompra());
    this.elementos.carritoContainer.appendChild(botonComprar);

    this.actualizarTotalCarrito();
  }

  // Elimina un producto específico del carrito por su índice
  eliminarDelCarrito(index, nombreProducto) {
    try {
      this.carrito.splice(index, 1);
      this.guardarEnStorage();
      this.renderizarCarrito();

      this.mostrarNotificacion(
        `${nombreProducto} eliminado del carrito`,
        "info"
      );
    } catch (error) {
      this.mostrarNotificacion("Error al eliminar producto", "error");
    }
  }

  // Calcula y actualiza el total del carrito
  actualizarTotalCarrito() {
    const total = this.carrito.reduce((sum, item) => sum + item.precio, 0);
    this.elementos.carritoTotal.textContent = `$${total.toLocaleString(
      "es-AR"
    )}`;
  }

  // Verifica que hay saldo suficiente antes de finalizar la compra
  finalizarCompra() {
    if (this.carrito.length === 0) {
      this.mostrarNotificacion("El carrito está vacío", "warning");
      return;
    }

    const total = this.carrito.reduce((sum, item) => sum + item.precio, 0);

    if (this.saldo < total) {
      const faltante = total - this.saldo;
      this.mostrarNotificacion(
        `Saldo insuficiente. Necesitas $${faltante.toLocaleString(
          "es-AR"
        )} más`,
        "error"
      );
      return;
    }

    this.procesarCompra(total);
  }

  // Procesa la compra: descuenta saldo, vacía carrito y guarda en historial
  procesarCompra(total) {
    try {
      this.saldo -= total;

      const fechaCompra = new Date().toLocaleString("es-AR");

      this.carrito.forEach((item) => {
        this.historial.push({
          producto: item.nombre,
          precio: item.precio,
          categoria: item.categoria,
          fecha: fechaCompra,
        });
      });

      const cantidadProductos = this.carrito.length;
      this.carrito = [];
      this.guardarEnStorage();
      this.actualizarSaldo();
      this.renderizarCarrito();

      this.mostrarNotificacion(
        `¡Compra exitosa! ${cantidadProductos} producto(s) comprado(s). Saldo restante: $${this.saldo.toLocaleString(
          "es-AR"
        )}`,
        "success"
      );
    } catch (error) {
      this.mostrarNotificacion("Error al procesar la compra", "error");
    }
  }

  // Elimina todos los productos del carrito
  vaciarCarrito() {
    if (this.carrito.length === 0) {
      this.mostrarNotificacion("El carrito ya está vacío", "info");
      return;
    }

    try {
      const cantidad = this.carrito.length;
      this.carrito = [];
      this.guardarEnStorage();
      this.renderizarCarrito();

      this.mostrarNotificacion(
        `Carrito vaciado: ${cantidad} producto(s) eliminado(s)`,
        "info"
      );
    } catch (error) {
      this.mostrarNotificacion("Error al vaciar el carrito", "error");
    }
  }

  // Alterna la visibilidad del historial de compras
  toggleHistorial() {
    const estaVisible =
      this.elementos.historialContainer.classList.contains("visible");

    if (estaVisible) {
      this.elementos.historialContainer.classList.remove("visible");
      this.elementos.verHistorialBtn.textContent = "Ver Historial";
    } else {
      this.renderizarHistorial();
      this.elementos.historialContainer.classList.add("visible");
      this.elementos.verHistorialBtn.textContent = "Ocultar Historial";
    }
  }

  // Renderiza la lista de compras realizadas previamente
  renderizarHistorial() {
    if (this.historial.length === 0) {
      this.elementos.historialContainer.innerHTML =
        '<p class="historial-vacio">No hay compras realizadas aún</p>';
      return;
    }

    const lista = document.createElement("ul");
    lista.className = "historial-lista";

    this.historial.forEach((compra, index) => {
      const li = document.createElement("li");
      li.className = "historial-item";

      li.innerHTML = `
        <div class="historial-item-fecha">📅 ${compra.fecha}</div>
        <div class="carrito-item-nombre">${index + 1}. ${compra.producto}</div>
        <div class="carrito-item-categoria">Categoría: ${compra.categoria}</div>
        <div class="carrito-item-precio">$${compra.precio.toLocaleString(
          "es-AR"
        )}</div>
      `;

      lista.appendChild(li);
    });

    this.elementos.historialContainer.innerHTML = "";
    this.elementos.historialContainer.appendChild(lista);
  }

  // Actualiza todos los elementos de la interfaz (saldo y carrito)
  actualizarUI() {
    this.actualizarSaldo();
    this.renderizarCarrito();
  }
}

// Inicializa la aplicación creando una instancia de la tienda
const tienda = new TiendaComponentes();
