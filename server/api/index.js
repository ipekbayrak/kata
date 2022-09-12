import express from 'express';
import controller from './controller.js';

const router = express.Router();

router
  .post('/login', controller.onLogin)
  .post('/register', controller.onRegister)
  .post('/logout', controller.onLogout)
  .post('/requestBalanceSheet', controller.decode, controller.onFetchBalanceSheet)
  .post('/requestOutcome', controller.decode, controller.onRequestOutcome);

export default router;
