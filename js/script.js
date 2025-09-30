const PRODUCTOS = [
  { id: 1, nombre: "Placa de video", precio: 800000 },
  { id: 2, nombre: "Micro Procesador", precio: 450000 },
  { id: 3, nombre: "Motherboard", precio: 400000 },
];

class TiendaComponentes {
  constructor() {
    this.saldo = 0;
    this.carrito = [];
    this.historial = [];
    this.elementos = {};

    this.inicializar();
  }

  inicializar() {
    this.obtenerElementosDOM();
    this.cargarDatosStorage();
    this.actualizarUI();
    this.renderizarProductos();
    this.asignarEventos();
  }

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
      toastContainer: document.getElementById("toast-container"),
    };
  }

  cargarDatosStorage() {
    const saldoGuardado = localStorage.getItem("saldo");
    const carritoGuardado = localStorage.getItem("carrito");
    const historialGuardado = localStorage.getItem("historial");

    if (saldoGuardado !== null) {
      this.saldo = parseFloat(saldoGuardado);
    }

    if (carritoGuardado !== null) {
      this.carrito = JSON.parse(carritoGuardado);
    }

    if (historialGuardado !== null) {
      this.historial = JSON.parse(historialGuardado);
    }
  }

  guardarEnStorage() {
    localStorage.setItem("saldo", this.saldo.toString());
    localStorage.setItem("carrito", JSON.stringify(this.carrito));
    localStorage.setItem("historial", JSON.stringify(this.historial));
  }

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

  cargarSaldo() {
    const monto = parseFloat(this.elementos.montoInput.value);

    if (isNaN(monto) || monto <= 0) {
      this.mostrarMensaje(
        "Por favor ingrese un monto válido mayor a 0",
        "error"
      );
      this.mostrarToast(
        "Error",
        "Por favor ingrese un monto válido mayor a 0",
        "error"
      );
      return;
    }

    this.saldo += monto;
    this.guardarEnStorage();
    this.actualizarSaldo();
    this.elementos.montoInput.value = "";
    this.mostrarMensaje(
      `Se han cargado $${monto.toLocaleString("es-AR")} correctamente`,
      "exito"
    );
    this.mostrarToast(
      "Saldo cargado",
      `Se agregaron $${monto.toLocaleString("es-AR")} a tu cuenta`,
      "exito"
    );
  }

  mostrarMensaje(texto, tipo) {
    this.elementos.mensajeSaldo.textContent = texto;
    this.elementos.mensajeSaldo.className = `mensaje ${tipo}`;

    setTimeout(() => {
      this.elementos.mensajeSaldo.textContent = "";
      this.elementos.mensajeSaldo.className = "mensaje";
    }, 3000);
  }

  mostrarToast(titulo, mensaje, tipo = "info") {
    const toast = document.createElement("div");
    toast.className = `toast ${tipo}`;

    const iconos = {
      exito: "✓",
      error: "✕",
      info: "ℹ",
      warning: "⚠",
    };

    toast.innerHTML = `
      <div class="toast-icon">${iconos[tipo] || iconos.info}</div>
      <div class="toast-content">
        <div class="toast-title">${titulo}</div>
        <div class="toast-message">${mensaje}</div>
      </div>
    `;

    this.elementos.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("hiding");
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }

  actualizarSaldo() {
    this.elementos.saldo.textContent = `$${this.saldo.toLocaleString("es-AR")}`;
  }

  renderizarProductos() {
    this.elementos.productosGrid.innerHTML = "";

    PRODUCTOS.forEach((producto) => {
      const card = document.createElement("div");
      card.className = "producto-card";

      card.innerHTML = `
        <h3>${producto.nombre}</h3>
        <p class="producto-precio">$${producto.precio.toLocaleString(
          "es-AR"
        )}</p>
        <button class="btn btn-primary" data-id="${
          producto.id
        }">Agregar al Carrito</button>
      `;

      const boton = card.querySelector("button");
      boton.addEventListener("click", () => this.agregarAlCarrito(producto));

      this.elementos.productosGrid.appendChild(card);
    });
  }

  agregarAlCarrito(producto) {
    this.carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
    });

    this.guardarEnStorage();
    this.renderizarCarrito();
    this.mostrarToast(
      "Producto agregado",
      `${producto.nombre} se agregó al carrito`,
      "exito"
    );
  }

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

  eliminarDelCarrito(index, nombreProducto) {
    this.carrito.splice(index, 1);
    this.guardarEnStorage();
    this.renderizarCarrito();
    this.mostrarToast(
      "Producto eliminado",
      `${nombreProducto} se quitó del carrito`,
      "info"
    );
  }

  actualizarTotalCarrito() {
    const total = this.carrito.reduce((sum, item) => sum + item.precio, 0);
    this.elementos.carritoTotal.textContent = `$${total.toLocaleString(
      "es-AR"
    )}`;
  }

  finalizarCompra() {
    if (this.carrito.length === 0) {
      this.mostrarToast(
        "Carrito vacío",
        "Agrega productos antes de finalizar la compra",
        "warning"
      );
      return;
    }

    const total = this.carrito.reduce((sum, item) => sum + item.precio, 0);

    if (this.saldo < total) {
      this.mostrarToast(
        "Saldo insuficiente",
        `Necesitas $${(total - this.saldo).toLocaleString(
          "es-AR"
        )} más para completar la compra`,
        "error"
      );
      return;
    }

    this.procesarCompra(total);
  }

  procesarCompra(total) {
    this.saldo -= total;

    this.carrito.forEach((item) => {
      this.historial.push({
        producto: item.nombre,
        precio: item.precio,
        fecha: new Date().toLocaleString("es-AR"),
      });
    });

    const cantidadProductos = this.carrito.length;
    this.carrito = [];
    this.guardarEnStorage();
    this.actualizarSaldo();
    this.renderizarCarrito();

    this.mostrarToast(
      "¡Compra exitosa!",
      `Se compraron ${cantidadProductos} producto(s). Saldo restante: $${this.saldo.toLocaleString(
        "es-AR"
      )}`,
      "exito"
    );
  }

  vaciarCarrito() {
    if (this.carrito.length === 0) {
      this.mostrarToast(
        "Carrito vacío",
        "No hay productos para eliminar",
        "info"
      );
      return;
    }

    const cantidad = this.carrito.length;
    this.carrito = [];
    this.guardarEnStorage();
    this.renderizarCarrito();
    this.mostrarToast(
      "Carrito vaciado",
      `Se eliminaron ${cantidad} producto(s) del carrito`,
      "info"
    );
  }

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
        <div class="historial-item-fecha">${compra.fecha}</div>
        <div class="carrito-item-nombre">${index + 1}. ${compra.producto}</div>
        <div class="carrito-item-precio">$${compra.precio.toLocaleString(
          "es-AR"
        )}</div>
      `;

      lista.appendChild(li);
    });

    this.elementos.historialContainer.innerHTML = "";
    this.elementos.historialContainer.appendChild(lista);
  }

  actualizarUI() {
    this.actualizarSaldo();
    this.renderizarCarrito();
  }
}

const tienda = new TiendaComponentes();
