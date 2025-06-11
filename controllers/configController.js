const { db } = require('../firebase');

exports.getConfig = async (req, res) => {
  try {
    const doc = await db.collection('config').doc('default').get();
    if (doc.exists) {
      res.json(doc.data());
    } else {
      res.json({});
    }
  } catch (error) {
    console.error('Gagal ambil config:', error);
    res.status(500).json({ error: 'Error ambil config' });
  }
};

exports.saveConfig = async (req, res) => {
  try {
    await db.collection('config').doc('default').set(req.body);
    res.json({ message: 'Config tersimpan' });
  } catch (error) {
    console.error('Gagal simpan config:', error);
    res.status(500).json({ error: 'Error simpan config' });
  }
};
