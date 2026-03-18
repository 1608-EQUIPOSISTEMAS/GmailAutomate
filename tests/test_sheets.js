// Prueba lectura directa de Google Sheets (no requiere servidor)
const { google } = require('googleapis');
const path = require('path');

const KEY_FILE        = path.join(__dirname, '..', 'credentials', 'service.json');
const ID_HOJA_LINKS   = '11D-oLYkebqGx1r7QvAvQuomJx_jJHtNwjwKnpVVAiQY';

async function run() {
    console.log('🚀 Probando lectura de Google Sheets...');
    const auth = new google.auth.GoogleAuth({
        keyFile: KEY_FILE,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

    try {
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: ID_HOJA_LINKS,
            range: '5. TUTORES!A12:P',
        });
        console.log('✅ ÉXITO. Valores:', res.data.values);
    } catch (err) {
        console.error('❌ ERROR:', err.message);
    }
}

run();
