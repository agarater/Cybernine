import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health.js';

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.ORIGIN || '*', credentials: true }));

app.use('/health', healthRouter);

app.get('/', (_req, res) => {
  res.json({ name: 'C9 API', status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[C9] API escuchando en http://localhost:${PORT}`);
});
