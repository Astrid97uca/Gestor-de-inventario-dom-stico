"use strict";

// Datos propios: materiales utilizados en decoraciones de Kéfi Studio.
let inventario = [
    { id: 1, nombre: "Mampara infinita blanca", categoria: "Estructuras", cantidad: 2, precio: 85, agotado: false },
    { id: 2, nombre: "Mampara cuadrada", categoria: "Estructuras", cantidad: 3, precio: 65, agotado: false },
    { id: 3, nombre: "Caballete de madera", categoria: "Estructuras", cantidad: 4, precio: 22, agotado: false },
    { id: 4, nombre: "Florero de vidrio", categoria: "Decoración", cantidad: 12, precio: 4.5, agotado: false },
    { id: 5, nombre: "Alfombra blanca", categoria: "Decoración", cantidad: 2, precio: 18, agotado: false },
    { id: 6, nombre: "Ramo de rosas artificiales", categoria: "Decoración", cantidad: 6, precio: 9, agotado: false },
    { id: 7, nombre: "Paquete de globos salvia", categoria: "Globos", cantidad: 5, precio: 7.5, agotado: false },
    { id: 8, nombre: "Paquete de globos champagne", categoria: "Globos", cantidad: 0, precio: 8, agotado: true }
];

// Se utilizan distintos métodos para seleccionar elementos de la página.
const formulario = document.getElementById("formulario-producto");
const cuerpoInventario = document.querySelector("#cuerpo-inventario");
const filtroCategoria = document.getElementById("filtro-categoria");
const mensajeError = document.querySelector("#mensaje-error");
const mensajeVacio = document.getElementById("mensaje-vacio");
const camposFormulario = formulario.getElementsByTagName("input");

function crearGeneradorId() {
    let contador = 100;
    return function () {
        contador++;
        return contador;
    };
}
const generarId = crearGeneradorId();
// Se genera el primer id al iniciar y se reserva hasta la primera alta válida.
let siguienteId = generarId();

function calcularValorTotal(items) {
    let total = 0;
    for (let indice = 0; indice < items.length; indice++) {
        total += items[indice].cantidad * items[indice].precio;
    }
    return total;
}

function contarUnidades(items) {
    let unidades = 0;
    for (let indice = 0; indice < items.length; indice++) {
        unidades += items[indice].cantidad;
    }
    return unidades;
}

function contarPorCategoria(items) {
    const conteo = Object.create(null);
    for (let indice = 0; indice < items.length; indice++) {
        const categoria = items[indice].categoria;
        if (conteo[categoria] === undefined) {
            conteo[categoria] = 0;
        }
        conteo[categoria]++;
    }
    return conteo;
}

function formatearDinero(valor) {
    return "$" + valor.toFixed(2);
}

function crearCelda(texto) {
    const celda = document.createElement("td");
    celda.textContent = texto;
    return celda;
}

function crearBoton(texto, clase, id) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.textContent = texto;
    boton.className = clase;
    boton.setAttribute("data-id", id);
    return boton;
}

function crearFila(item) {
    const fila = document.createElement("tr");
    fila.classList.toggle("agotado", item.agotado);
    fila.appendChild(crearCelda(item.nombre));
    fila.appendChild(crearCelda(item.categoria));
    fila.appendChild(crearCelda(item.cantidad));
    fila.appendChild(crearCelda(formatearDinero(item.precio)));
    fila.appendChild(crearCelda(formatearDinero(item.cantidad * item.precio)));
    const celdaEstado = crearCelda("");
    const etiqueta = document.createElement("span");
    etiqueta.textContent = item.agotado ? "Agotado" : "Disponible";
    etiqueta.className = "estado";
    celdaEstado.appendChild(etiqueta);
    fila.appendChild(celdaEstado);
    const acciones = crearCelda("");
    acciones.className = "acciones";
    acciones.appendChild(crearBoton(item.agotado ? "Marcar disponible" : "Marcar agotado", "btn-estado", item.id));
    acciones.appendChild(crearBoton("Eliminar", "btn-eliminar", item.id));
    fila.appendChild(acciones);
    return fila;
}

function renderizar(items) {
    cuerpoInventario.textContent = "";
    let agotados = 0;
    for (let indice = 0; indice < items.length; indice++) {
        cuerpoInventario.appendChild(crearFila(items[indice]));
        if (items[indice].agotado) {
            agotados++;
        }
    }
    // Los cuatro indicadores se calculan sobre los datos visibles tras el filtro.
    document.getElementById("total-productos").textContent = items.length;
    document.getElementById("total-unidades").textContent = contarUnidades(items);
    document.getElementById("valor-total").textContent = formatearDinero(calcularValorTotal(items));
    document.getElementById("total-agotados").textContent = agotados;
    mensajeVacio.hidden = items.length !== 0;
}

function filtrarPorCategoria(categoria) {
    const resultados = [];
    for (let indice = 0; indice < inventario.length; indice++) {
        if (categoria === "todas" || inventario[indice].categoria === categoria) {
            resultados.push(inventario[indice]);
        }
    }
    return resultados;
}

function validarProducto(datos) {
    if (typeof datos.nombre !== "string" || datos.nombre.trim() === "") {
        throw new Error("Escribe el nombre del producto.");
    }
    if (typeof datos.categoria !== "string" || datos.categoria.trim() === "") {
        throw new Error("Escribe la categoría del producto.");
    }
    if (datos.categoria.trim().toLowerCase() === "todas") {
        throw new Error("Usa otra categoría: 'todas' está reservada para el filtro.");
    }
    if (!Number.isInteger(datos.cantidad) || datos.cantidad <= 0) {
        throw new Error("La cantidad debe ser un número entero mayor que cero.");
    }
    if (!Number.isFinite(datos.precio) || datos.precio < 0) {
        throw new Error("El precio debe ser un número mayor o igual que cero.");
    }
}

function agregarProducto(event) {
    event.preventDefault();
    mensajeError.hidden = true;
    try {
        const datos = {
            nombre: camposFormulario[0].value.trim(),
            categoria: camposFormulario[1].value.trim(),
            cantidad: camposFormulario[2].value.trim() === "" ? NaN : Number(camposFormulario[2].value),
            precio: camposFormulario[3].value.trim() === "" ? NaN : Number(camposFormulario[3].value)
        };
        validarProducto(datos);
        const producto = {
            id: siguienteId,
            nombre: datos.nombre,
            categoria: datos.categoria,
            cantidad: datos.cantidad,
            precio: datos.precio,
            agotado: false
        };
        inventario.push(producto);
        siguienteId = generarId();
        actualizarCategorias();
        actualizarVista();
        formulario.reset();
        camposFormulario[0].focus();
        console.log("Alta de producto:", producto);
    } catch (error) {
        mensajeError.textContent = error.message;
        mensajeError.hidden = false;
        console.error(error.message);
    }
}

function eliminarProducto(id) {
    const restantes = [];
    for (let indice = 0; indice < inventario.length; indice++) {
        if (inventario[indice].id !== id) {
            restantes.push(inventario[indice]);
        }
    }
    return restantes;
}

function cambiarEstado(id) {
    for (let indice = 0; indice < inventario.length; indice++) {
        if (inventario[indice].id === id) {
            inventario[indice].agotado = !inventario[indice].agotado;
            console.log("Cambio de estado:", inventario[indice]);
            break;
        }
    }
}

function actualizarCategorias() {
    const seleccionAnterior = filtroCategoria.value;
    const categorias = contarPorCategoria(inventario);
    filtroCategoria.textContent = "";
    const opcionTodas = document.createElement("option");
    opcionTodas.value = "todas";
    opcionTodas.textContent = "Todas las categorías";
    filtroCategoria.appendChild(opcionTodas);
    for (const categoria in categorias) {
        const opcion = document.createElement("option");
        opcion.value = categoria;
        opcion.textContent = categoria;
        filtroCategoria.appendChild(opcion);
    }
    // Si se elimina el último producto de una categoría seleccionada, se conserva
    // su opción para mostrar el estado vacío. Desaparece al cambiar de filtro.
    if (seleccionAnterior !== "todas" && categorias[seleccionAnterior] === undefined) {
        const opcionVacia = document.createElement("option");
        opcionVacia.value = seleccionAnterior;
        opcionVacia.textContent = seleccionAnterior;
        filtroCategoria.appendChild(opcionVacia);
    }
    filtroCategoria.value = seleccionAnterior;
}

function actualizarVista() {
    renderizar(filtrarPorCategoria(filtroCategoria.value));
}

renderizar(inventario);
actualizarCategorias();
formulario.addEventListener("submit", agregarProducto);

// Un único escuchador en el tbody atiende todos los botones, incluso los nuevos.
cuerpoInventario.addEventListener("click", function (event) {
    const boton = event.target.closest("button");
    if (!boton || !cuerpoInventario.contains(boton)) {
        return;
    }
    const id = Number(boton.getAttribute("data-id"));
    if (boton.classList.contains("btn-eliminar")) {
        inventario = eliminarProducto(id);
        console.log("Baja de producto. Id:", id);
        actualizarCategorias();
        actualizarVista();
    } else if (boton.classList.contains("btn-estado")) {
        cambiarEstado(id);
        actualizarVista();
    }
});
filtroCategoria.addEventListener("change", function () {
    actualizarCategorias();
    actualizarVista();
});
console.table(inventario);
console.table(contarPorCategoria(inventario));
