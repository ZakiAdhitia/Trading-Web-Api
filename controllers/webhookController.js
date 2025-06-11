const axios = require('axios');
const { db } = require('../firebase');

exports.handleWebhook = async (req, res) => {
  try {
    const signal = req.body;

    const configSnap = await db.collection('config').doc('default').get();
    if (!configSnap.exists) {
      return res.status(404).json({ message: 'Konfigurasi tidak ditemukan di Firebase.' });
    }

    const config = configSnap.data();

    const plusDI = Number(signal.plusDI);
    const minusDI = Number(signal.minusDI);
    const adx = Number(signal.adx);

    let action = null;

    if (adx < config.adxMinimum) {
      action = 'SELL';
      console.log('ADX di bawah minimum, melakukan SELL langsung.');
    } 
    else if (
      plusDI > config.plusDIThreshold &&
      minusDI < config.minusDIThreshold &&
      adx > config.adxMinimum
    ) {
      action = 'BUY';
      console.log('Memenuhi kriteria BUY.');
    } else if (
      plusDI < config.plusDIThreshold &&
      minusDI > config.minusDIThreshold &&
      adx < config.adxMinimum
    ) {
      action = 'SELL';
      console.log('Memenuhi kriteria SELL.');
    }

    if (!action)
      return res.status(400).json({ message: 'Sinyal tidak valid, tidak memenuhi kriteria BUY/SELL.' });

    const priceData = await axios.get(
      `https://api.binance.com/api/v3/ticker/price?symbol=${signal.symbol}`
    );
    const entry = parseFloat(priceData.data.price);

    const tp =
      action === 'BUY'
        ? entry * (1 + config.takeProfitPercent / 100)
        : entry * (1 - config.takeProfitPercent / 100);

    const sl =
      action === 'BUY'
        ? entry * (1 - config.stopLossPercent / 100)
        : entry * (1 + config.stopLossPercent / 100);

    const newOrder = {
      symbol: signal.symbol,
      action,
      price_entry: entry.toFixed(2),
      tp_price: tp.toFixed(2),
      sl_price: sl.toFixed(2),
      leverage: config.leverage,
      timeframe: signal.timeframe,
      timestamp: new Date().toISOString(),
    };

    await db.collection('orders').add(newOrder);

    res.json(newOrder);
  } catch (error) {
    console.error('Error in handleWebhook:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const snapshot = await db.collection('orders').orderBy('timestamp', 'desc').get();

    const orders = snapshot.docs.map(doc => doc.data());

    res.json(orders);
  } catch (error) {
    console.error('Error in getOrders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
