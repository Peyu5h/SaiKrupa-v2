import express from 'express';
import trimRequest from 'trim-request';
import {
  createBill,
  getCustomerBills,
  getAllTransactions,
  getRecentTransactions,
  getPlans,
  updatePlan,
  deletePlan,
  createPlan,
  deleteTransaction,
} from '../controllers/bill.controller.js';

const router = express.Router();

router.post('/create', trimRequest.all, createBill);
router.get('/customer/:customerId', getCustomerBills);

router.get('/transactions', getAllTransactions);
router.get('/transactions/recent', getRecentTransactions);
router.delete('/transactions/:paymentId', deleteTransaction);

router.get('/plans', getPlans);
router.post('/plans', trimRequest.all, createPlan);
router.put('/plans/:planId', trimRequest.all, updatePlan);
router.delete('/plans/:planId', deletePlan);

export default router;
