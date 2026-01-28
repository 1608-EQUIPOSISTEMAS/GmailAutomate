const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4111;

// Middleware para procesar JSON
app.use(bodyParser.json());

// ================= CONFIGURACIÓN =================
const KEY_FILE = 'credentials/service.json'; 
const ID_BASE_PROGRAMAS = '15lwYAg7Oenr0zhG5v4hs0f0d4QVEfg5GBPfWcEGfpI4'; 

// Credenciales
const ZOHO_USER = "alumno.we@we-educacion.com"; // Este será el remitente
const API_SECRET = "CLAVE_SEGURA_WE_2026"; 

// ================= INICIALIZACIÓN =================
const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    clientOptions: { http2: false }
});

// --- AQUÍ ESTÁ EL CAMBIO IMPORTANTE (ZEPTOMAIL) ---
const transporter = nodemailer.createTransport({
    host: "smtp.zeptomail.com",
    port: 587,
    secure: false, // Se usa false para el puerto 587
    auth: {
        user: "emailapikey", // Siempre es este usuario
        // Esta es tu clave larga de ZeptoMail:
        pass: "wSsVR61y8xPyBvx1yjStL+1qnVUHAAz2REt/i1Kj73WvT6zD9scyxUCbDQWhGvQaGDNpQTYT8egumxoB0mEL2tkpzlsGXCiF9mqRe1U4J3x17qnvhDzNWm9fmhGLKIoKww1tn2hgE8ok+g=="
    },
});

let cacheProgramas = null;

// ================= API ENDPOINT =================
app.post('/api/send-emails', (req, res) => {
    // 1. Verificación de seguridad
    const token = req.query.token; 
    if (token !== API_SECRET) {
        return res.status(403).json({ error: "Access Denied. Invalid Token." });
    }

    // 2. Obtener ID de la hoja
    const { sheetId } = req.body;
    
    if (!sheetId) {
        return res.status(400).json({ error: "Missing 'sheetId' in request body." });
    }

    console.log(`📩 Solicitud recibida para Sheet ID: ${sheetId}`);

    // 3. RESPUESTA INMEDIATA (Para que Google Sheets no se quede cargando)
    res.json({ 
        success: true, 
        message: "Solicitud recibida. El envío rápido vía ZeptoMail ha comenzado." 
    });

    // 4. EJECUTAR PROCESO EN SEGUNDO PLANO
    procesarEnvios48Horas(sheetId)
        .then(resultado => {
            console.log("✅ Proceso terminado:", resultado);
        })
        .catch(error => {
            console.error("❌ Error en background:", error);
        });
});

async function procesarEnvios48Horas(currentSheetId) {
    console.log(`🚀 Iniciando proceso rápido para Sheet: ${currentSheetId}`);
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });
    let emailsSent = 0;

    // 1. LEER HOJA '3. Aula'
    // Nota: Cambiamos A:Z a A:W para leer solo lo necesario, aunque A:Z funciona igual.
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: currentSheetId,
        range: '3. Aula!A:W', 
    });
    
    const rows = res.data.values;
    if (!rows || !rows.length) return "Sheet is empty.";

    // MAPEO DE COLUMNAS ACTUALIZADO (U, V, W)
    const COL = {
        curso: 0,    // A 
        fecha: 2,    // C 
        nombre: 4,   // E 
        correo: 6,   // G 
        estado: 9,   // J 
        wsp: 20,     // U (Antes era 23)
        teams: 21,   // V (Antes era 24)
        check48h: 22 // W (Antes era 25)
    };

    console.log("📥 Cargando base de programas...");
    await cargarBaseProgramas(sheets);

    // PROCESAR FILAS
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        
        if (!row[COL.nombre]) continue; 

        // --- FILTRO DE SEGURIDAD ---
        if (row[COL.estado] !== "ACT") {
            continue; 
        }

        const estado48h = row[COL.check48h];
        
        // Solo procesar si NO dice "OK"
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

            console.log(`🔄 Procesando: ${alumno.nombre}...`);

            try {
                // PREPARAR DATOS
                const infoPrograma = getInfoPrograma(alumno.cursoCod);
                const fechaTexto = formatearFecha(alumno.fechaRaw);
                
                // VALIDAR LINKS
                const tieneWsp = alumno.linkWsp && alumno.linkWsp.includes("http");
                const tieneTeams = alumno.linkTeams && alumno.linkTeams.includes("http");

                if (!tieneWsp && !tieneTeams) {
                    console.log("   🛑 SALTADO: Faltan links.");
                    continue; 
                }

                const linksObj = {
                    whatsapp: alumno.linkWsp,
                    teams: alumno.linkTeams
                };

                // GENERAR HTML
                const htmlContent = generarHtmlFinal(alumno, infoPrograma, linksObj);

                // ENVIAR CORREO (Vía ZeptoMail)
                await transporter.sendMail({
                    from: `"WE Educación Ejecutiva" <${ZOHO_USER}>`,
                    to: alumno.email,
                    subject: `🔔 Ya tienes todo listo para iniciar - W|E Educación Ejecutiva`,
                    html: htmlContent,
                });

                // ACTUALIZAR GOOGLE SHEETS A "OK" (EN COLUMNA W)
                await sheets.spreadsheets.values.update({
                    spreadsheetId: currentSheetId,
                    range: `3. Aula!W${alumno.fila}`, // <--- CAMBIADO A W
                    valueInputOption: 'RAW',
                    resource: { values: [['OK']] },
                });

                console.log(`   ✅ Enviado con éxito.`);
                emailsSent++;
                
                // PAUSA MÍNIMA
                await new Promise(r => setTimeout(r, 1000)); 

            } catch (error) {
                console.error(`   ❌ Error con ${alumno.nombre}:`, error.message);
                await new Promise(r => setTimeout(r, 5000));
            }
        }
    }
    console.log("🏁 Proceso finalizado.");
    return `${emailsSent} emails sent.`;
}
// ================= FUNCIONES AUXILIARES =================

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
        console.log("⚠️ Error cargando DB programas.");
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
    const pathTemplate = path.join(__dirname, 'template_48h.html');
    const pathFooter = path.join(__dirname, 'footer.html');

    if (!fs.existsSync(pathTemplate)) {
        console.error("   ❌ ERROR CRÍTICO: No se encuentra 'template_48h.html'");
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

    // REEMPLAZOS
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
        status: "ok ZeptoMail Active",
        server: "WE Email VPS",
        time: new Date().toISOString()
    });
});

// ================= INICIAR SERVIDOR =================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 API Server escuchando en puerto ${PORT}`);
});