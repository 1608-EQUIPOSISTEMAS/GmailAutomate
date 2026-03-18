require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 4111,
    API_SECRET: process.env.API_SECRET || 'CLAVE_SEGURA_WE_2026',
    SENDER_GENERAL: process.env.SENDER_GENERAL || 'alumno.we@we-educacion.com',
    SENDER_PAGOS: process.env.SENDER_PAGOS || 'pagos@we-educacion.com',
    SMTP: {
        host: process.env.SMTP_HOST || 'smtp.zeptomail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        user: process.env.SMTP_USER || 'emailapikey',
        keys: {
            k48h:        process.env.SMTP_KEY_48H,
            k24h:        process.env.SMTP_KEY_24H,
            pagos:       process.env.SMTP_KEY_PAGOS,
            advertencia: process.env.SMTP_KEY_ADVERTENCIA,
            sap:         process.env.SMTP_KEY_SAP,
            ficoProxima: process.env.SMTP_KEY_FICO_PROXIMA,
        },
    },
};
