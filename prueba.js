const { google } = require('googleapis');
const KEY_FILE = 'credentials/service.json'; 
const ID_HOJA_LINKS = '11D-oLYkebqGx1r7QvAvQuomJx_jJHtNwjwKnpVVAiQY'; 

async function testRapido() {
    console.log("🚀 Probando lectura en hoja limpia...");
    const auth = new google.auth.GoogleAuth({
        keyFile: KEY_FILE,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

    try {
        // Intentamos leer la hoja NUEVA que acabas de crear
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: ID_HOJA_LINKS,
            range: '5. TUTORES!A12:P', 
        });
        console.log("✅ ÉXITO: El valor es:", res.data.values);
    } catch (error) {
        console.error("❌ ERROR:", error.message);
    }
}

testRapido();