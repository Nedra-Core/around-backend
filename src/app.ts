import express, { Application } from 'express';
import cors from 'cors';
import userRouter from './modules/user';

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
app.use('/api/users', userRouter);
export default app;