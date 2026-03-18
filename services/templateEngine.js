const fs = require('fs');
const path = require('path');

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

const templates = {};
const partials = {};

function loadAll() {
    const files = fs.readdirSync(TEMPLATES_DIR).filter(f => f.endsWith('.html'));
    for (const file of files) {
        const name = path.basename(file, '.html');
        const content = fs.readFileSync(path.join(TEMPLATES_DIR, file), 'utf8');
        if (name.startsWith('_')) {
            partials[name] = content;
        } else {
            templates[name] = content;
        }
    }
    console.log(`✅ Plantillas cargadas: [${Object.keys(templates).join(', ')}]`);
    console.log(`✅ Partials cargados:   [${Object.keys(partials).join(', ')}]`);
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Renderiza una plantilla reemplazando variables y partials.
 * @param {string} name - Nombre del archivo sin extensión (ej: 'welcome_24h')
 * @param {Object} vars - Claves como 'pDatos.nombre', valores como strings
 * @returns {string} HTML final
 */
function render(name, vars = {}) {
    const template = templates[name];
    if (!template) throw new Error(`Template "${name}" no encontrado. Disponibles: ${Object.keys(templates).join(', ')}`);

    let html = template;

    // Reemplazar variables estándar <?= key ?>
    for (const [key, value] of Object.entries(vars)) {
        const pattern = new RegExp(`<\\?= ${escapeRegex(key)} \\?>`, 'g');
        html = html.replace(pattern, value ?? '');
    }

    // Inyectar partials automáticamente
    html = html
        .replace(/<\?!= obtenerHtml\('Footer'\) \?>/g, partials['_footer'] || '')
        .replace(/<\?!= obtenerHtml\('footer'\) \?>/g, partials['_sello_fico'] || '');

    return html;
}

function getTemplate(name) {
    return templates[name] || null;
}

module.exports = { loadAll, render, getTemplate };
