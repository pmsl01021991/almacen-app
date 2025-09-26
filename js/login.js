document.getElementById("LoginForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const recaptchaResponse = grecaptcha.getResponse();
  if (!recaptchaResponse) {
    alert("Por favor completa el reCAPTCHA");
    return;
  }

  const usuario = document.getElementById("usuario").value;
  const password = document.getElementById("password").value;

  const response = await fetch("http://localhost:3001/verify-recaptcha", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
