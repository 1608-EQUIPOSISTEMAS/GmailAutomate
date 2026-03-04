const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const CORREO_PRUEBA = "eliuthseguil@gmail.com"; 

const alumnoFake = {
    email: CORREO_PRUEBA,
    user: "PA_EST_001",
    password: "ClaveSegura2026",
    programa: "CURSO POWER APPS Y POWER AUTOMATE",
    bannerId: "1lQXJaTN01JOhXazV7k58AlWq60UTZLHR"
};

const transporter = nodemailer.createTransport({
    host: "smtp.zeptomail.com",
    port: 587,
    secure: false, 
    auth: {
        user: "emailapikey", 
        pass: "wSsVR61y8xPyBvx1yjStL+1qnVUHAAz2REt/i1Kj73WvT6zD9scyxUCbDQWhGvQaGDNpQTYT8egumxoB0mEL2tkpzlsGXCiF9mqRe1U4J3x17qnvhDzNWm9fmhGLKIoKww1tn2hgE8ok+g=="
    },
});

async function probarPlantillaPowerApps() {
    console.log("🚀 Iniciando prueba de Accesos Power Apps...");

    try {
        const templatePath = path.join(__dirname, 'template_pwapps.html');
        const footerPath = path.join(__dirname, 'footer.html');

        if (!fs.existsSync(templatePath)) throw new Error("Falta template_pwapps.html en la carpeta.");
        
        let htmlTemplate = fs.readFileSync(templatePath, 'utf8');
        let htmlFooter = fs.existsSync(footerPath) ? fs.readFileSync(footerPath, 'utf8') : "";

        let finalHtml = htmlTemplate
            .replace(/<\?= pDatos\.user \?>/g, alumnoFake.user) 
            .replace(/<\?= pDatos\.password \?>/g, alumnoFake.password)
            .replace(/<\?= pDatos\.programa \?>/g, alumnoFake.programa)
            .replace(/<\?= pDatos\.bannerId \?>/g, alumnoFake.bannerId)
            .replace(/<\?!= obtenerHtml\('Footer'\) \?>/g, htmlFooter);

        await transporter.sendMail({
            from: `"WE Educación Ejecutiva" <alumno.we@we-educacion.com>`,
            to: alumnoFake.email,
            subject: "🔔 [TEST PA] Tus credenciales de acceso a Power Apps",
            html: finalHtml,
        });

        console.log("✅ Correo de prueba Power Apps enviado a: " + alumnoFake.email);

    } catch (error) {
        console.error("❌ Error en la prueba:", error.message);
    }
}

probarPlantillaPowerApps();