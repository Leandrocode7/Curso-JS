// Clase para gestionar el almacenamiento local de datos
class StorageManager {
  constructor() {
    // Definir las claves para localStorage
    this.keys = {
      SALDO: "tienda_saldo",
      CARRITO: "tienda_carrito",
      HISTORIAL: "tienda_historial",
    };
  }

  // Guardar el saldo del usuario en localStorage
  guardarSaldo(saldo) {
    try {
      localStorage.setItem(this.keys.SALDO, JSON.stringify(saldo));
      return true;
    } catch (error) {
      throw new Error("Error al guardar el saldo");
    }
  }

  // Obtener el saldo guardado del usuario
  obtenerSaldo() {
    try {
      const saldo = localStorage.getItem(this.keys.SALDO);
      return saldo !== null ? JSON.parse(saldo) : 0;
    } catch (error) {
      return 0;
    }
  }

  // Guardar el carrito de compras en localStorage
  guardarCarrito(carrito) {
    try {
      localStorage.setItem(this.keys.CARRITO, JSON.stringify(carrito));
      return true;
    } catch (error) {
      throw new Error("Error al guardar el carrito");
    }
  }

  // Obtener el carrito guardado
  obtenerCarrito() {
    try {
      const carrito = localStorage.getItem(this.keys.CARRITO);
      return carrito !== null ? JSON.parse(carrito) : [];
    } catch (error) {
      return [];
    }
  }

  // Guardar el historial de compras en localStorage
  guardarHistorial(historial) {
    try {
      localStorage.setItem(this.keys.HISTORIAL, JSON.stringify(historial));
      return true;
    } catch (error) {
      throw new Error("Error al guardar el historial");
    }
  }

  // Obtener el historial de compras guardado
  obtenerHistorial() {
    try {
      const historial = localStorage.getItem(this.keys.HISTORIAL);
      return historial !== null ? JSON.parse(historial) : [];
    } catch (error) {
      return [];
    }
  }

  // Limpiar todos los datos guardados en localStorage
  limpiarTodo() {
    try {
      localStorage.removeItem(this.keys.SALDO);
      localStorage.removeItem(this.keys.CARRITO);
      localStorage.removeItem(this.keys.HISTORIAL);
      return true;
    } catch (error) {
      throw new Error("Error al limpiar los datos");
    }
  }
}

export default StorageManager;
