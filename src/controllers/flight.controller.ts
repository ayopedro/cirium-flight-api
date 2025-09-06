import express from 'express';
import { FlightService } from '../services/flight.service';
import { CreateFlightDto } from '../services/dto/create-flight.dto';
import { GetPositionDto } from '../services/dto/get-position.dto';
import { validationMiddleware } from '../middlewares/validation.middleware';
import { queryValidationMiddleware } from '../middlewares/query-validator.middleware';

const router = express.Router();
const flightService = new FlightService();

router.get('/', async (req, res) => {
  try {
    const flights = await flightService.getFlights();
    res
      .status(200)
      .json({ message: 'Successfully fetched all flights', data: flights });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Failed to fetch flights' });
  }
});

router.get('/airports', async (req, res) => {
  try {
    const airports = await flightService.getAirports();
    res
      .status(200)
      .json({ message: 'Successfully fetched airports', data: airports });
  } catch (err: any) {
    console.error(err);
    res
      .status(500)
      .json({ message: err.message || 'Failed to fetch airports' });
  }
});

router.get('/:id/details', async (req, res) => {
  try {
    const flight = await flightService.getFlight(req.params.id!);
    res.json({ message: 'Successfully fetched flight data', data: flight });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/', validationMiddleware(CreateFlightDto), async (req, res) => {
  try {
    const flight = await flightService.createFlight(req.body);
    res
      .status(201)
      .json({ message: 'Successfully created flight', data: flight });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get(
  '/:id/position',
  queryValidationMiddleware(GetPositionDto),
  async (req, res) => {
    try {
      const position = await flightService.getFlightPosition(
        req.params.id!,
        req.query
      );
      res.json({
        message: 'Flight position fetched successfully',
        data: position,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

router.get(
  '/:id/in-airspace',
  queryValidationMiddleware(GetPositionDto),
  async (req, res) => {
    try {
      const { bottomLeftX, bottomLeftY, topRightX, topRightY } = req.query;
      if (!bottomLeftX || !bottomLeftY || !topRightX || !topRightY) {
        return res
          .status(400)
          .json({ error: 'Airspace coordinates are required' });
      }
      const isInAirspace = await flightService.isFlightInAirspace(
        req.params.id!,
        Number(bottomLeftX),
        Number(bottomLeftY),
        Number(topRightX),
        Number(topRightY),
        req.query
      );
      res.json({
        message: 'Airspace information fetched successfully',
        data: { isInAirspace },
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

export default router;
