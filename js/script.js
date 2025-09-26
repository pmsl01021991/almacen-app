// Seleccionamos todas las imágenes del slider
const slides = document.querySelectorAll(".slides img");
let currentIndex = 0;
const totalSlides = slides.length;

// Asegurar que solo la primera esté visible
slides.forEach((img, index) => {
  img.classList.remove("active");
});
slides[0].classList.add("active");

// Función para mostrar la siguiente imagen
function showNextSlide() {
  // Ocultar la actual
  slides[currentIndex].classList.remove("active");

  // Avanzar índice
  currentIndex = (currentIndex + 1) % totalSlides;

  // Mostrar la nueva
  slides[currentIndex].classList.add("active");
}

// Cambio automático cada 3 segundos
setInterval(showNextSlide, 3000);

// Botón hamburguesa
const menuToggle = document.getElementById("menu-toggle");
const menu = document.getElementById("menu");

menuToggle.addEventListener("click", () => {
  menu.classList.toggle("show");
});

// ===== DARK MODE TOGGLE =====
const darkToggle = document.getElementById("darkToggle");

// Guardar preferencia en localStorage
if (localStorage.getItem("darkMode") === "enabled") {
  document.body.classList.add("dark-mode");
}

darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {
    localStorage.setItem("darkMode", "enabled");
    darkToggle.textContent = "☀️"; // cambia icono
  } else {
    localStorage.setItem("darkMode", "disabled");
    darkToggle.textContent = "🌙";
  }
});


