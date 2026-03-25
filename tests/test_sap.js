const fetch = require('node-fetch');
const { BASE, TOKEN } = require('./config');

async function run() {
    const payload = {
        token: TOKEN,
        students: [
            { user: 'SAPH_IN_01', password: 'Clave12345', email: 'eliuthseguil@gmail.com', programa: 'SAP HANA IN', bannerId: '1IJRSjk-a6I4A9ntn-qtjO8q9XpUg1b65' },
            { user: 'SAPH_IN_01', password: 'Clave12345', email: 'alarconmarco.331@gmail.com', programa: 'SAP HANA IN', bannerId: '1IJRSjk-a6I4A9ntn-qtjO8q9XpUg1b65' },
            { user: 'SAPH_IN_02', password: 'Clave12345', email: 'andrea959533923andrea@gmail.com', programa: 'SAP HANA IN', bannerId: '1IJRSjk-a6I4A9ntn-qtjO8q9XpUg1b65' },
            { user: 'SAPH_IN_03', password: 'Clave12345', email: 'kcipriani2014@gmail.com', programa: 'SAP HANA IN', bannerId: '1IJRSjk-a6I4A9ntn-qtjO8q9XpUg1b65' },
            { user: 'SAPH_IN_04', password: 'Clave12345', email: 'carlos.diaza188@gmail.com', programa: 'SAP HANA IN', bannerId: '1IJRSjk-a6I4A9ntn-qtjO8q9XpUg1b65' },
            { user: 'SAPH_IN_05', password: 'Clave12345', email: 'a.elguera@encossa.com', programa: 'SAP HANA IN', bannerId: '1IJRSjk-a6I4A9ntn-qtjO8q9XpUg1b65' },
            { user: 'SAPH_IN_06', password: 'Clave12345', email: 'fernandezancasied@outlook.com', programa: 'SAP HANA IN', bannerId: '1IJRSjk-a6I4A9ntn-qtjO8q9XpUg1b65' },
            { user: 'SAPH_IN_07', password: 'Clave12345', email: 'danieljgarciah30@gmail.com', programa: 'SAP HANA IN', bannerId: '1IJRSjk-a6I4A9ntn-qtjO8q9XpUg1b65' },
            { user: 'SAPH_IN_08', password: 'Clave12345', email: 'nicoleyorkalopezrengifo@gmail.com', programa: 'SAP HANA IN', bannerId: '1IJRSjk-a6I4A9ntn-qtjO8q9XpUg1b65' },
            { user: 'SAPH_IN_09', password: 'Clave12345', email: 'g.mitumorig@alum.up.edu.pe', programa: 'SAP HANA IN', bannerId: '1IJRSjk-a6I4A9ntn-qtjO8q9XpUg1b65' },
            { user: 'SAPH_IN_10', password: 'Clave12345', email: 'ypiarello@gmail.com', programa: 'SAP HANA IN', bannerId: '1IJRSjk-a6I4A9ntn-qtjO8q9XpUg1b65' },
            { user: 'SAPH_IN_11', password: 'Clave12345', email: 'jesusisaac20181303@gmail.com', programa: 'SAP HANA IN', bannerId: '1IJRSjk-a6I4A9ntn-qtjO8q9XpUg1b65' },
            { user: 'SAPH_IN_12', password: 'Clave12345', email: 'caroline99tocas@gmail.com', programa: 'SAP HANA IN', bannerId: '1IJRSjk-a6I4A9ntn-qtjO8q9XpUg1b65' },
            { user: 'SAPH_IN_13', password: 'Clave12345', email: 'riverabrayan.27.29@gmail.com', programa: 'SAP HANA IN', bannerId: '1IJRSjk-a6I4A9ntn-qtjO8q9XpUg1b65' },
            { user: 'SAPH_IN_14', password: 'Clave12345', email: 'nicolenaomi757@gmail.com', programa: 'SAP HANA IN', bannerId: '1IJRSjk-a6I4A9ntn-qtjO8q9XpUg1b65' },
            { user: 'SAPH_IN_15', password: 'Clave12345', email: 'kiara-lorena@hotmail.com', programa: 'SAP HANA IN', bannerId: '1IJRSjk-a6I4A9ntn-qtjO8q9XpUg1b65' },
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
