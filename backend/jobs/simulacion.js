import db from "../db.js";
import cron from "node-cron";

// 🔹 Posibles destinos (lo pegas aquí, al inicio)
const DESTINOS = [
  "Lince (Lima)",
  "Miraflores (Lima)",
  "San Juan de Lurigancho (Lima)",
  "Comas (Lima)",
  "Callao (Lima)",
  "Arequipa",
  "Cusco",
  "Trujillo",
  "Chiclayo",
  "Piura"
];

// 🔹 Cron job cada minuto (ejemplo)
cron.schedule("* * * * *", async () => {
  try {
    // Obtenemos un producto aleatorio
    const [productos] = await db.query("SELECT * FROM productos");
    if (productos.length === 0) return;

    const producto = productos[Math.floor(Math.random() * productos.length)];

    // Entrada o salida aleatoria
    const tipo = Math.random() > 0.5 ? "entrada" : "salida";
    const cantidad = Math.floor(Math.random() * 20) + 1;

    
    // Escoger un destino aleatorio
    const destino = DESTINOS[Math.floor(Math.random() * DESTINOS.length)];

    let descripcion;
    if (tipo === "entrada") {
      descripcion = `Camión entrada desde ${destino} hacia Almacén (Villa El Salvador)`;
    } else {
      descripcion = `Camión salida hacia ${destino}`;
    }


    // Insertar movimiento con destino
    await db.query(
        "INSERT INTO movimientos (producto_id, tipo, cantidad, descripcion, destino) VALUES (?, ?, ?, ?, ?)",
        [producto.id, tipo, cantidad, descripcion, destino]
        );


    // Actualizar stock si es salida o entrada
    const nuevoStock =
      tipo === "entrada"
        ? producto.stock_actual + cantidad
        : Math.max(0, producto.stock_actual - cantidad);

    await db.query("UPDATE productos SET stock_actual = ? WHERE id = ?", [
      nuevoStock,
      producto.id,
    ]);

    console.log(
      `🚚 Movimiento registrado: ${tipo} de ${cantidad} en ${producto.nombre} (${destino})`
    );
  } catch (err) {
    console.error("❌ Error en simulación:", err);
  }
});
