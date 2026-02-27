const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// ==========================================
// 1. CONFIGURACIÓN DE PRUEBA SAP
// ==========================================

const CORREO_PRUEBA = "eliuthseguil@gmail.com"; 

// Datos fake específicos para la plantilla SAP
const alumnoFake = {
    email: CORREO_PRUEBA,
    user: "SAP_EST_001",
    password: "ClaveSegura2026"
};

// ==========================================
// 2. CREDENCIALES (Tu transporter general)
// ==========================================
const transporter48h = nodemailer.createTransport({
    host: "smtp.zeptomail.com",
    port: 587,
    secure: false, 
    auth: {
        user: "emailapikey", 
        pass: "wSsVR61y8xPyBvx1yjStL+1qnVUHAAz2REt/i1Kj73WvT6zD9scyxUCbDQWhGvQaGDNpQTYT8egumxoB0mEL2tkpzlsGXCiF9mqRe1U4J3x17qnvhDzNWm9fmhGLKIoKww1tn2hgE8ok+g=="
    },
});

// ==========================================
// 3. EJECUCIÓN DE LA PRUEBA
// ==========================================
async function probarPlantillaSAP() {
    console.log("🚀 Iniciando prueba de Accesos SAP...");

    try {
        // Apuntamos al nuevo HTML de SAP
        const templatePath = path.join(__dirname, 'template_sap.html');
        const footerPath = path.join(__dirname, 'footer.html');

        if (!fs.existsSync(templatePath)) throw new Error("Falta template_sap.html en la carpeta.");
        
        let htmlTemplate = fs.readFileSync(templatePath, 'utf8');
        let htmlFooter = fs.existsSync(footerPath) ? fs.readFileSync(footerPath, 'utf8') : "";

        // --- REEMPLAZO DE DATOS SAP ---
        // Aquí cambiamos las etiquetas del HTML por los datos de mentira
        let finalHtml = htmlTemplate
            .replace(/<\?= pDatos\.user \?>/g, alumnoFake.user) 
            .replace(/<\?= pDatos\.password \?>/g, alumnoFake.password)
            .replace(/<\?!= obtenerHtml\('Footer'\) \?>/g, htmlFooter);

        // Enviamos el correo
        let info = await transporter48h.sendMail({
            from: `"WE Educación Ejecutiva" <alumno.we@we-educacion.com>`,
            to: alumnoFake.email,
            subject: "🔔 [TEST SAP] Tus credenciales de acceso a SAP HANA MM",
            html: finalHtml,
        });

        console.log("✅ Correo de prueba SAP enviado exitosamente a: " + alumnoFake.email);

    } catch (error) {
        console.error("❌ Error en la prueba:", error.message);
    }
}

probarPlantillaSAP();