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

// ===== MENU HAMBURGUESA =====
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector("nav ul");

menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("show");
});

// ===== CONTADOR ANIMADO =====
const counters = document.querySelectorAll(".counter");

const animateCounter = (counter) => {
  const target = +counter.getAttribute("data-target");
  const increment = target / 100;

  let current = 0;

  const update = () => {
    current += increment;
    if (current < target) {
      counter.textContent = Math.ceil(current);
      requestAnimationFrame(update);
    } else {
      counter.textContent = target;
    }
  };
  update();
};

counters.forEach((counter) => {
  animateCounter(counter);
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

