import express, { Application } from 'express';
import cors from 'cors';
import { errorHandler} from './middlewares/error.handler';
import { userController, tripController, bookingController } from './container';

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
app.use('/api/users', userController.router );
app.use('/api/trips', tripController.router );
app.use('/api/bookings', bookingController.router );
app.use(errorHandler);

export default app;