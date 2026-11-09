// import 'dotenv/config';
// import express from 'express';
// import cors from 'cors';
// import mongoose from 'mongoose';
// import auth from './routes/auth.js';
// import api from './routes/api.js';

// const app = express();
// app.use(cors());
// app.use(express.json({ limit: '2mb' }));
// app.get('/api/health', (_q, s) => s.json({ ok: true }));
// app.use('/api/auth', auth);
// app.use('/api', api);

// await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/praxis');
// const port = process.env.PORT || 5000;
// app.listen(port, () => console.log('Praxis API running on http://localhost:' + port));




import 'dotenv/config';
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']); // fixes "querySrv ESERVFAIL" on networks with a bad DNS
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import auth from './routes/auth.js';
import api from './routes/api.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.get('/api/health', (_q, s) => s.json({ ok: true }));
app.use('/api/auth', auth);
app.use('/api', api);

try {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/praxis', { serverSelectionTimeoutMS: 10000 });
  console.log('MongoDB connected');
} catch (e) {
  console.error('MongoDB connection failed. Check Atlas Network Access (0.0.0.0/0), cluster status, and your internet/WARP.\n' + e.message.slice(0, 200));
  process.exit(1);
}

const port = process.env.PORT || 5000;
app.listen(port, () => console.log('Praxis API running on http://localhost:' + port));