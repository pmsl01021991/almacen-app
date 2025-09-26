import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import dotenv from "dotenv";
import fetch from "node-fetch";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors"; // 👈 agregado
import db from "./db.js";   // 👈 conexión a BD
import "./jobs/simulacion.js"; // 👈 cron jobs

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =========================
// CONFIGURAR CORS
// =========================
app.use(cors({
  origin: [
    "http://localhost:3000",              // desarrollo
    "https://almacen-app.vercel.app"      // producción en Vercel
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// =========================
// SESIONES
// =========================
app.set("trust proxy", 1); // necesario en Render

app.use(session({
  secret: process.env.SESSION_SECRET || "clave-super-secreta",
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === "production", // true en Render (https)
    httpOnly: true,
    sameSite: "none" // ⚡ necesario para compartir cookies entre dominios
  }
}));

// Servir archivos frontend
app.use(express.static(path.join(__dirname, ".."))); 

// =========================
// VALIDACIÓN reCAPTCHA
// =========================
app.post("/verify-recaptcha", async (req, res) => {
  const token = req.body["g-recaptcha-response"];
  const secretKey = process.env.RECAPTCHA_SECRET;

  if (!token) {
    return res.status(400).json({ success: false, message: "Token faltante" });
  }

  try {
    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`,
      { method: "POST" }
    );

    const data = await response.json();

    if (data.success) {
      res.json({ success: true, message: "reCAPTCHA válido ✅" });
    } else {
      res.status(400).json({ success: false, message: "reCAPTCHA inválido ❌", errors: data["error-codes"] });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al verificar reCAPTCHA", error });
  }
});

// =========================
// LOGIN + 2FA
// =========================

// Usuarios válidos (simulación)
const USERS = {
  [process.env.ADMIN_EMAIL]: process.env.ADMIN_PASS
};

// Configuración de nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,  // tu correo
    pass: process.env.EMAIL_PASS   // clave de aplicación
  }
});

// Ruta login (correo + clave)
app.post("/login", async (req, res) => {
  const { usuario, clave, "g-recaptcha-response": token } = req.body;

  console.log("📝 Datos recibidos en /login:");
  console.log("Usuario:", usuario);
  console.log("Clave:", clave);
  console.log("Token reCAPTCHA:", token);

  // 1. Verificar reCAPTCHA antes de cualquier cosa
  const recaptchaRes = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${token}`,
    { method: "POST" }
  );
  const recaptchaData = await recaptchaRes.json();

  console.log("🔎 Respuesta de Google:", recaptchaData);

  if (!recaptchaData.success) {
    return res.send("<h2>❌ reCAPTCHA inválido</h2><a href='/login.html'>Volver</a>");
  }

  // 2. Validar usuario
  if (USERS[usuario] && USERS[usuario] === clave) {
    console.log("✅ Usuario y contraseña correctos");

    // Generar código aleatorio
    const codigo = Math.floor(100000 + Math.random() * 900000);
    req.session.codigo2FA = codigo;
    req.session.userTemp = usuario;

    console.log("🔑 Código 2FA generado:", codigo);

    // Enviar email con el código
    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: usuario,
      subject: "Código de verificación - Almacén",
      text: `Tu código de verificación es: ${codigo}`
    }, (err, info) => {
      if (err) {
        console.error("❌ Error enviando correo:", err);
        return res.send("<h2>Error enviando el correo. Revisa tu configuración de Gmail</h2><a href='/login.html'>Volver</a>");
      }
      console.log("📧 Correo enviado con éxito:", info.response);
      res.redirect("/verificar.html");
    });
  } else {
    console.log("❌ Usuario o contraseña incorrectos");
    res.redirect("/index.html");
  }
});

// =========================
// API de Productos y Movimientos
// =========================

// Productos
app.get("/api/productos", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM productos");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

// Movimientos
app.get("/api/movimientos", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.id, p.nombre AS producto, m.tipo, m.cantidad, 
             m.descripcion, m.fecha, m.destino
      FROM movimientos m
      JOIN productos p ON m.producto_id = p.id
      ORDER BY m.fecha DESC
      LIMIT 20
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener movimientos" });
  }
});

// =========================
// VERIFICACIÓN 2FA
// =========================
app.post("/verificar", (req, res) => {
  const { codigo } = req.body;

  if (parseInt(codigo) === req.session.codigo2FA) {
    req.session.user = req.session.userTemp;
    delete req.session.codigo2FA;
    delete req.session.userTemp;
    res.redirect("/admin");
  } else {
    res.send("<h2>❌ Código incorrecto</h2><a href='/verificar.html'>Volver</a>");
  }
});

// =========================
// RUTA PARA ADMIN DASHBOARD
// =========================
app.get("/admin", (req, res) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname, "..", "privado", "admin.html"));
  } else {
    res.redirect("/login.html");
  }
});

// =========================
// INICIAR SERVIDOR
// =========================
app.listen(process.env.PORT || 3000, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${process.env.PORT || 3000}`);
});
