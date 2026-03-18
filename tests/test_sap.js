const fetch = require('node-fetch');
const { BASE, TOKEN } = require('./config');

async function run() {
    const payload = {
        token: TOKEN,
        students: [
            {
                email:    'eliuthseguil@gmail.com',
                user:     'SAP_EST_001',
                password: 'ClaveSegura2026',
                programa: 'SAP HANA SD',
                bannerId: '1FdSzuN51vbaxNlRTWGEDNLKpLOB6dhPt',
            },
        ],
    };

    console.log('🚀 Enviando prueba SAP...');
    console.log(`   📧 Destinatario: ${payload.students[0].email}`);
    console.log(`   👤 Usuario:      ${payload.students[0].user}`);
    console.log(`   🎓 Programa:     ${payload.students[0].programa}\n`);

    try {
        const res  = await fetch(`${BASE}/send-sap-emails`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await res.json();

        if (data.success) {
            console.log('✅ ÉXITO:');
            console.log(`   Enviados: ${data.sentCount}`);
            console.log(`   Errores:  ${data.errorCount}`);
        } else {
            console.error('❌ FALLÓ:', data.message || data.error);
        }
    } catch (err) {
        console.error('❌ Error de conexión:', err.message);
        console.error('   ¿Está corriendo el servidor? → node app.js');
    }
}

run();
