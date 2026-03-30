const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/admin.controller');
const { auth, isAdministrador } = require('../middlewares/auth');

// RF10/RF13 — Estadísticas del dashboard del administrador
router.get('/dashboard/stats', auth, isAdministrador, AdminController.obtenerDashboardStats);

module.exports = router;
