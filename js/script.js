let dineroUsuario = 0;
let componente;
let compra;
let accion;
let acumulador = 0;
let contador = 0;
let calculo;

const PRODUCTOS = [
  { id: 1, nombre: "Placa de video", precio: 800000 },
  { id: 2, nombre: "Micro Procesador", precio: 450000 },
  { id: 3, nombre: "Motherboard", precio: 400000 },
];

// Array para almacenar el historial de compras
let historialCompras = [];

let inicio = 1;

function cuenta(a, b) {
  calculo = a - b;
}

//Función para mostrar el historial de compras
function mostrarHistorial() {
  if (historialCompras.length === 0) {
    alert("No hay compras realizadas aún.");
  } else {
    let mensaje = "--- HISTORIAL DE COMPRAS ---\n";
    for (let i = 0; i < historialCompras.length; i++) {
      mensaje += `${i + 1}. ${historialCompras[i].producto} - $${
        historialCompras[i].precio
      }\n`;
    }
    alert(mensaje);
  }
}

while (inicio == 1) {
  alert("A continuaciones seleccione la accion que desea realizar");
  accion = prompt(
    "1. Cargar saldo | 2. Realizar compra | 3. Ver historial | ESC. Salir del programa"
  );

  if (accion == 1) {
    acumulador = contador;
    dineroUsuario = parseFloat(
      prompt("Cuanto dinero quiere ingresar a su cuenta: ")
    );

    while (dineroUsuario < 0 || isNaN(dineroUsuario)) {
      alert("El monto ingresado es incorrecto, vuelva a intentarlo");
      dineroUsuario = parseFloat(
        prompt("Cuanto dinero quiere ingresar a su cuenta: ")
      );
    }
    contador = acumulador + dineroUsuario;
    alert("Saldo actual: $" + parseFloat(contador));
  } else if (accion == 2) {
    //  Usar el array de productos para mostrar opciones
    let mensajeProductos =
      "Ingrese la opción del componente que desea comprar:\n";
    for (let i = 0; i < PRODUCTOS.length; i++) {
      mensajeProductos += `${PRODUCTOS[i].id}. ${PRODUCTOS[i].nombre} - $${PRODUCTOS[i].precio}\n`;
    }

    componente = parseInt(prompt(mensajeProductos));

    while (componente != 1 && componente != 2 && componente != 3) {
      alert("El valor ingresado es incorrecto");
      componente = parseInt(prompt(mensajeProductos));
    }

    // Buscar el producto en el array
    let productoSeleccionado = PRODUCTOS.find((p) => p.id === componente);

    alert(`Ha seleccionado ${productoSeleccionado.nombre}`);
    compra = prompt(
      `El precio es de $${productoSeleccionado.precio}. Si desea continuar con su compra presione 1, para salir presione ESC`
    );

    while (compra != 1 && compra != "ESC" && compra != null) {
      alert("Valor opción incorrecta, vuelva a intentarlo");
      compra = prompt(
        `El precio es de $${productoSeleccionado.precio}. Si desea continuar con su compra presione 1, para salir presione ESC`
      );
    }

    if (compra == 1) {
      cuenta(contador, productoSeleccionado.precio);
      console.log(calculo);

      if (calculo >= 0) {
        contador = calculo;

        // Agregar la compra al historial (array)
        historialCompras.push({
          producto: productoSeleccionado.nombre,
          precio: productoSeleccionado.precio,
          fecha: new Date().toLocaleString(),
        });

        alert(
          `La compra se ha realizado con éxito. Su saldo actual es de: $${calculo}`
        );
      } else {
        alert("No dispone del dinero suficiente para realizar dicha compra");
      }
    } else if (compra == "ESC" || compra == null) {
      alert("Compra cancelada");
    }
  } else if (accion == 3) {
    //Opción para ver historial
    mostrarHistorial();
  } else if (accion == "ESC" || accion == null) {
    inicio = 0;
    alert("Fin del programa");
  }
}
