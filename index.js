import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/usuarios', async (req, res) => {
    try {
        const filePath = path.join(__dirname, 'jsons', 'usuarios.json');
        const data = await fs.readFile(filePath, 'utf-8');
        const usuarios = JSON.parse(data);
    
        res.send(usuarios);
      } catch (error) {
        console.error('Error reading usuarios.json:', error);
        res.status(500).send({ error: 'Error reading usuarios.json' });
      }
});

app.get('/api/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const filePath = path.join(__dirname, 'jsons', 'usuarios.json');
        const data = await fs.readFile(filePath, 'utf-8');
        const usuarios = JSON.parse(data);
        
        const usuario = usuarios.find(u => u.id === parseInt(id));
        if (!usuario) {
            return res.status(404).send({ error: 'Usuario not found' });
        }
        res.send(usuario);
    }
    catch (error) {
        console.error('Error reading usuarios.json:', error);
        res.status(500).send({ error: 'Error reading usuarios.json' });
    }  
})

app.post('/api/usuarios', async (req, res) => {
    const { nombre, apellido, email, contraseña } = req.body;
    try {
        const filePath = path.join(__dirname, 'jsons', 'usuarios.json');
        const data = await fs.readFile(filePath, 'utf-8');
        const usuarios = JSON.parse(data);

        const createdUser = { id:usuarios.length + 1, nombre, apellido, email, contraseña };
        usuarios.push(createdUser);
        await fs.writeFile(filePath, JSON.stringify(usuarios, null, 2), 'utf-8');

        res.status(201).send(createdUser);
    }
    catch (error) {
        console.error('Error reading usuarios.json:', error);
        res.status(500).send({ error: 'Error reading usuarios.json' });
    }
}
);

app.post('/api/productos', async (req, res) => {
    const { nombre, precio, categoria, descripcion, imagen } = req.body;
    try {
        const filePath = path.join(__dirname, 'jsons', 'productos.json');
        const data = await fs.readFile(filePath, 'utf-8');
        const productos = JSON.parse(data);

        const createdProd = { id:productos.length + 1, nombre, precio, categoria, descripcion, imagen };
        productos.push(createdProd);
        await fs.writeFile(filePath, JSON.stringify(productos, null, 2), 'utf-8');

        res.status(201).send(createdProd);
    }
    catch (error) {
        console.error('Error reading productos.json:', error);
        res.status(500).send({ error: 'Error reading productos.json' });
    }
}
);

app.put('/api/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, email, contraseña } = req.body;

    try {
        const filePath = path.join(__dirname, 'jsons', 'usuarios.json');
        const data = await fs.readFile(filePath, 'utf-8');
        const usuarios = JSON.parse(data);

        // Buscar el usuario por ID
        const usuarioIndex = usuarios.findIndex(u => u.id === parseInt(id));
        if (usuarioIndex === -1) {
            return res.status(404).send({ error: 'Usuario not found' });
        }

        // Actualizar los datos del usuario
        usuarios[usuarioIndex] = {
            ...usuarios[usuarioIndex],
            nombre: nombre || usuarios[usuarioIndex].nombre,
            apellido: apellido || usuarios[usuarioIndex].apellido,
            email: email || usuarios[usuarioIndex].email,
            contraseña: contraseña || usuarios[usuarioIndex].contraseña
        };

        // Sobrescribir el archivo JSON con los datos actualizados
        await fs.writeFile(filePath, JSON.stringify(usuarios, null, 2), 'utf-8');

        res.send(usuarios[usuarioIndex]);
    } catch (error) {
        console.error('Error updating usuarios.json:', error);
        res.status(500).send({ error: 'Error updating usuarios.json' });
    }
});

app.delete('/api/ventas/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const filePath = path.join(__dirname, 'jsons', 'ventas.json');
        const data = await fs.readFile(filePath, 'utf-8');
        const ventas = JSON.parse(data);

        // Buscar el índice de la venta por ID
        const ventaIndex = ventas.findIndex(v => v.id === parseInt(id));
        if (ventaIndex === -1) {
            return res.status(404).send({ error: 'Venta not found' });
        }

        // Eliminar la venta del array
        const deletedVenta = ventas.splice(ventaIndex, 1);

        // Sobrescribir el archivo JSON con los datos actualizados
        await fs.writeFile(filePath, JSON.stringify(ventas, null, 2), 'utf-8');

        res.send(deletedVenta[0]); // Enviar la venta eliminada como respuesta
    } catch (error) {
        console.error('Error deleting venta:', error);
        res.status(500).send({ error: 'Error deleting venta' });
    }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});