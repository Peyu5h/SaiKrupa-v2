import express from 'express';
import trimRequest from 'trim-request';
import {
  createCustomer,
  getCustomerDetails,
  getCustomers,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customer.controller.js';

const router = express.Router();

router.post('/create', trimRequest.all, createCustomer);
router.get('/', getCustomers);
router.get('/:id', getCustomerDetails);
router.put('/:id', trimRequest.all, updateCustomer);
router.delete('/:id', deleteCustomer);

export default router;
