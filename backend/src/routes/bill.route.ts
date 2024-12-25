import express from 'express';
import trimRequest from 'trim-request';
import {
  createBill,
  getCustomerBills,
  getAllTransactions,
  getRecentTransactions,
  deleteTransaction,
} from '../controllers/bill.controller.js';

const router = express.Router();

router.post('/create', trimRequest.all, createBill);
router.get('/customer/:customerId', getCustomerBills);

router.get('/transactions', getAllTransactions);
router.get('/transactions/recent', getRecentTransactions);
router.delete('/transactions/:paymentId', deleteTransaction);

export default router;
