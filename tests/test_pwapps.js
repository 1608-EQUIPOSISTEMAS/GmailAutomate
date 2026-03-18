const fetch = require('node-fetch');
const { BASE, TOKEN } = require('./config');

async function run() {
    const payload = {
        token: TOKEN,
        students: [
            {
                email:    'eliuthseguil@gmail.com',
                user:     'PA_EST_001',
                password: 'ClaveSegura2026',
                programa: 'CURSO POWER APPS Y POWER AUTOMATE',
                bannerId: '1lQXJaTN01JOhXazV7k58AlWq60UTZLHR',
            },
        ],
    };

    console.log('🚀 Enviando prueba Power Apps...');
    console.log(`   📧 Destinatario: ${payload.students[0].email}`);
    console.log(`   👤 Usuario:      ${payload.students[0].user}`);
    console.log(`   🎓 Programa:     ${payload.students[0].programa}\n`);

    try {
        const res  = await fetch(`${BASE}/send-pwapps-emails`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
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
