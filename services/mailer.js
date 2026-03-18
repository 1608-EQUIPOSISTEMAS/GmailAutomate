const delay = (ms) => new Promise(r => setTimeout(r, ms));

/**
 * Envía un email individual.
 * @param {object} transporter - Transporter de Nodemailer
 * @param {object} mailOpts    - Opciones de nodemailer (from, to, subject, html)
 */
async function sendSingle(transporter, mailOpts) {
    await transporter.sendMail(mailOpts);
}

/**
 * Envía emails a un array de destinatarios con rate limiting de 100ms.
 * @param {object[]} items         - Array de objetos (cada uno debe tener .email)
 * @param {Function} getMailOpts   - fn(item) → { transporter, mail: {from,to,subject,html}, label }
 * @returns {{ sentCount: number, errorCount: number }}
 */
async function sendBatch(items, getMailOpts) {
    let sentCount = 0;
    let errorCount = 0;

    for (const item of items) {
        try {
            const { transporter, mail, label } = getMailOpts(item);
            await transporter.sendMail(mail);
            console.log(`   ✅ (${label}) Enviado a: ${mail.to}`);
            sentCount++;
            await delay(100);
        } catch (err) {
            console.error(`   ❌ Error enviando a ${item.email}:`, err.message);
            errorCount++;
        }
    }

    return { sentCount, errorCount };
}

module.exports = { sendSingle, sendBatch };
