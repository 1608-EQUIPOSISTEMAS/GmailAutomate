const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

// Asegurar que la carpeta de logs existe
const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// Formato personalizado: [FECHA] [NIVEL]: Mensaje {Metadatos}
const customFormat = format.printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
        msg += ` | ${JSON.stringify(metadata)}`;
    }
    return msg;
});

// Configuración de rotación diaria (evita que el disco se llene)
const fileRotateTransport = new transports.DailyRotateFile({
    filename: path.join(logDir, 'app-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true, // Comprime logs viejos (.gzip)
    maxSize: '20m',      // Si un archivo llega a 20MB, crea otro
    maxFiles: '14d',     // Borra logs de más de 14 días automáticamente
    level: 'info'        // Guarda todo (info, warn, error)
});

// Configuración específica solo para errores
const errorRotateTransport = new transports.DailyRotateFile({
    filename: path.join(logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',     // Guardamos errores por 30 días
    level: 'error'
});

const logger = createLogger({
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        customFormat
    ),
    transports: [
        fileRotateTransport,
        errorRotateTransport,
        new transports.Console({ // También mostrar en consola
            format: format.combine(
                format.colorize(),
                customFormat
            )
        })
    ]
});

module.exports = logger;