// =======================
// DARK MODE MANAGER
// =======================
class DarkModeManager {
  constructor(toggleId) {
    this.darkToggle = document.getElementById(toggleId);
    this.init();
  }

  init() {
    if (localStorage.getItem("darkMode") === "enabled") {
      document.body.classList.add("dark-mode");
      this.darkToggle.textContent = "☀️";
    }

    this.darkToggle.addEventListener("click", () => this.toggleDarkMode());
  }

  toggleDarkMode() {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
      localStorage.setItem("darkMode", "enabled");
      this.darkToggle.textContent = "☀️";
    } else {
      localStorage.setItem("darkMode", "disabled");
      this.darkToggle.textContent = "🌙";
    }
  }
}

// =======================
// CHART MANAGER
// =======================
class ChartManager {
  constructor(ventasId, stockId) {
    this.ventasCtx = document.getElementById(ventasId).getContext("2d");
    this.stockCtx = document.getElementById(stockId).getContext("2d");
    this.renderCharts();
  }

  renderCharts() {
    new Chart(this.ventasCtx, {
      type: "line",
      data: {
        labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago"],
        datasets: [{
          label: "Ventas (S/)",
          data: [2000, 3000, 2500, 4000, 5000, 4500, 6000, 7000],
          borderColor: "#f39c12",
          backgroundColor: "rgba(243, 156, 18, 0.2)",
          fill: true,
          tension: 0.3
        }]
      },
      options: { responsive: true }
    });

    new Chart(this.stockCtx, {
      type: "doughnut",
      data: {
        labels: ["Frutas", "Verduras", "Lácteos", "Embutidos", "Otros"],
        datasets: [{
          label: "Stock",
          data: [120, 90, 80, 60, 40],
          backgroundColor: ["#27ae60", "#2980b9", "#f39c12", "#8e44ad", "#e74c3c"]
        }]
      },
      options: { responsive: true }
    });
  }
}

// =======================
// SIDEBAR MANAGER
// =======================
class SidebarManager {
  constructor(menuId, sidebarClass) {
    this.menuBtn = document.getElementById(menuId);
    this.sidebar = document.querySelector(sidebarClass);
    this.init();
  }

  init() {
    this.menuBtn.addEventListener("click", () => {
      this.sidebar.classList.toggle("active");
      document.body.classList.toggle("sidebar-open");
    });

    // Cerrar sidebar al hacer clic en un enlace
    const links = this.sidebar.querySelectorAll("a");
    links.forEach(link => {
      link.addEventListener("click", () => {
        this.sidebar.classList.remove("active");
        document.body.classList.remove("sidebar-open");
      });
    });
  }
}

// =======================
// DATA MANAGER
// =======================
class DataManager {
  // ====== Cargar Productos ======
  static async cargarProductos() {
    try {
      const res = await fetch("/api/productos");
      const productos = await res.json();

      const tbody = document.getElementById("tabla-productos");
      tbody.innerHTML = "";

      productos.forEach((p) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${p.id}</td>
          <td>${p.nombre}</td>
          <td>${p.stock_actual}</td>
        `;
        tbody.appendChild(row);
      });
    } catch (error) {
      console.error("❌ Error cargando productos:", error);
    }
  }

  // ====== Cargar Movimientos ======
  static async cargarMovimientos() {
      try {
        const res = await fetch("/api/movimientos");
        const movimientos = await res.json();

        const tbody = document.getElementById("tabla-movimientos");
        tbody.innerHTML = "";

        movimientos.forEach((m) => {
          const row = document.createElement("tr");

          // Mostrar botón de ruta solo si es salida y tiene destino
          let rutaHtml = "-";
          if (m.destino && m.destino.trim() !== "") {
            if (m.tipo === "entrada") {
              rutaHtml = `
                <a class="btn-ruta" 
                  href="/privado/recorrido.html?destino=${encodeURIComponent(m.destino)}&tipo=entrada" 
                  target="_blank">
                  ⬅️ Ver regreso
                </a>`;
            } else {
              rutaHtml = `
                <a class="btn-ruta" 
                  href="/privado/recorrido.html?destino=${encodeURIComponent(m.destino)}&tipo=salida" 
                  target="_blank">
                  🚛 Ver recorrido
                </a>`;
            }
          }



          row.innerHTML = `
            <td>${m.id}</td>
            <td>${m.producto}</td>
            <td>${m.tipo === "entrada" ? "⬆️ Entrada" : "⬇️ Salida"}</td>
            <td>${m.cantidad}</td>
            <td>${m.descripcion || "-"}</td>
            <td>${new Date(m.fecha).toLocaleString()}</td>
            <td id="ruta-${m.id}">${rutaHtml}</td>
          `;
          tbody.appendChild(row);
        });

      } catch (error) {
        console.error("❌ Error cargando movimientos:", error);
      }
    }

}


// =======================
// INICIALIZACIÓN
// =======================
document.addEventListener("DOMContentLoaded", () => {
  new DarkModeManager("darkToggle");
  new ChartManager("ventasChart", "stockChart");
  new SidebarManager("menuToggle", ".sidebar");

  DataManager.cargarProductos();
  DataManager.cargarMovimientos();
  setInterval(() => DataManager.cargarMovimientos(), 30000); // refrescar cada 30s
});
