const nodemailer = require('nodemailer');

// 1. Configuración de ZeptoMail (Se mantienen las mismas credenciales si es el mismo Mail Agent)
const transporter = nodemailer.createTransport({
    host: "smtp.zeptomail.com",
    port: 587,
    secure: false, 
    auth: {
        user: "emailapikey", 
        pass: "wSsVR6108xbyD6p7nGf/db07m1UHBQ/wF0160VX37SD5F/yRocc/kxLLAgKgGqcWRTJoF2RApu8gkB4ChzdbjN4lzFFSCyiF9mqRe1U4J3x17qnvhDzKV2hVmxOJJIkOwghin2hkG80m+g=="
    },
});

async function enviarPrueba() {
    try {
        console.log("🚀 Iniciando prueba de envío desde PAGOS...");

        // 2. Envío del correo
        const info = await transporter.sendMail({
            // 👇 AQUÍ ESTÁ EL CAMBIO IMPORTANTE
            from: '"Pagos WE Educación" <pagos@we-educacion.com>', 
            to: "eliuthseguil@gmail.com", 
            subject: "Prueba de Pagos: ZeptoMail Configurado 💳",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f0f2f5;">
                    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h2 style="color: #0984e3; margin-top: 0;">¡Prueba de Pagos Exitosa! 💳</h2>
                        <p style="color: #636e72; font-size: 16px;">
                            Hola <strong>Eliuth</strong>,
                        </p>
                        <p style="color: #636e72; font-size: 16px;">
                            Este correo confirma que ahora puedes enviar correos usando el remitente: <br>
                            <strong style="color: #d63031;">pagos@we-educacion.com</strong>
                        </p>
                        <div style="background-color: #dfe6e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p style="margin: 0; color: #2d3436;"><strong>Remitente:</strong> pagos@we-educacion.com</p>
                            <p style="margin: 0; color: #2d3436;"><strong>Servicio:</strong> ZeptoMail API</p>
                        </div>
                        <p style="font-size: 14px; color: #b2bec3;">
                            Enviado automáticamente desde tu VPS
                        </p>
                    </div>
                </div>
            `,
        });

        console.log("✅ ¡Correo de PAGOS enviado con éxito!");
        console.log("📨 Message ID:", info.messageId);

    } catch (error) {
        console.error("❌ Error al enviar el correo:", error.message);
        
        if(error.message.includes("relaying disallowed")) {
            console.log("\n⚠️ PISTA: Este error suele significar que 'pagos@we-educacion.com' no está añadido o verificado en el panel de ZeptoMail.");
        }
    }
}

enviarPrueba();