const fetch = require('node-fetch'); // npm install node-fetch@2

const API_URL    = "http://localhost:4111/api/send-fico-proxima";
const API_SECRET = "CLAVE_SEGURA_WE_2026";

// ── Caso 1: Con siguiente cuota ────────────────────────────────
const payloadConCuota = {
    token:           API_SECRET,
    email:           "eliuthseguil@gmail.com",
    asunto:          "Confirmación de cuota 2 - Diplomado en Finanzas | WE Educación ejecutiva",
    nombre:          "Max",
    categoria:       "Diplomado",
    fecha_cuota:     "15 Abril",
    monto:           "330",
    moneda:          "S/",
    nombre_programa: "DIPLOMADO EN FINANZAS"
};

// ── Caso 2: Sin siguiente cuota (última cuota) ─────────────────
const payloadSinCuota = {
    token:           API_SECRET,
    email:           "eliuthseguil@gmail.com",
    asunto:          "Confirmación de cuota 3 - Diplomado en Finanzas | WE Educación ejecutiva",
    nombre:          "Max",
    categoria:       "Diplomado",
    fecha_cuota:     null,
    monto:           null,
    moneda:          null,
    nombre_programa: "DIPLOMADO EN FINANZAS"
};

async function sendTest(label, payload) {
    console.log(`\n${"─".repeat(50)}`);
    console.log(`🚀 Enviando prueba: ${label}`);
    console.log(`   📧 Destinatario:  ${payload.email}`);
    console.log(`   👤 Nombre:        ${payload.nombre}`);
    console.log(`   📅 Próx. cuota:   ${payload.fecha_cuota ?? "ninguna (última cuota)"}`);
    console.log(`   💰 Monto:         ${payload.monto ?? "N/A"}`);
    console.log(`   🎓 Programa:      ${payload.nombre_programa}`);
    console.log(`   📧 Asunto:        ${payload.asunto}\n`);

    try {
        const response = await fetch(API_URL, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.success) {
            console.log("✅ ÉXITO:");
            console.log(`   Mensaje: ${data.message}`);
        } else {
            console.error("❌ FALLÓ:");
            console.error(`   Mensaje: ${data.message || data.error}`);
        }

    } catch (err) {
        console.error("❌ Error de conexión:", err.message);
        console.error("   ¿Está corriendo el servidor en puerto 4111?");
    }
}

async function runAll() {
    await sendTest("CON siguiente cuota", payloadConCuota);
    await sendTest("SIN siguiente cuota (última)", payloadSinCuota);
    console.log(`\n${"─".repeat(50)}`);
    console.log("🏁 Pruebas finalizadas.");
}

runAll();