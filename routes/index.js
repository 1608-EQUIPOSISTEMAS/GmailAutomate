const { Router } = require('express');
const auth = require('../middleware/auth');
const welcomeRoutes  = require('./welcome');
const paymentsRoutes = require('./payments');
const accessRoutes   = require('./access');

const router = Router();

// El middleware de auth se aplica aquí, una sola vez para todas las rutas /api
router.use(auth);

router.use(welcomeRoutes);
router.use(paymentsRoutes);
router.use(accessRoutes);

module.exports = router;
