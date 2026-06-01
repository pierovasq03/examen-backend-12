const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Joi = require('joi');
const axios = require('axios');
const pool = require('./db');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10, 2) NOT NULL,
                stock INT NOT NULL,
                image_url VARCHAR(255)
            );
        `);
        console.log('Tabla "products" verificada/creada con éxito en la nube.');
    } catch (err) {
        console.error('Error al inicializar la base de datos:', err.message);
    }
};
initDB();

const productSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().allow(''),
    price: Joi.number().positive().required(),
    stock: Joi.number().integer().min(0).required()
});

app.get('/api/products', async (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
        res.json(result.rows);
    } catch (error) { next(error); }
});

app.get('/api/products/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'No encontrado' });
        res.json(result.rows[0]);
    } catch (error) { next(error); }
});

app.post('/api/products', async (req, res, next) => {
    try {
        const { error, value } = productSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const response = await axios.get('https://picsum.photos/400');
        const imageUrl = response.request.res.responseUrl;

        const result = await pool.query(
            'INSERT INTO products (name, description, price, stock, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [value.name, value.description, value.price, value.stock, imageUrl]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) { next(error); }
});

app.put('/api/products/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { error, value } = productSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const result = await pool.query(
            'UPDATE products SET name = $1, description = $2, price = $3, stock = $4 WHERE id = $5 RETURNING *',
            [value.name, value.description, value.price, value.stock, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'No encontrado' });
        res.json(result.rows[0]);
    } catch (error) { next(error); }
});

app.delete('/api/products/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'No encontrado' });
        res.json({ message: 'Eliminado con éxito' });
    } catch (error) { next(error); }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Error interno', details: err.message });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor en puerto ${PORT}`);
});