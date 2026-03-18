const fetch = require('node-fetch');
const { BASE, TOKEN } = require('./config');

const ENDPOINT = `${BASE}/send-fico-proxima`;

const casoConCuota = {
    token:           TOKEN,
    email:           'eliuthseguil@gmail.com',
    asunto:          'Confirmación de cuota 2 - Diplomado en Finanzas | WE Educación ejecutiva',
    nombre:          'Max',
    categoria:       'Diplomado',
    fecha_cuota:     '15 Abril',
    monto:           '330',
    moneda:          'S/',
    nombre_programa: 'DIPLOMADO EN FINANZAS',
};

const casoSinCuota = {
    token:           TOKEN,
    email:           'eliuthseguil@gmail.com',
    asunto:          'Confirmación de cuota 3 - Diplomado en Finanzas | WE Educación ejecutiva',
    nombre:          'Max',
    categoria:       'Diplomado',
    fecha_cuota:     '15 Abril',
    monto:           null,
    moneda:          null,
    nombre_programa: 'DIPLOMADO EN FINANZAS',
};

async function sendTest(label, payload) {
    console.log(`\n${'─'.repeat(50)}`);
    console.log(`🚀 Enviando prueba: ${label}`);
    console.log(`   📧 Destinatario:  ${payload.email}`);
    console.log(`   👤 Nombre:        ${payload.nombre}`);
    console.log(`   📅 Próx. cuota:   ${payload.fecha_cuota ?? 'ninguna (última cuota)'}`);
    console.log(`   💰 Monto:         ${payload.monto ?? 'N/A'}`);

    try {
        const res  = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await res.json();

        if (data.success) {
            console.log('✅ ÉXITO:', data.message);
        } else {
            console.error('❌ FALLÓ:', data.message || data.error);
        }
    } catch (err) {
        console.error('❌ Error de conexión:', err.message);
        console.error('   ¿Está corriendo el servidor? → node app.js');
    }
}

async function run() {
    await sendTest('CON siguiente cuota', casoConCuota);
    await sendTest('SIN siguiente cuota (última)', casoSinCuota);
    console.log(`\n${'─'.repeat(50)}`);
    console.log('🏁 Pruebas finalizadas.');
}

run();
