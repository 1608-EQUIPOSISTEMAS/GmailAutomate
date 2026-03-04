const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4111;

app.use(bodyParser.json({ limit: '10mb' }));

// ================= CONFIGURACIÓN =================
const API_SECRET = "CLAVE_SEGURA_WE_2026"; 
const ZOHO_USER = "alumno.we@we-educacion.com";

// ---------------------------------------------------------
// 1. TRANSPORTER ORIGINAL (48H y Bienvenida)
// ---------------------------------------------------------
const transporter48h = nodemailer.createTransport({
    host: "smtp.zeptomail.com",
    port: 587,
    secure: false, 
    auth: {
        user: "emailapikey", 
        pass: "wSsVR61y8xPyBvx1yjStL+1qnVUHAAz2REt/i1Kj73WvT6zD9scyxUCbDQWhGvQaGDNpQTYT8egumxoB0mEL2tkpzlsGXCiF9mqRe1U4J3x17qnvhDzNWm9fmhGLKIoKww1tn2hgE8ok+g=="
    },
});

// ---------------------------------------------------------
// 2. NUEVO TRANSPORTER (SOLO PARA 24 HORAS)
// ---------------------------------------------------------
const transporter24h = nodemailer.createTransport({
    host: "smtp.zeptomail.com",
    port: 587,
    secure: false, 
    auth: {
        user: "emailapikey", 
        pass: "wSsVR610/ROhCK1+nWKpL70xzFhVVVnwE05431Xy7CetGv/E9cdowUebVASmH6BNE2JuEDMW8bIvkEoF2zpa2tx/wgkEDiiF9mqRe1U4J3x17qnvhDzNX2RemhuMJIMPxAxqn2RgFM8h+g=="
    },
});

// ---------------------------------------------------------
// 3. TRANSPORTER PAGOS
// ---------------------------------------------------------
const transporterPagos = nodemailer.createTransport({
    host: "smtp.zeptomail.com",
    port: 587,
    secure: false, 
    auth: {
        user: "emailapikey", 
        pass: "wSsVR6108xbyD6p7nGf/db07m1UHBQ/wF0160VX37SD5F/yRocc/kxLLAgKgGqcWRTJoF2RApu8gkB4ChzdbjN4lzFFSCyiF9mqRe1U4J3x17qnvhDzKV2hVmxOJJIkOwghin2hkG80m+g=="
    },
});

// ---------------------------------------------------------
// 4. NUEVO TRANSPORTER (EXCLUSIVO PARA ACCESOS SAP)
// ---------------------------------------------------------
const transporterSAP = nodemailer.createTransport({
    host: "smtp.zeptomail.com",
    port: 587,
    secure: false, 
    auth: {
        user: "emailapikey", 
        pass: "wSsVR61x+x/zCf8rlGWldrs5kF1UBFjyF0V5jAf06XWtSvzK88c/lhfOAAD0HvZKGDY7Qjoaob56nBoH0TINiokswl0DDCiF9mqRe1U4J3x17qnvhDzIXmpdkBqMJI8BxARon2NiFsAr+g=="
    },
});

// ================= CARGA DE PLANTILLAS =================
const templatePath48 = path.join(__dirname, 'template_48h.html');
const templatePath24 = path.join(__dirname, 'template_24h.html'); 
const footerPath = path.join(__dirname, 'footer.html');
const templatePathSAP = path.join(__dirname, 'template_sap.html');


let htmlTemplatePWAPPS = "";
let htmlTemplateSAP = "";
let htmlTemplate48 = "";
let htmlTemplate24 = "";
let htmlFooter = "";

try {
    if (fs.existsSync(templatePath48)) htmlTemplate48 = fs.readFileSync(templatePath48, 'utf8');
    if (fs.existsSync(templatePath24)) htmlTemplate24 = fs.readFileSync(templatePath24, 'utf8');
    if (fs.existsSync(footerPath)) htmlFooter = fs.readFileSync(footerPath, 'utf8');
    if (fs.existsSync(templatePathSAP)) htmlTemplateSAP = fs.readFileSync(templatePathSAP, 'utf8');
    const templatePathPWAPPS = path.join(__dirname, 'template_pwapps.html');
    if (fs.existsSync(templatePathPWAPPS)) htmlTemplatePWAPPS = fs.readFileSync(templatePathPWAPPS, 'utf8');
    console.log("✅ Plantillas cargadas en memoria.");
} catch (e) {
    console.error("❌ Error cargando plantillas:", e.message);
}

// ================= API ENDPOINT (RECORDATORIOS JSON) =================
app.post('/api/send-emails-json', async (req, res) => {
    
    const token = req.body.token; 
    if (token !== API_SECRET) return res.status(403).json({ success: false, message: "Access Denied." });

    const students = req.body.students;
    const type = req.body.type || "48h"; 

    if (!students || !Array.isArray(students) || students.length === 0) {
        return res.status(400).json({ success: false, message: "No students data provided." });
    }

    // --- SELECCIÓN INTELIGENTE DE AGENTE Y PLANTILLA ---
    let activeTransporter; // ¿Qué cartero usamos?
    let selectedTemplate;  // ¿Qué carta enviamos?
    let subjectLine;       // ¿Qué asunto ponemos?

    if (type === '24h') {
        // MODO 24 HORAS
        activeTransporter = transporter24h; // 👈 Usamos el Agente NUEVO
        selectedTemplate = htmlTemplate24;
        subjectLine = "Explora tu Campus Virtual y empieza con éxito - W|E Educación Ejecutiva";
        
        if (!selectedTemplate) return res.status(500).json({ success: false, message: "Falta template_24h.html" });

    } else {
        // MODO 48 HORAS (Default)
        activeTransporter = transporter48h; // 👈 Usamos el Agente VIEJO
        selectedTemplate = htmlTemplate48;
        subjectLine = "🔔 Ya tienes todo listo para iniciar - W|E Educación Ejecutiva";
        
        if (!selectedTemplate) return res.status(500).json({ success: false, message: "Falta template_48h.html" });
    }

    console.log(`📩 Procesando ${students.length} alumnos. TIPO: ${type}`);

    let sentCount = 0;
    let errorCount = 0;

    for (const student of students) {
        try {
            const primerNombre = student.nombre ? student.nombre.split(" ")[0] : "Alumno";
            
            let finalHtml = selectedTemplate
                .replace(/<\?= pDatos\.first_name \?>/g, primerNombre) 
                .replace(/<\?= pDatos\.fecha \?>/g, student.fecha || "")
                .replace(/<\?= pPrograma\.imagen \?>/g, student.programaImagen || "") 
                .replace(/<\?= pPrograma\.nombre \?>/g, student.programaNombre || "Tu Programa")
                .replace(/<\?= pLinks\.teams \?>/g, student.linkTeams || "#")
                .replace(/<\?= pLinks\.whatsapp \?>/g, student.linkWsp || "#")
                .replace(/<\?!= obtenerHtml\('Footer'\) \?>/g, htmlFooter);

            // Enviamos con el "activeTransporter" seleccionado arriba
            await activeTransporter.sendMail({
                from: `"WE Educación Ejecutiva" <${ZOHO_USER}>`,
                to: student.email,
                subject: subjectLine,
                html: finalHtml,
            });

            console.log(`   ✅ (${type}) Enviado a: ${student.email}`);
            sentCount++;
            await new Promise(r => setTimeout(r, 100)); 

        } catch (error) {
            console.error(`   ❌ Error enviando a ${student.email}:`, error.message);
            errorCount++;
        }
    }

    res.json({
        success: true,
        message: `Proceso ${type} finalizado.`,
        sentCount: sentCount,
        errorCount: errorCount
    });
});

// ================= API ENDPOINT (INSCRIPCIONES - Pagos) =================
app.post('/api/send-inscription', async (req, res) => {
    const token = req.body.token;
    if (token !== API_SECRET) return res.status(403).json({ success: false, message: "Access Denied." });

    const { email, nombre, asunto, htmlBody } = req.body;
    if (!email || !htmlBody) return res.status(400).json({ success: false, message: "Faltan datos." });

    try {
        await transporterPagos.sendMail({
            from: '"WE Educación Ejecutiva" <alumno.we@we-educacion.com>', 
            to: `"${nombre}" <${email}>`,
            subject: asunto,
            html: htmlBody 
        });
        res.json({ success: true, message: "Correo enviado correctamente" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ================= API ENDPOINT (BIENVENIDA - Usa el de 48h/General) =================
app.post('/api/send-welcome', async (req, res) => {
    const token = req.body.token;
    if (token !== API_SECRET) return res.status(403).json({ success: false, message: "Access Denied." });

    const { email, nombre, asunto, htmlBody } = req.body;
    if (!email || !htmlBody) return res.status(400).json({ success: false, message: "Faltan datos." });

    try {
        // Usamos transporter48h (que es el general por defecto)
        await transporter48h.sendMail({
            from: `"WE Educación Ejecutiva" <${ZOHO_USER}>`, 
            to: email,
            subject: asunto || "¡Bienvenido a WE Educación Ejecutiva!",
            html: htmlBody 
        });
        res.json({ success: true, message: "Bienvenida enviada." });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


// ================= API ENDPOINT (ACCESOS SAP) =================
app.post('/api/send-sap-emails', async (req, res) => {
    
    const token = req.body.token; 
    if (token !== API_SECRET) return res.status(403).json({ success: false, message: "Access Denied." });

    const students = req.body.students;

    if (!students || !Array.isArray(students) || students.length === 0) {
        return res.status(400).json({ success: false, message: "No students data provided." });
    }

    if (!htmlTemplateSAP) return res.status(500).json({ success: false, message: "Falta template_sap.html" });

    console.log(`📩 Procesando ${students.length} alumnos para envío de Accesos SAP.`);

    let sentCount = 0;
    let errorCount = 0;

    for (const student of students) {
        try {

            let finalHtml = htmlTemplateSAP
                .replace(/<\?= pDatos\.user \?>/g, student.user || "No asignado") 
                .replace(/<\?= pDatos\.password \?>/g, student.password || "No asignado")
                .replace(/<\?= pDatos\.bannerId \?>/g, student.bannerId || "")
                .replace(/<\?= pDatos\.programa \?>/g, student.programa || "SAP")
                .replace(/<\?!= obtenerHtml\('Footer'\) \?>/g, htmlFooter);

            

            // 👇 CAMBIO AQUÍ: Usamos el transporterSAP en lugar del 48h
            await transporterSAP.sendMail({
                from: `"WE Educación Ejecutiva" <${ZOHO_USER}>`,
                to: student.email,
                subject: "USUARIO SAP MM - W|E Educación Ejecutiva",
                html: finalHtml,
            });

            console.log(`   ✅ (SAP) Enviado a: ${student.email}`);
            sentCount++;
            await new Promise(r => setTimeout(r, 100)); // Espera para cuidar el límite de Zoho

        } catch (error) {
            console.error(`   ❌ Error enviando SAP a ${student.email}:`, error.message);
            errorCount++;
        }
    }

    res.json({
        success: true,
        message: `Proceso de envíos SAP finalizado.`,
        sentCount: sentCount,
        errorCount: errorCount
    });
});


// ================= API ENDPOINT (ACCESOS POWER APPS) =================
app.post('/api/send-pwapps-emails', async (req, res) => {
    
    const token = req.body.token; 
    if (token !== API_SECRET) return res.status(403).json({ success: false, message: "Access Denied." });

    const students = req.body.students;

    if (!students || !Array.isArray(students) || students.length === 0) {
        return res.status(400).json({ success: false, message: "No students data provided." });
    }

    if (!htmlTemplatePWAPPS) return res.status(500).json({ success: false, message: "Falta template_pwapps.html" });

    console.log(`📩 Procesando ${students.length} alumnos para envío de Accesos Power Apps.`);

    let sentCount = 0;
    let errorCount = 0;

    for (const student of students) {
        try {
            let finalHtml = htmlTemplatePWAPPS
                .replace(/<\?= pDatos\.user \?>/g, student.user || "No asignado") 
                .replace(/<\?= pDatos\.password \?>/g, student.password || "No asignado")
                .replace(/<\?= pDatos\.programa \?>/g, student.programa || "Power Apps")
                .replace(/<\?= pDatos\.bannerId \?>/g, student.bannerId || "")
                .replace(/<\?!= obtenerHtml\('Footer'\) \?>/g, htmlFooter);

            await transporterSAP.sendMail({
                from: `"WE Educación Ejecutiva" <${ZOHO_USER}>`,
                to: student.email,
                subject: "USUARIO POWER APPS - W|E Educación Ejecutiva",
                html: finalHtml,
            });

            console.log(`   ✅ (PWAPPS) Enviado a: ${student.email}`);
            sentCount++;
            await new Promise(r => setTimeout(r, 100));

        } catch (error) {
            console.error(`   ❌ Error enviando PWAPPS a ${student.email}:`, error.message);
            errorCount++;
        }
    }

    res.json({
        success: true,
        message: `Proceso de envíos Power Apps finalizado.`,
        sentCount: sentCount,
        errorCount: errorCount
    });
});


app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor listo en puerto ${PORT}`);
});