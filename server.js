require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // für Railway wichtig
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/entries', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM entries ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("DB Fehler");
  }
});

app.post('/entries', async (req, res) => {
  const { text } = req.body;
  try {
    await pool.query('INSERT INTO entries(text) VALUES($1)', [text]);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send("DB Fehler");
  }
});

// Server starten
app.listen(PORT, () => {
  const host = process.env.PORT ? 'Railway Host' : 'http://localhost';
  console.log(`Server läuft auf ${host}:${PORT}`);
});
