const host = process.env.API_HOST || 'http://localhost:4111';

module.exports = {
    BASE:  `${host}/api`,
    TOKEN: process.env.API_SECRET || 'CLAVE_SEGURA_WE_2026',
};
