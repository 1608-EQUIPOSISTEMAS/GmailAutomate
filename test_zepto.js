const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// ==========================================
// 1. CONFIGURACIÓN DE PRUEBA
// ==========================================

const CORREO_PRUEBA = "eliuthseguil@gmail.com"; // <--- PON TU CORREO

const alumnoFake = {
    nombre: "Alvaro Calidad Test",
    email: CORREO_PRUEBA,
    programaNombre: "POWER APPS Y AUTOMATIZACIÓN",
    programaImagen: "https://we-educacion.com/wp-content/uploads/2024/01/power-apps.png",
    linkTeams: "https://teams.microsoft.com/l/meetup-join/LINK-DE-PRUEBA",
    linkWsp: "https://chat.whatsapp.com/LINK-DE-PRUEBA",
    fecha: "18/02/2026"
};

// ==========================================
// 2. CREDENCIALES
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
// 3. EJECUCIÓN
// ==========================================
async function probarPlantilla() {
    console.log("🚀 Iniciando prueba...");

    try {
        const templatePath = path.join(__dirname, 'template_48h.html');
        const footerPath = path.join(__dirname, 'footer.html');

        if (!fs.existsSync(templatePath)) throw new Error("Falta template_48h.html");
        
        let htmlTemplate = fs.readFileSync(templatePath, 'utf8');
        let htmlFooter = fs.existsSync(footerPath) ? fs.readFileSync(footerPath, 'utf8') : "";

        const primerNombre = alumnoFake.nombre.split(" ")[0];

        // --- AQUÍ AGREGAMOS EL REEMPLAZO DE FECHA ---
        // Asumo que en tu HTML la etiqueta es <?= pDatos.fecha ?> o similar.
        // Si en tu HTML dice <?= fecha ?>, cambia la parte izquierda del replace.
        
        let finalHtml = htmlTemplate
            .replace(/<\?= pDatos\.first_name \?>/g, primerNombre) 
            .replace(/<\?= pPrograma\.imagen \?>/g, alumnoFake.programaImagen) 
            .replace(/<\?= pPrograma\.nombre \?>/g, alumnoFake.programaNombre)
            .replace(/<\?= pLinks\.teams \?>/g, alumnoFake.linkTeams)
            .replace(/<\?= pLinks\.whatsapp \?>/g, alumnoFake.linkWsp)
            // 👇 NUEVA LÍNEA AGREGADA:
            .replace(/<\?= pDatos\.fecha \?>/g, alumnoFake.fecha) 
            // 👆 (Si no funciona, prueba cambiando 'pDatos.fecha' por 'fecha' o 'pPrograma.fecha' según tu HTML)
            .replace(/<\?!= obtenerHtml\('Footer'\) \?>/g, htmlFooter);

        let info = await transporter48h.sendMail({
            from: `"WE Educación Ejecutiva" <alumno.we@we-educacion.com>`,
            to: alumnoFake.email,
            subject: "🔔 [TEST CON FECHA] Ya tienes todo listo para iniciar",
            html: finalHtml,
        });

        console.log("✅ Correo enviado a: " + alumnoFake.email);

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

probarPlantilla();