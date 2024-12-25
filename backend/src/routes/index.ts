import express from 'express';
import customerRoutes from './customer.route.js';
import billRoutes from './bill.route.js';

const router = express.Router();

router.use('/customer', customerRoutes);
router.use('/bills', billRoutes);

export default router;
