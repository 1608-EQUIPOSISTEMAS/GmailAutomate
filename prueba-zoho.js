const fetch = require('node-fetch'); // npm install node-fetch@2

const API_URL = "http://localhost:4111/api/send-fico-cuotas";
const API_SECRET = "CLAVE_SEGURA_WE_2026";

const payload = {
    token: API_SECRET,
    students: [
        {
            //email: "eliuthseguil@gmail.com", 
             email: "raul200420002@gmail.com", 
            fecha_cuota: "23 de Abril",
            nombre_programa: "DIPLOMADO EN INTELIGENCIA Y ANÁLISIS DE DATOS"
        }
    ]
};

async function sendTest() {
    console.log("🚀 Enviando prueba FICO-CUOTAS...");
    console.log(`   📧 Destinatario:  ${payload.students[0].email}`);
    console.log(`   📅 Fecha cuota:   ${payload.students[0].fecha_cuota}`);
    console.log(`   🎓 Programa:      ${payload.students[0].nombre_programa}\n`);

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