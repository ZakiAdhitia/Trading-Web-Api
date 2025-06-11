const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
console.log("🔥 ServiceAccount:", serviceAccount);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = { admin, db };
