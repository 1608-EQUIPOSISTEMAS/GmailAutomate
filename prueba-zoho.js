const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// ================= CONFIGURACIÓN =================
const KEY_FILE = 'credentials/service.json'; 
const ID_HOJA_REGISTRO = '1Y0Jz7Yrekx152qRV7WXdu5Fb_NNtkB0aSVQbyJJ46so'; 
const ID_BASE_PROGRAMAS = '15lwYAg7Oenr0zhG5v4hs0f0d4QVEfg5GBPfWcEGfpI4';

// Credenciales ZOHO
const ZOHO_USER = "alumno.we@we-educacion.com";
const ZOHO_PASS = "we.2023.we"; 

// ================= INICIALIZACIÓN =================
const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    // Mantenemos esto para evitar bloqueos en Windows
    clientOptions: {
        http2: false 
    }
});

const transporter = nodemailer.createTransport({
    host: "smtppro.zoho.com", 
    port: 465, 
    secure: true, 
    auth: { user: ZOHO_USER, pass: ZOHO_PASS },
});

let cacheProgramas = null;

// ================= LÓGICA PRINCIPAL =================
async function procesarEnvios48Horas() {
    console.log("🚀 Iniciando proceso 48h (Hoja: 3. Aula)...");
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    // 1. LEER HOJA '3. Aula'
    // Leemos hasta la columna Z (donde está el check 48h)
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: ID_HOJA_REGISTRO,
        range: '3. Aula!A:Z', 
    });
    
    const rows = res.data.values;
    if (!rows || !rows.length) return console.log("Hoja vacía.");

    // MAPEO DE COLUMNAS (Índices empiezan en 0)
    // A=0, B=1, C=2 ... E=4 ... G=6 ... X=23, Y=24, Z=25
    const COL = {
        curso: 0,    // A - Código del Curso (para buscar la imagen)
        fecha: 2,    // C - Fecha Inicio
        nombre: 4,   // E - Nombres y Apellidos
        correo: 6,   // G - Correo
        wsp: 23,     // X - Link WhatsApp
        teams: 24,   // Y - Link Teams
        check48h: 25 // Z - Check 48h
    };

    console.log("📥 Cargando base de imágenes de programas...");
    await cargarBaseProgramas(sheets);

    //console.log(cacheProgramas)

    // PROCESAR FILAS (Empezamos en i=1 para saltar encabezados)
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        
        // Validar que haya nombre
        if (!row[COL.nombre]) continue; 
        
        const estado48h = row[COL.check48h];
        
        // Si NO está marcado como OK o TRUE, procesamos
        if (estado48h !== "OK" && estado48h !== true && estado48h !== "TRUE") {
            
            const alumno = {
                nombre: row[COL.nombre],
                email: row[COL.correo],
                cursoCod: row[COL.curso],
                fechaRaw: row[COL.fecha], // Ej: 21/01/2026
                linkWsp: row[COL.wsp],
                linkTeams: row[COL.teams],
                fila: i + 1
            };

            // Validaciones básicas de correo
            if (!alumno.email || !alumno.email.includes("@")) {
                continue;
            }

            console.log(`🔄 Procesando: ${alumno.nombre}...`);

            try {
                // A. OBTENER DATOS DEL PROGRAMA (Imagen, Nombre completo)
                // Usamos la Columna A (Curso) para buscar en la base de datos
                const infoPrograma = getInfoPrograma(alumno.cursoCod);

                // B. FORMATEAR FECHA (De "21/01/2026" a texto bonito)
                const fechaTexto = formatearFecha(alumno.fechaRaw);

                // C. VALIDAR LINKS (Directos de la hoja)
                const tieneWsp = alumno.linkWsp && alumno.linkWsp.includes("http");
                const tieneTeams = alumno.linkTeams && alumno.linkTeams.includes("http");

                console.log(`   📝 Curso: ${infoPrograma.nombre || alumno.cursoCod} | Inicio: ${fechaTexto}`);
                console.log(`   🔗 Links Hoja: WSP=${tieneWsp ? '✅' : '❌'} | Teams=${tieneTeams ? '✅' : '❌'}`);

                // SEGURIDAD: SI NO HAY LINKS EN LA HOJA, NO ENVIAR
                if (!tieneWsp && !tieneTeams) {
                    console.log("   🛑 DETENIDO: Faltan links en las columnas X o Y.");
                    continue; 
                }

                // D. PREPARAR OBJETO LINKS PARA EL HTML
                const linksObj = {
                    whatsapp: alumno.linkWsp,
                    teams: alumno.linkTeams
                };

                //imprimir contenido que habra
                console.log(`   ✉️ Enviando correo a: ${alumno.email}`);
                console.log(`   🖼️ Imagen: ${infoPrograma.imagen}`)
                console.log(`   👤 Alumno: ${alumno.nombre} | Fila: ${alumno.fila}`)
                console.log(`   🔗 Links a enviar: WhatsApp=${linksObj.whatsapp} | Teams=${linksObj.teams}`);
                
                // E. GENERAR HTML
                const htmlContent = generarHtmlFinal(alumno, infoPrograma, linksObj);

                // F. ENVIAR CORREO
                await transporter.sendMail({
                    from: `"WE Educación Ejecutiva" <${ZOHO_USER}>`,
                    to: alumno.email,
                    subject: `Faltan 48h: Accesos para tu clase de ${infoPrograma.nombre}`,
                    html: htmlContent,
                });

                // G. ACTUALIZAR COLUMNA Z (48h) a "OK"
                await sheets.spreadsheets.values.update({
                    spreadsheetId: ID_HOJA_REGISTRO,
                    // Columna Z es la letra Z
                    range: `3. Aula!Z${alumno.fila}`,
                    valueInputOption: 'RAW',
                    resource: { values: [['OK']] },
                });

                console.log(`   ✅ Correo enviado exitosamente.`);
                
                // Pausa de seguridad para Zoho (2 segundos)
                await new Promise(r => setTimeout(r, 2000)); 

            } catch (error) {
                console.error(`   ❌ Error:`, error.message);
            }
        }
    }
    console.log("🏁 Proceso finalizado.");
}

// ================= FUNCIONES AUXILIARES =================

// Carga la base de datos de programas para sacar la IMAGEN y el NOMBRE COMPLETO
async function cargarBaseProgramas(sheets) {
    try {
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: ID_BASE_PROGRAMAS,
            range: 'Base Privada EN VIVO!A:K', 
        });
        cacheProgramas = {};
        if(res.data.values) {
            res.data.values.forEach(row => {
                // row[3] es el CÓDIGO (Ej: EX-CZ-02)
                if (row[3]) {
                    cacheProgramas[row[3].toString().trim()] = {
                        nombre: row[5],  // Nombre bonito del curso
                        imagen: row[6],  // URL del banner
                        abreviatura: row[4]
                    };
                }
            });
        }
    } catch (e) {
        console.log("⚠️ Error cargando base de programas. Se usarán datos por defecto.");
    }
}

function getInfoPrograma(cod) {
    if (!cod) return { nombre: "Tu Curso", imagen: "" };
    return cacheProgramas[cod.trim()] || { nombre: cod, imagen: "" };
}

function formatearFecha(fechaRaw) {
    if (!fechaRaw) return "Fecha por confirmar";
    // Si ya viene bonita, la devolvemos
    return fechaRaw; 
}

function generarHtmlFinal(alumno, programa, links) {
    console.log("   📂 Leyendo plantillas HTML...");
    
    // Rutas absolutas
    const pathTemplate = path.join(__dirname, 'template_48h.html');
    const pathFooter = path.join(__dirname, 'footer.html');

    if (!fs.existsSync(pathTemplate)) {
        console.error("   ❌ ERROR CRÍTICO: No encuentro 'template_48h.html'");
        return "<h1>Error: Falta template.</h1>";
    }

    let template = fs.readFileSync(pathTemplate, 'utf8');
    let footer = "";
    
    try {
        if (fs.existsSync(pathFooter)) {
            footer = fs.readFileSync(pathFooter, 'utf8');
        }
    } catch (e) {}

    // DIAGNÓSTICO
    if (template.length < 10) console.error("   ❌ ALERTA: El HTML está vacío.");

    const primerNombre = alumno.nombre.split(" ")[0];

    console.log("   🔄 Reemplazando variables...");

    // === CORRECCIÓN AQUÍ ===
    // Usamos \ antes de ? y . para que los encuentre literalmente
    let html = template
        .replace(/<\?= pDatos\.first_name \?>/g, primerNombre)
        .replace(/<\?= pPrograma\.imagen \?>/g, programa.imagen || "") 
        .replace(/<\?= pPrograma\.nombre \?>/g, programa.nombre)
        .replace(/<\?= pLinks\.teams \?>/g, links.teams || "#")
        .replace(/<\?= pLinks\.whatsapp \?>/g, links.whatsapp || "#")
        // El footer ya lo tenías bien escapado, pero lo dejo por si acaso
        .replace(/<\?!= obtenerHtml\('Footer'\) \?>/g, footer);

    return html;
}

// Ejecutar
procesarEnvios48Horas();