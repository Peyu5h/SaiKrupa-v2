import express from 'express';
import customerRoutes from './customer.route.js';
import billRoutes from './bill.route.js';
import analyticsRoutes from './analytics.route.js';

const router = express.Router();

router.use('/customer', customerRoutes);
router.use('/bills', billRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
