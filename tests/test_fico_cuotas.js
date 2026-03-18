const fetch = require('node-fetch');
const { BASE, TOKEN } = require('./config');

async function run() {
    const payload = {
        token: TOKEN,
        students: [
            {
                email:           'eliuthseguil@gmail.com',
                fecha_cuota:     '23 de Abril',
                nombre_programa: 'DIPLOMADO EN INTELIGENCIA Y ANÁLISIS DE DATOS',
            },
        ],
    };

    console.log('🚀 Enviando prueba FICO-CUOTAS...');
    console.log(`   📧 Destinatario:  ${payload.students[0].email}`);
    console.log(`   📅 Fecha cuota:   ${payload.students[0].fecha_cuota}`);
    console.log(`   🎓 Programa:      ${payload.students[0].nombre_programa}\n`);

    try {
        const res  = await fetch(`${BASE}/send-fico-cuotas`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await res.json();

        if (data.success) {
            console.log('✅ ÉXITO:');
            console.log(`   Enviados: ${data.sentCount}`);
            console.log(`   Errores:  ${data.errorCount}`);
            console.log(`   Mensaje:  ${data.message}`);
        } else {
            console.error('❌ FALLÓ:', data.message);
        }
    } catch (err) {
        console.error('❌ Error de conexión:', err.message);
        console.error('   ¿Está corriendo el servidor? → node app.js');
    }
}

run();
