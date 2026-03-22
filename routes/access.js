const { Router } = require('express');
const { tSAP } = require('../config/transporters');
const { SENDER_GENERAL } = require('../config/env');
const templateEngine = require('../services/templateEngine');
const { sendBatch } = require('../services/mailer');

const router = Router();

// POST /api/send-sap-emails — Envío masivo de credenciales SAP
router.post('/send-sap-emails', async (req, res) => {
    const { students } = req.body;

    if (!students || !Array.isArray(students) || students.length === 0) {
        return res.status(400).json({ success: false, message: 'No students data provided.' });
    }

    if (!templateEngine.getTemplate('sap')) {
        return res.status(500).json({ success: false, message: 'Falta sap.html' });
    }

    console.log(`📩 Procesando ${students.length} alumnos para envío de Accesos SAP.`);

    const { sentCount, errorCount } = await sendBatch(students, (student) => {
        const html = templateEngine.render('sap', {
            'pDatos.user':     student.user || 'No asignado',
            'pDatos.password': student.password || 'No asignado',
            'pDatos.bannerId': student.bannerId || '',
            'pDatos.programa': student.programa || 'SAP',
        });
        return {
            transporter: tSAP,
            label: 'SAP',
            mail: {
                from: `"WE Educación Ejecutiva" <${SENDER_GENERAL}>`,
                to: student.email,
                subject: 'USUARIO SAP HCM - W|E Educación Ejecutiva',
                html,
            },
        };
    });

    res.json({ success: true, message: 'Proceso de envíos SAP finalizado.', sentCount, errorCount });
});

// POST /api/send-pwapps-emails — Envío masivo de credenciales PowerApps
router.post('/send-pwapps-emails', async (req, res) => {
    const { students } = req.body;

    if (!students || !Array.isArray(students) || students.length === 0) {
        return res.status(400).json({ success: false, message: 'No students data provided.' });
    }

    if (!templateEngine.getTemplate('pwapps')) {
        return res.status(500).json({ success: false, message: 'Falta pwapps.html' });
    }

    console.log(`📩 Procesando ${students.length} alumnos para envío de Accesos Power Apps.`);

    const { sentCount, errorCount } = await sendBatch(students, (student) => {
        const html = templateEngine.render('pwapps', {
            'pDatos.user':     student.user || 'No asignado',
            'pDatos.password': student.password || 'No asignado',
            'pDatos.programa': student.programa || 'Power Apps',
            'pDatos.bannerId': student.bannerId || '',
        });
        return {
            transporter: tSAP,
            label: 'PWAPPS',
            mail: {
                from: `"WE Educación Ejecutiva" <${SENDER_GENERAL}>`,
                to: student.email,
                subject: 'USUARIO POWER APPS - W|E Educación Ejecutiva',
                html,
            },
        };
    });

    res.json({ success: true, message: 'Proceso de envíos Power Apps finalizado.', sentCount, errorCount });
});

module.exports = router;
