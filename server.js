require('dotenv').config();
const fs = require('fs');
const https = require('https');
const express = require('express');
const cors = require('cors');

const configRoutes = require('./routes/configRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 8443; // gunakan port di atas 1024

// Baca SSL certificate dan private key
const sslOptions = {
  key: fs.readFileSync('./ssl/key.pem'),
  cert: fs.readFileSync('./ssl/cert.pem'),
};

app.use(cors());
app.use(express.json());

app.use('/config', configRoutes);
app.use('/orders', orderRoutes);
app.use('/webhook', orderRoutes);

app.get('/', (req, res) => {
  res.send('API berjalan dengan HTTPS!');
});

// Buat HTTPS server
https.createServer(sslOptions, app).listen(PORT, '0.0.0.0', () => {
  console.log(`Server HTTPS berjalan di https://0.0.0.0:${PORT}`);
});
