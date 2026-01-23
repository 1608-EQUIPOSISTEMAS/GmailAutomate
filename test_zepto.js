const nodemailer = require('nodemailer');

// 1. Configuración de ZeptoMail (Tus credenciales reales)
const transporter = nodemailer.createTransport({
    host: "smtp.zeptomail.com",
    port: 587,
    secure: false, 
    auth: {
        user: "emailapikey", 
        pass: "wSsVR61y8xPyBvx1yjStL+1qnVUHAAz2REt/i1Kj73WvT6zD9scyxUCbDQWhGvQaGDNpQTYT8egumxoB0mEL2tkpzlsGXCiF9mqRe1U4J3x17qnvhDzNWm9fmhGLKIoKww1tn2hgE8ok+g=="
    },
});

async function enviarPrueba() {
    try {
        console.log("🚀 Iniciando prueba de envío a eliuthseguil@gmail.com...");

        // 2. Envío del correo
        const info = await transporter.sendMail({
            from: '"Sistemas WE" <alumno.we@we-educacion.com>', // Tu remitente verificado
            to: "eliuthseguil@gmail.com", // El destino que pediste
            subject: "Prueba Exitosa: ZeptoMail Configurado 🚀",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f0f2f5;">
                    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h2 style="color: #00b894; margin-top: 0;">¡Conexión Establecida! ✅</h2>
                        <p style="color: #636e72; font-size: 16px;">
                            Hola <strong>Eliuth</strong>,
                        </p>
                        <p style="color: #636e72; font-size: 16px;">
                            Si estás leyendo este mensaje, significa que tu servidor VPS ya se comunica correctamente con <strong>ZeptoMail</strong>.
                        </p>
                        <div style="background-color: #dfe6e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p style="margin: 0; color: #2d3436;"><strong>Dominio:</strong> we-educacion.com</p>
                            <p style="margin: 0; color: #2d3436;"><strong>Estado:</strong> Verificado y Listo</p>
                        </div>
                        <p style="font-size: 14px; color: #b2bec3;">
                            Enviado automáticamente desde Node.js
                        </p>
                    </div>
                </div>
            `,
        });

        console.log("✅ ¡Correo enviado con éxito!");
        console.log("📨 Message ID:", info.messageId);

    } catch (error) {
        console.error("❌ Error al enviar el correo:", error);
    }
}

enviarPrueba();