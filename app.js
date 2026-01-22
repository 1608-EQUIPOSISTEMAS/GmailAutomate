const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4111; // You can change this port if needed

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// ================= CONFIGURATION =================
const KEY_FILE = 'credentials/service.json'; 
const ID_BASE_PROGRAMAS = '15lwYAg7Oenr0zhG5v4hs0f0d4QVEfg5GBPfWcEGfpI4'; // This stays static usually

// Zoho Credentials
const ZOHO_USER = "alumno.we@we-educacion.com";
const ZOHO_PASS = "we.2023.we"; 

// Security Token (To prevent unauthorized access)
const API_SECRET = "CLAVE_SEGURA_WE_2026"; 

// ================= INITIALIZATION =================
const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    clientOptions: { http2: false }
});

const transporter = nodemailer.createTransport({
    host: "smtppro.zoho.com", 
    port: 465, 
    secure: true, 
    auth: { user: ZOHO_USER, pass: ZOHO_PASS },
});

let cacheProgramas = null;


// ================= API ENDPOINT (MODO ASÍNCRONO / FIRE & FORGET) =================
app.post('/api/send-emails', (req, res) => {
    // 1. Security Check
    const token = req.query.token; 
    if (token !== API_SECRET) {
        return res.status(403).json({ error: "Access Denied. Invalid Token." });
    }

    // 2. Get Sheet ID from Body
    const { sheetId } = req.body;
    
    if (!sheetId) {
        return res.status(400).json({ error: "Missing 'sheetId' in request body." });
    }

    console.log(`📩 Solicitud recibida para Sheet ID: ${sheetId}`);

    // 3. RESPONDER INMEDIATAMENTE AL CLIENTE (APPS SCRIPT)
    // Le decimos "OK, recibido" para que Apps Script cierre la conexión y sea feliz.
    res.json({ 
        success: true, 
        message: "Solicitud recibida. El envío de correos ha comenzado en segundo plano." 
    });

    // 4. EJECUTAR EL PROCESO EN SEGUNDO PLANO
    // NO usamos 'await' aquí para no bloquear la respuesta anterior.
    procesarEnvios48Horas(sheetId)
        .then(resultado => {
            console.log("✅ Proceso en background terminado:", resultado);
        })
        .catch(error => {
            console.error("❌ Error crítico en background:", error);
            // Aquí podrías agregar un envío de correo a ti mismo avisando que falló,
            // ya que Apps Script ya se desconectó y no se enterará del error.
        });
});

// ================= MAIN LOGIC (Refactored) =================
async function procesarEnvios48Horas(currentSheetId) {
    console.log(`🚀 Starting process for Sheet: ${currentSheetId}`);
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });
    let emailsSent = 0;

    // 1. READ SHEET '3. Aula'
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: currentSheetId, // Uses the ID sent via API
        range: '3. Aula!A:Z', 
    });
    
    const rows = res.data.values;
    if (!rows || !rows.length) return "Sheet is empty.";

    // COLUMNS MAPPING
    const COL = {
        curso: 0,    // A 
        fecha: 2,    // C 
        nombre: 4,   // E 
        correo: 6,   // G 
        wsp: 23,     // X 
        teams: 24,   // Y 
        check48h: 25 // Z 
    };

    console.log("📥 Loading programs database...");
    await cargarBaseProgramas(sheets);

    // PROCESS ROWS
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        
        if (!row[COL.nombre]) continue; 
        const estado48h = row[COL.check48h];
        
        if (estado48h !== "OK" && estado48h !== true && estado48h !== "TRUE") {
            
            const alumno = {
                nombre: row[COL.nombre],
                email: row[COL.correo],
                cursoCod: row[COL.curso],
                fechaRaw: row[COL.fecha], 
                linkWsp: row[COL.wsp],
                linkTeams: row[COL.teams],
                fila: i + 1
            };

            if (!alumno.email || !alumno.email.includes("@")) continue;

            console.log(`🔄 Processing: ${alumno.nombre}...`);

            try {
                // DATA GATHERING
                const infoPrograma = getInfoPrograma(alumno.cursoCod);
                const fechaTexto = formatearFecha(alumno.fechaRaw);
                
                // LINK VALIDATION
                const tieneWsp = alumno.linkWsp && alumno.linkWsp.includes("http");
                const tieneTeams = alumno.linkTeams && alumno.linkTeams.includes("http");

                if (!tieneWsp && !tieneTeams) {
                    console.log("   🛑 STOPPED: Missing links.");
                    continue; 
                }

                const linksObj = {
                    whatsapp: alumno.linkWsp,
                    teams: alumno.linkTeams
                };

                // HTML GENERATION
                const htmlContent = generarHtmlFinal(alumno, infoPrograma, linksObj);

                // SEND EMAIL
                await transporter.sendMail({
                    from: `"WE Educación Ejecutiva" <${ZOHO_USER}>`,
                    to: alumno.email,
                    subject: `🔔 Ya tienes todo listo para iniciar - W|E Educación Ejecutiva`,
                    html: htmlContent,
                });

                // UPDATE SHEET
                await sheets.spreadsheets.values.update({
                    spreadsheetId: currentSheetId,
                    range: `3. Aula!Z${alumno.fila}`,
                    valueInputOption: 'RAW',
                    resource: { values: [['OK']] },
                });

                console.log(`   ✅ Email sent successfully.`);
                emailsSent++;
                
                // Safety pause
                await new Promise(r => setTimeout(r, 2000)); 

            } catch (error) {
                console.error(`   ❌ Error with ${alumno.nombre}:`, error.message);
            }
        }
    }
    console.log("🏁 Process finished.");
    return `${emailsSent} emails sent.`;
}

// ================= HELPER FUNCTIONS =================

async function cargarBaseProgramas(sheets) {
    try {
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: ID_BASE_PROGRAMAS,
            range: 'Base Privada EN VIVO!A:K', 
        });
        cacheProgramas = {};
        if(res.data.values) {
            res.data.values.forEach(row => {
                if (row[3]) {
                    cacheProgramas[row[3].toString().trim()] = {
                        nombre: row[5],  
                        imagen: row[6],  
                        abreviatura: row[4]
                    };
                }
            });
        }
    } catch (e) {
        console.log("⚠️ Error loading programs DB.");
    }
}

function getInfoPrograma(cod) {
    if (!cod) return { nombre: "Tu Curso", imagen: "" };
    return cacheProgramas[cod.trim()] || { nombre: cod, imagen: "" };
}

function formatearFecha(fechaRaw) {
    if (!fechaRaw) return "Fecha por confirmar";
    return fechaRaw; 
}

function generarHtmlFinal(alumno, programa, links) {
    // Absolute paths
    const pathTemplate = path.join(__dirname, 'template_48h.html');
    const pathFooter = path.join(__dirname, 'footer.html');

    if (!fs.existsSync(pathTemplate)) {
        console.error("   ❌ CRITICAL ERROR: 'template_48h.html' not found");
        return "<h1>Error: Missing template.</h1>";
    }

    let template = fs.readFileSync(pathTemplate, 'utf8');
    let footer = "";
    
    try {
        if (fs.existsSync(pathFooter)) {
            footer = fs.readFileSync(pathFooter, 'utf8');
        }
    } catch (e) {}

    const primerNombre = alumno.nombre.split(" ")[0];

    // REPLACEMENTS
    let html = template
        .replace(/<\?= pDatos\.first_name \?>/g, primerNombre)
        .replace(/<\?= pPrograma\.imagen \?>/g, programa.imagen || "") 
        .replace(/<\?= pPrograma\.nombre \?>/g, programa.nombre)
        .replace(/<\?= pLinks\.teams \?>/g, links.teams || "#")
        .replace(/<\?= pLinks\.whatsapp \?>/g, links.whatsapp || "#")
        .replace(/<\?!= obtenerHtml\('Footer'\) \?>/g, footer);

    return html;
}
app.get('/health', (req, res) => {
    res.status(200).json({
        status: "ok",
        server: "WE Email VPS",
        time: new Date().toISOString()
    });
});

// ================= START SERVER =================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 API Server listening on port ${PORT}`);
});
