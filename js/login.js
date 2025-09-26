import { API_URL } from "./config.js"; // 👈 importar config.js

document.getElementById("LoginForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const recaptchaResponse = grecaptcha.getResponse();
  if (!recaptchaResponse) {
    alert("Por favor completa el reCAPTCHA");
    return;
  }

  const usuario = document.getElementById("usuario").value;
  const password = document.getElementById("password").value;

  const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // 👈 necesario para sesiones
    body: JSON.stringify({
      usuario,
      password,
      "g-recaptcha-response": recaptchaResponse
    })
  });

  const data = await response.json();

  if (data.success) {
    alert("Login exitoso ✅");
    // aquí podrías redirigir al usuario o seguir validando en tu backend
  } else {
    alert("Fallo en reCAPTCHA ❌");
  }
});
