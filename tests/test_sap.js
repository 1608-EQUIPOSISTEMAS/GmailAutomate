const fetch = require('node-fetch');
const { BASE, TOKEN } = require('./config');

async function run() {
    const payload = {
        token: TOKEN,
        students: [
            { user: 'SAP_HCM_01', password: 'Clave12345', email: 'eliuthseguil@gmail.com', programa: 'SAP HANA HCM', bannerId: '1gfW07TT7wdiW7W5d4vrYkjkP4FsZdg28' },
            { user: 'SAP_HCM_01', password: 'Clave12345', email: 'acurioisabella@gmail.com', programa: 'SAP HANA HCM', bannerId: '1gfW07TT7wdiW7W5d4vrYkjkP4FsZdg28' },
            { user: 'SAP_HCM_02', password: 'Clave12345', email: 'garcemarq@gmail.com', programa: 'SAP HANA HCM', bannerId: '1gfW07TT7wdiW7W5d4vrYkjkP4FsZdg28' },
            { user: 'SAP_HCM_03', password: 'Clave12345', email: 'claudiachanametafur@gmail.com', programa: 'SAP HANA HCM', bannerId: '1gfW07TT7wdiW7W5d4vrYkjkP4FsZdg28' },
            { user: 'SAP_HCM_04', password: 'Clave12345', email: 'perez_vane20@hotmail.com', programa: 'SAP HANA HCM', bannerId: '1gfW07TT7wdiW7W5d4vrYkjkP4FsZdg28' },
            { user: 'SAP_HCM_05', password: 'Clave12345', email: 'dayana25224@gmail.com', programa: 'SAP HANA HCM', bannerId: '1gfW07TT7wdiW7W5d4vrYkjkP4FsZdg28' },
            { user: 'SAP_HCM_06', password: 'Clave12345', email: 'victorandre020201@gmail.com', programa: 'SAP HANA HCM', bannerId: '1gfW07TT7wdiW7W5d4vrYkjkP4FsZdg28' },
            { user: 'SAP_HCM_07', password: 'Clave12345', email: 'fernandezancasied@outlook.com', programa: 'SAP HANA HCM', bannerId: '1gfW07TT7wdiW7W5d4vrYkjkP4FsZdg28' },
            { user: 'SAP_HCM_08', password: 'Clave12345', email: 'javiergodenzi@gmail.com', programa: 'SAP HANA HCM', bannerId: '1gfW07TT7wdiW7W5d4vrYkjkP4FsZdg28' },
            { user: 'SAP_HCM_09', password: 'Clave12345', email: 'yosmarlinyole@gmail.com', programa: 'SAP HANA HCM', bannerId: '1gfW07TT7wdiW7W5d4vrYkjkP4FsZdg28' },
            { user: 'SAP_HCM_10', password: 'Clave12345', email: 'lina.livian24@gmail.com', programa: 'SAP HANA HCM', bannerId: '1gfW07TT7wdiW7W5d4vrYkjkP4FsZdg28' },
            { user: 'SAP_HCM_11', password: 'Clave12345', email: 'ariafany.9105@gmail.com', programa: 'SAP HANA HCM', bannerId: '1gfW07TT7wdiW7W5d4vrYkjkP4FsZdg28' },
            { user: 'SAP_HCM_12', password: 'Clave12345', email: 'jmanuelmamanimamani@gmail.com', programa: 'SAP HANA HCM', bannerId: '1gfW07TT7wdiW7W5d4vrYkjkP4FsZdg28' },
            { user: 'SAP_HCM_13', password: 'Clave12345', email: 'masamynh@gmail.com', programa: 'SAP HANA HCM', bannerId: '1gfW07TT7wdiW7W5d4vrYkjkP4FsZdg28' },
            { user: 'SAP_HCM_14', password: 'Clave12345', email: 'andyobregon20@gmail.com', programa: 'SAP HANA HCM', bannerId: '1gfW07TT7wdiW7W5d4vrYkjkP4FsZdg28' },
            { user: 'SAP_HCM_15', password: 'Clave12345', email: 'fiorellaore2798@gmail.com', programa: 'SAP HANA HCM', bannerId: '1gfW07TT7wdiW7W5d4vrYkjkP4FsZdg28' },
            { user: 'SAP_HCM_16', password: 'Clave12345', email: 'edwin.quispe.j@uni.pe', programa: 'SAP HANA HCM', bannerId: '1gfW07TT7wdiW7W5d4vrYkjkP4FsZdg28' },
            { user: 'SAP_HCM_17', password: 'Clave12345', email: 'darlysanchez226@gmail.com', programa: 'SAP HANA HCM', bannerId: '1gfW07TT7wdiW7W5d4vrYkjkP4FsZdg28' },
            { user: 'SAP_HCM_18', password: 'Clave12345', email: 'lizde_584@hotmail.com', programa: 'SAP HANA HCM', bannerId: '1gfW07TT7wdiW7W5d4vrYkjkP4FsZdg28' },
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
