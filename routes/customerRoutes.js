import { Router } from 'express';
const router = Router();
import Customer from '../models/Customer.js';
import validateCustomer from '../validators/customerValidator.js';
import producer from '../producer.js';

router.post('/', async (req, res) => {
  const { error } = validateCustomer(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  
  try {

    await producer('customerTopic', req.body);
    res.status(200).json({ message: 'Customer data received and queued for processing.' });

    
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

export default router;
