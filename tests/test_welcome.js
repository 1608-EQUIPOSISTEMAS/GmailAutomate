const fetch = require('node-fetch');
const { BASE, TOKEN } = require('./config');

async function run() {
    const payload = {
        token: TOKEN,
        type: '48h',   // cambiar a '24h' para probar esa plantilla
        students: [
            {
                email:          'eliuthseguil@gmail.com',
                nombre:         'CURSO MICROSOFT POWER BI',
                programaNombre: 'POWER APPS Y AUTOMATIZACIÓN',
                programaImagen: 'https://drive.google.com/uc?export=download&id=1Jxdo5IVi2zf5GLHA0xqaL-f-UmxRh8O5',
                linkTeams:      'https://teams.microsoft.com/l/meetup-join/LINK-DE-PRUEBA',
                linkWsp:        'https://chat.whatsapp.com/LINK-DE-PRUEBA',
                fecha:          '18/02/2026',
            },
        ],
    };

    console.log(`🚀 Enviando prueba Welcome (${payload.type})...`);
    console.log(`   📧 Destinatario: ${payload.students[0].email}`);
    console.log(`   🎓 Programa:     ${payload.students[0].programaNombre}\n`);

    try {
        const res  = await fetch(`${BASE}/send-emails-json`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
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
