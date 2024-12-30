import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import routes from './routes/index.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.static('public'));
app.use(
  cors({
    origin: '*',
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

const port: number = parseInt(process.env.PORT || '8000');

app.use('/api', routes);

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'working' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
