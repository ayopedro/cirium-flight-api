import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import FlightController from './controllers/flight.controller';

const app = express();
app.use(bodyParser.json());
app.use('/flights', FlightController);

const PORT = process.env.APP_PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
