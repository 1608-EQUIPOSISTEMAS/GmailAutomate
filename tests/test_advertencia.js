const fetch = require('node-fetch');

const BASE  = 'http://localhost:4111/api';
const TOKEN = 'CLAVE_SEGURA_WE_2026';

async function run() {
    console.log('📩 Enviando test de advertencia FICO...\n');

    const res = await fetch(`${BASE}/send-fico-adventencia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            token: TOKEN,
            students: [
                {
                    email:           'eliuthseguil@gmail.com',   // 👈 cambia esto
                    nombre_programa: 'MBA Digital',
                    fecha_cuota:     '01/04/2026',
                },
            ],
        }),
    });

    const data = await res.json();
    console.log('Status HTTP:', res.status);
    console.log('Respuesta: ', data);
}

run().catch(console.error);
