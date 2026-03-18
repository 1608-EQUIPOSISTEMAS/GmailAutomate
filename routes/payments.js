const { Router } = require('express');
const { tPagos, tFicoProxima } = require('../config/transporters');
const { SENDER_GENERAL, SENDER_PAGOS } = require('../config/env');
const templateEngine = require('../services/templateEngine');
const { sendBatch, sendSingle } = require('../services/mailer');

const router = Router();

// POST /api/send-inscription — Pago/inscripción individual con HTML libre
router.post('/send-inscription', async (req, res) => {
    const { email, nombre, asunto, htmlBody } = req.body;
    if (!email || !htmlBody) {
        return res.status(400).json({ success: false, message: 'Faltan datos.' });
    }

    try {
        await sendSingle(tPagos, {
            from: `"WE Educación Ejecutiva" <${SENDER_GENERAL}>`,
            to: `"${nombre}" <${email}>`,
            subject: asunto,
            html: htmlBody,
        });
        res.json({ success: true, message: 'Correo enviado correctamente.' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/send-fico-proxima — Notificación individual de próxima cuota
router.post('/send-fico-proxima', async (req, res) => {
    const { email, asunto, nombre, categoria, fecha_cuota, monto, moneda } = req.body;

    if (!email || !nombre || !asunto) {
        return res.status(400).json({ success: false, message: 'Faltan campos obligatorios: email, nombre, asunto.' });
    }

    if (!templateEngine.getTemplate('fico_proxima')) {
        return res.status(500).json({ success: false, message: 'Falta fico_proxima.html en el servidor.' });
    }

    const tieneSiguiente = fecha_cuota && monto && String(monto).trim() !== '';

    const bloqueCuota = tieneSiguiente
        ? `<table align="center" style="border-collapse:collapse;width:350px;text-align:center;padding-bottom:25px">
            <thead>
              <tr style="background-color:rgb(17,1,101);color:white;">
                <td colspan="2" style="padding:5px;border:1px solid black"><font face="Tahoma" size="3">Tu siguiente cuota</font></td>
              </tr>
              <tr style="background-color:rgb(17,1,101);color:white;">
                <td style="padding:5px;border:1px solid black"><font face="Tahoma" size="3">Fecha de Pago</font></td>
                <td style="padding:5px;border:1px solid black"><font face="Tahoma" size="3">Monto a Pagar</font></td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding:5px;border:1px solid black"><font face="Tahoma" size="3">${fecha_cuota}</font></td>
                <td style="padding:5px;border:1px solid black"><font face="Tahoma" size="3">${moneda || 'S/'} ${monto}</font></td>
              </tr>
            </tbody>
           </table>`
        : `<table align="center" style="border-collapse:collapse;width:350px;text-align:center;padding-bottom:25px">
            <thead>
              <tr style="background-color:rgb(17,1,101);color:white;">
                <td colspan="2" style="padding:5px;border:1px solid black">
                  <font face="Tahoma" size="3">ÚLTIMO PAGO REALIZADO</font>
                </td>
              </tr>
              <tr style="background-color:rgb(17,1,101);color:white;">
                <td style="padding:5px;border:1px solid black"><font face="Tahoma" size="3">FECHA</font></td>
                <td style="padding:5px;border:1px solid black"><font face="Tahoma" size="3">SITUACIÓN</font></td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding:5px;border:1px solid black"><font face="Tahoma" size="3">${fecha_cuota}</font></td>
                <td style="padding:5px;border:1px solid black;color:red;font-weight:bold">
                  <font face="Tahoma" size="3">Sin deuda</font>
                </td>
              </tr>
            </tbody>
           </table>`;

    let html = templateEngine.render('fico_proxima', {
        'pDatos.nombre':    nombre,
        'pDatos.categoria': categoria || 'programa',
    });
    // Reemplaza el bloque condicional de Apps Script por el HTML ya resuelto
    html = html.replace(/(<\?if[\s\S]*?\?>[\s\S]*?<\?}\s*else\s*\{[\s\S]*?\?>[\s\S]*?<\?}\?>)/g, bloqueCuota);

    try {
        await sendSingle(tFicoProxima, {
            from: `"WE Educación Ejecutiva" <${SENDER_PAGOS}>`,
            to: email,
            subject: asunto,
            html,
        });
        console.log(`✅ (FICO-PROXIMA) Enviado a: ${email}`);
        res.json({ success: true, message: `Correo enviado a ${email}.` });
    } catch (err) {
        console.error(`❌ Error FICO-PROXIMA a ${email}:`, err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/send-fico-cuotas — Recordatorio masivo de cuotas
router.post('/send-fico-cuotas', async (req, res) => {
    const { students } = req.body;

    if (!students || !Array.isArray(students) || students.length === 0) {
        return res.status(400).json({ success: false, message: 'No students data provided.' });
    }

    if (!templateEngine.getTemplate('fico_cuotas')) {
        return res.status(500).json({ success: false, message: 'Falta fico_cuotas.html' });
    }

    console.log(`📩 Procesando ${students.length} alumnos para Recordatorio de Cuotas.`);

    const { sentCount, errorCount } = await sendBatch(students, (student) => {
        const html = templateEngine.render('fico_cuotas', {
            'pDatos.first_name':      student.first_name || '',
            'pDatos.fecha_cuota':     student.fecha_cuota || '',
            'pDatos.nombre_programa': student.nombre_programa || 'Tu Programa',
        });

        return {
            transporter: tPagos,
            label: 'FICO-CUOTAS',
            mail: {
                from: `"WE Educación Ejecutiva" <${SENDER_PAGOS}>`,
                to: student.email,
                subject: `​🤓🔔RECORDATORIO DE PAGO | ${student.nombre_programa} | WE EDUCACIÓN EJECUTIVA 💙`,
                html,
            },
        };
    });

    res.json({ success: true, message: 'Proceso de recordatorio de cuotas finalizado.', sentCount, errorCount });
});



// POST /api/send-fico-adventencia — Recordatorio AVISANDO ADVERTENCIA masivo de cuotas
router.post('/send-fico-adventencia', async (req, res) => {
    const { students } = req.body;

    if (!students || !Array.isArray(students) || students.length === 0) {
        return res.status(400).json({ success: false, message: 'No students data provided.' });
    }

    if (!templateEngine.getTemplate('fico_advertencia')) {
        return res.status(500).json({ success: false, message: 'Falta fico_advertencia.html' });
    }

    console.log(`📩 Procesando ${students.length} alumnos para Advertencia de Cuotas.`);

    const { sentCount, errorCount } = await sendBatch(students, (student) => {
        const html = templateEngine.render('fico_advertencia', {
            'pDatos.first_name':      student.first_name || '',
            'pDatos.fecha_cuota':     student.fecha_cuota || '',
            'pDatos.nombre_programa': student.nombre_programa || 'Tu Programa',
        });
        
        return {
            transporter: tPagos,
            label: 'FICO-ADVERTENCIA',
            mail: {
                from: `"WE Educación Ejecutiva" <${SENDER_PAGOS}>`,
                to: student.email,
                subject: `🚨🚨 NO PIERDAS TU ACCESO A TUS CLASES EN VIVO - REVISA ESTE MENSAJE |  ${student.nombre_programa} | WE EDUCACIÓN EJECUTIVA 💙`,
                html,
            },
        };
    });

    res.json({ success: true, message: 'Proceso de recordatorio de cuotas finalizado.', sentCount, errorCount });
});

module.exports = router;
