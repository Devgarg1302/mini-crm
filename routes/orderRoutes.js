import { Router } from 'express';
const router = Router();
import Order from '../models/Order.js';
import validateOrder from '../validators/orderValidator.js';
import producer from '../producer.js';

router.post('/', async (req, res) => {
  const { error } = validateOrder(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    await producer('orderTopic', req.body);
    res.status(200).json({ message: 'Order data received and queued for processing.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

export default router;
