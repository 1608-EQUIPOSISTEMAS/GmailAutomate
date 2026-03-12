const fetch = require('node-fetch'); // npm install node-fetch@2

const API_URL = "http://localhost:4111/api/send-emails-json";
const API_SECRET = "CLAVE_SEGURA_WE_2026";

const payload = {
    token: API_SECRET,
    type: "48h",
    students: [
        {
            email: "eliuthseguil@gmail.com",           // 👈 Cambia esto
            nombre: "Juan Pérez",
            fecha: "Lunes 16 de Junio, 2025 - 9:00 AM",
            programaImagen: "https://drive.google.com/uc?export=download&id=1Jxdo5IVi2zf5GLHA0xqaL-f-UmxRh8O5",
            programaNombre: "Diplomado en Gestión Empresarial",
            linkTeams: "https://teams.microsoft.com/l/meetup-join/test",
            linkWsp: "https://wa.me/5215500000000"
        }
    ]
};

async function sendTest() {
    console.log("🚀 Enviando prueba 48h...");
    console.log(`   📧 Destinatario: ${payload.students[0].email}`);
    console.log(`   👤 Nombre: ${payload.students[0].nombre}`);
    console.log(`   📅 Fecha: ${payload.students[0].fecha}\n`);

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.success) {
            console.log("✅ ÉXITO:");
            console.log(`   Enviados:  ${data.sentCount}`);
            console.log(`   Errores:   ${data.errorCount}`);
            console.log(`   Mensaje:   ${data.message}`);
        } else {
            console.error("❌ FALLÓ:", data.message);
        }

    } catch (err) {
        console.error("❌ Error de conexión:", err.message);
        console.error("   ¿Está corriendo el servidor en puerto 4111?");
    }
}

sendTest();