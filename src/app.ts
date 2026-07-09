import express, { Application } from 'express';
import cors from 'cors';

const app: Application = express();

app.use(cors());
app.use(express.json());


app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'around',
    timestamp: new Date().toISOString(),
  });
});


export default app;