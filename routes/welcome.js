const { Router } = require('express');
const { t48h, t24h } = require('../config/transporters');
const { SENDER_GENERAL } = require('../config/env');
const templateEngine = require('../services/templateEngine');
const { sendBatch, sendSingle } = require('../services/mailer');

const router = Router();

// POST /api/send-emails-json — Envío masivo 24h o 48h
router.post('/send-emails-json', async (req, res) => {
    const { students, type = '48h' } = req.body;

    if (!students || !Array.isArray(students) || students.length === 0) {
        return res.status(400).json({ success: false, message: 'No students data provided.' });
    }

    const is24h = type === '24h';
    const transporter = is24h ? t24h : t48h;
    const templateName = is24h ? 'welcome_24h' : 'welcome_48h';
    const subject = is24h
        ? 'Explora tu Campus Virtual y empieza con éxito - W|E Educación Ejecutiva'
        : '🔔 Ya tienes todo listo para iniciar - W|E Educación Ejecutiva';

    if (!templateEngine.getTemplate(templateName)) {
        return res.status(500).json({ success: false, message: `Falta ${templateName}.html` });
    }

    console.log(`📩 Procesando ${students.length} alumnos. TIPO: ${type}`);

    const { sentCount, errorCount } = await sendBatch(students, (student) => {
        const primerNombre = student.nombre ? student.nombre.split(' ')[0] : 'Alumno';
        const html = templateEngine.render(templateName, {
            'pDatos.first_name': primerNombre,
            'pDatos.fecha':      student.fecha || '',
            'pPrograma.imagen':  student.programaImagen || '',
            'pPrograma.nombre':  student.programaNombre || 'Tu Programa',
            'pLinks.teams':      student.linkTeams || '#',
            'pLinks.whatsapp':   student.linkWsp || '#',
        });
        return {
            transporter,
            label: type,
            mail: {
                from: `"WE Educación Ejecutiva" <${SENDER_GENERAL}>`,
                to: student.email,
                subject,
                html,
            },
        };
    });

    res.json({ success: true, message: `Proceso ${type} finalizado.`, sentCount, errorCount });
});

// POST /api/send-welcome — Bienvenida individual con HTML libre
router.post('/send-welcome', async (req, res) => {
    const { email, nombre, asunto, htmlBody } = req.body;
    if (!email || !htmlBody) {
        return res.status(400).json({ success: false, message: 'Faltan datos.' });
    }

    try {
        await sendSingle(t48h, {
            from: `"WE Educación Ejecutiva" <${SENDER_GENERAL}>`,
            to: email,
            subject: asunto || '¡Bienvenido a WE Educación Ejecutiva!',
            html: htmlBody,
        });
        res.json({ success: true, message: 'Bienvenida enviada.' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
