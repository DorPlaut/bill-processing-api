import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import router from './routes/route.js';
import bodyParser from 'body-parser';

// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(bodyParser.json({ limit: '50mb' })); // Increase the limit to 50MB

// global vars
const port = process.env.PORT;

// middlewares
app.use(
  cors({
    origin: '*',
  })
);

// Router
app.use(express.static('./public'));
app.use('/api', router);

const start = async () => {
  try {
    await app.listen(port, () =>
      console.log(`server is listening on port ${port}`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
