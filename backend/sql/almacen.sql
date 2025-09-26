CREATE DATABASE almacen;

USE almacen;

-- Tabla de productos
CREATE TABLE productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  stock_actual INT DEFAULT 0
);

-- Tabla de movimientos
CREATE TABLE movimientos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT,
  tipo ENUM('entrada','salida'),
  cantidad INT,
  descripcion VARCHAR(255),
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- Insertamos algunos productos iniciales
INSERT INTO productos (nombre, stock_actual) VALUES
('Manzana', 150),
('Yogurt', 80),
('Arroz', 200);

ALTER TABLE movimientos ADD COLUMN destino VARCHAR(100) AFTER descripcion;

select * from movimientos


DELETE FROM movimientos WHERE destino IS NULL;

ALTER TABLE movimientos
ADD COLUMN destino VARCHAR(100) AFTER descripcion;

SELECT id, tipo, destino FROM movimientos WHERE tipo = 'salida';

SELECT id, tipo, destino FROM movimientos WHERE tipo='salida' AND (destino IS NULL OR destino='');





