import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

let dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "almacen",
};

// 👇 Si existe el archivo SSL (ca.pem) lo añadimos a la config
if (process.env.DB_SSL_CA && fs.existsSync(process.env.DB_SSL_CA)) {
  dbConfig.ssl = {
    ca: fs.readFileSync(process.env.DB_SSL_CA)
  };
}

const db = mysql.createPool(dbConfig);

export default db;
