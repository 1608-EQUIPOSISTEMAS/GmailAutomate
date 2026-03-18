const nodemailer = require('nodemailer');
const { SMTP } = require('./env');

function createTransporter(apiKey) {
    return nodemailer.createTransport({
        host: SMTP.host,
        port: SMTP.port,
        secure: false,
        auth: {
            user: SMTP.user,
            pass: apiKey,
        },
    });
}

module.exports = {
    t48h:        createTransporter(SMTP.keys.k48h),
    t24h:        createTransporter(SMTP.keys.k24h),
    tPagos:      createTransporter(SMTP.keys.pagos),
    tSAP:        createTransporter(SMTP.keys.sap),
    tFicoProxima: createTransporter(SMTP.keys.ficoProxima),
};
