import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import e from 'cors';
import sqlite3 from 'sqlite3';
sqlite3.verbose();

// Abrir (o crear) la base de datos
const db = new sqlite3.Database('./db/mi_basedatos.sqlite', (err) => {
  if (err) {
    console.error('❌ Error al conectar:', err.message);
  } else {
    console.log('✅ Conexión exitosa a SQLite');
  }
});

// ========== 1. Crear tabla products ==========
db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    precio REAL,
    categoria TEXT,
    descripcion TEXT,
    imagen TEXT
  )`);
  
  
  // ========== 2. Crear tabla users ==========
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    apellido TEXT,
    email TEXT,
    contraseña TEXT
  )`);
  
  
  // ========== 3. Crear tabla sales ==========
  db.run(`CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER,
    fecha TEXT,
    total REAL,
    direccion TEXT
  )`);
  

  
  
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: 'http://127.0.0.1:5500', // Permitir solo este dominio
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'] // Headers permitidos
}));


// Obtener todos los usuarios
app.get('/api/usuarios', async (req, res) => {
    try {
        db.all('SELECT * FROM users', (err, rows) => {
            if (err) throw err;
            res.send(rows);
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send({ error: 'Error fetching users' });
    }
});

// Obtener un usuario por ID
app.get('/api/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    try {
        db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
            if (err) throw err;
            if (!row) return res.status(404).send({ error: 'Usuario not found' });
            res.send(row);
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).send({ error: 'Error fetching user' });
    }
});

// Crear un nuevo usuario
app.post('/api/usuarios', async (req, res) => {
    const { nombre, apellido, email, contraseña } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(contraseña, 10);
        db.run(
            'INSERT INTO users (nombre, apellido, email, contraseña) VALUES (?, ?, ?, ?)',
            [nombre, apellido, email, hashedPassword],
            function (err) {
                if (err) throw err;
                res.status(201).send({ id: this.lastID, nombre, apellido, email });
            }
        );
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send({ error: 'Error creating user' });
    }
});

// Actualizar un usuario por ID
app.put('/api/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, email, contraseña } = req.body;

    try {
        const hashedPassword = contraseña ? await bcrypt.hash(contraseña, 10) : null;
        db.run(
            `UPDATE users SET 
                nombre = COALESCE(?, nombre), 
                apellido = COALESCE(?, apellido), 
                email = COALESCE(?, email), 
                contraseña = COALESCE(?, contraseña) 
            WHERE id = ?`,
            [nombre, apellido, email, hashedPassword, id],
            function (err) {
                if (err) throw err;
                if (this.changes === 0) return res.status(404).send({ error: 'Usuario not found' });
                res.send({ id, nombre, apellido, email });
            }
        );
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send({ error: 'Error updating user' });
    }
});

// Obtener todos los productos
app.get('/api/productos', async (req, res) => {
    try {
        db.all('SELECT * FROM products', (err, rows) => {
            if (err) throw err;
            res.send(rows);
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send({ error: 'Error fetching products' });
    }
});

// Crear un nuevo producto
app.post('/api/productos', async (req, res) => {
    const { nombre, precio, categoria, descripcion, imagen } = req.body;
    try {
        db.run(
            'INSERT INTO products (nombre, precio, categoria, descripcion, imagen) VALUES (?, ?, ?, ?, ?)',
            [nombre, precio, categoria, descripcion, imagen],
            function (err) {
                if (err) throw err;
                res.status(201).send({ id: this.lastID, nombre, precio, categoria, descripcion, imagen });
            }
        );
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).send({ error: 'Error creating product' });
    }
});

// Crear una nueva venta
app.post('/api/ventas', async (req, res) => {
    const { id_usuario, total, direccion, productos } = req.body;
    const fecha = new Date().toISOString();

    try {
        db.run(
            'INSERT INTO sales (id_usuario, fecha, total, direccion) VALUES (?, ?, ?, ?)',
            [id_usuario, fecha, total, direccion],
            function (err) {
                if (err) throw err;

                const saleId = this.lastID;
                const saleProducts = productos.map(producto => [saleId, producto.id]);

                db.run(
                    'INSERT INTO sales_products (id_sale, id_producto) VALUES ' +
                    saleProducts.map(() => '(?, ?)').join(', '),
                    saleProducts.flat(),
                    (err) => {
                        if (err) throw err;
                        res.status(201).send({ id: saleId, id_usuario, fecha, total, direccion, productos });
                    }
                );
            }
        );
    } catch (error) {
        console.error('Error creating sale:', error);
        res.status(500).send({ error: 'Error creating sale' });
    }
});

// Eliminar una venta por ID
app.delete('/api/ventas/:id', async (req, res) => {
    const { id } = req.params;

    try {
        db.run('DELETE FROM sales WHERE id = ?', [id], function (err) {
            if (err) throw err;
            if (this.changes === 0) return res.status(404).send({ error: 'Venta not found' });
            res.send({ id });
        });
    } catch (error) {
        console.error('Error deleting sale:', error);
        res.status(500).send({ error: 'Error deleting sale' });
    }
});

// Login de usuario
app.post('/api/login', async (req, res) => {
    const { email, contraseña } = req.body;

    try {
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, usuario) => {
            if (err) throw err;
            if (!usuario) return res.status(404).send({ error: 'Usuario not found' });

            const isPasswordValid = await bcrypt.compare(contraseña, usuario.contraseña);
            if (!isPasswordValid) return res.status(401).send({ error: 'Invalid password' });

            res.send({ id: usuario.id, nombre: usuario.nombre, apellido: usuario.apellido, email: usuario.email });
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send({ error: 'Error logging in' });
    }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});