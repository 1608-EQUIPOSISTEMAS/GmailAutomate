const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4111;

// Aumentamos el límite del body por si envías muchos alumnos de golpe
app.use(bodyParser.json({ limit: '10mb' }));

// ================= CONFIGURACIÓN =================
const API_SECRET = "CLAVE_SEGURA_WE_2026"; 
const ZOHO_USER = "alumno.we@we-educacion.com"; 

// Configuración ZeptoMail
const transporter = nodemailer.createTransport({
    host: "smtp.zeptomail.com",
    port: 587,
    secure: false, 
    auth: {
        user: "emailapikey", 
        pass: "wSsVR61y8xPyBvx1yjStL+1qnVUHAAz2REt/i1Kj73WvT6zD9scyxUCbDQWhGvQaGDNpQTYT8egumxoB0mEL2tkpzlsGXCiF9mqRe1U4J3x17qnvhDzNWm9fmhGLKIoKww1tn2hgE8ok+g=="
    },
});

// ---------------------------------------------------------
// 2. TRANSPORTER NUEVO (Para pagos / send-inscription)
// ---------------------------------------------------------
const transporterPagos = nodemailer.createTransport({
    host: "smtp.zeptomail.com",
    port: 587,
    secure: false, 
    auth: {
        user: "emailapikey", 
        // Tu contraseña NUEVA (La que acabas de pasar)
        pass: "wSsVR6108xbyD6p7nGf/db07m1UHBQ/wF0160VX37SD5F/yRocc/kxLLAgKgGqcWRTJoF2RApu8gkB4ChzdbjN4lzFFSCyiF9mqRe1U4J3x17qnvhDzKV2hVmxOJJIkOwghin2hkG80m+g=="
    },
});

// Cargar plantillas al iniciar para no leer disco en cada request
const templatePath = path.join(__dirname, 'template_48h.html');
const footerPath = path.join(__dirname, 'footer.html');
let htmlTemplate = "";
let htmlFooter = "";

try {
    htmlTemplate = fs.readFileSync(templatePath, 'utf8');
    if (fs.existsSync(footerPath)) htmlFooter = fs.readFileSync(footerPath, 'utf8');
    console.log("✅ Plantillas cargadas en memoria.");
} catch (e) {
    console.error("❌ Error cargando plantillas:", e.message);
}

// ================= API ENDPOINT =================
app.post('/api/send-emails-json', async (req, res) => {
    
    // 1. Verificación de seguridad
    const token = req.body.token; 
    if (token !== API_SECRET) {
        return res.status(403).json({ success: false, message: "Access Denied." });
    }

    const students = req.body.students;
    if (!students || !Array.isArray(students) || students.length === 0) {
        return res.status(400).json({ success: false, message: "No students data provided." });
    }

    console.log(`📩 Recibido lote de ${students.length} alumnos.`);

    let sentCount = 0;
    let errorCount = 0;

    // 2. Procesar Envío
    // Usamos un loop for...of para manejar async/await ordenadamente
    for (const student of students) {
        try {
            // Reemplazo en HTML
            const primerNombre = student.nombre.split(" ")[0];
            
            let finalHtml = htmlTemplate
                .replace(/<\?= pDatos\.first_name \?>/g, primerNombre)
                .replace(/<\?= pPrograma\.imagen \?>/g, student.programaImagen || "") 
                .replace(/<\?= pPrograma\.nombre \?>/g, student.programaNombre || "Tu Programa")
                .replace(/<\?= pLinks\.teams \?>/g, student.linkTeams)
                .replace(/<\?= pLinks\.whatsapp \?>/g, student.linkWsp)
                .replace(/<\?!= obtenerHtml\('Footer'\) \?>/g, htmlFooter);

            // Enviar
            await transporter.sendMail({
                from: `"WE Educación Ejecutiva" <${ZOHO_USER}>`,
                to: student.email,
                subject: `🔔 Ya tienes todo listo para iniciar - W|E Educación Ejecutiva`,
                html: finalHtml,
            });

            console.log(`   ✅ Enviado a: ${student.email}`);
            sentCount++;
            
            // Pequeña pausa para no saturar SMTP si son muchos (100ms)
            await new Promise(r => setTimeout(r, 100));

        } catch (error) {
            console.error(`   ❌ Error enviando a ${student.email}:`, error.message);
            errorCount++;
        }
    }

    // 3. Responder al Apps Script
    // Solo respondemos éxito si al menos procesamos la solicitud, 
    // GAS se encargará de marcar OK.
    res.json({
        success: true,
        message: "Proceso finalizado.",
        sentCount: sentCount,
        errorCount: errorCount
    });
});

app.get('/health', (req, res) => {
    res.send("API ZeptoMail Ready (JSON Mode).");
});


// ================= API ENDPOINT 2 (PAGOS / INSCRIPCIONES) =================
// Este usará el NUEVO 'transporterPagos'
app.post('/api/send-inscription', async (req, res) => {

    const token = req.body.token;
    if (token !== API_SECRET) return res.status(403).json({ success: false, message: "Access Denied." });

    const { email, nombre, asunto, htmlBody } = req.body;

    if (!email || !htmlBody) {
        return res.status(400).json({ success: false, message: "Faltan datos." });
    }

    console.log(`💳 Procesando inscripción (NUEVO API KEY) para: ${email}`);

    try {
        // AQUÍ ESTÁ EL CAMBIO: Usamos 'transporterPagos'
        let info = await transporterPagos.sendMail({
            from: '"WE Educación Ejecutiva" <pagos@we-educacion.com>', 
            to: `"${nombre}" <${email}>`,
            subject: asunto,
            html: htmlBody 
        });

        console.log(`   ✅ Enviado ID: ${info.messageId}`);
        res.json({ success: true, message: "Correo enviado correctamente" });

    } catch (error) {
        console.error(`   ❌ Error enviando a ${email}:`, error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor listo en puerto ${PORT}`);
});