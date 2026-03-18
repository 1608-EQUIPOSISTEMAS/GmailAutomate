// Envío masivo directo (sin endpoint API dedicado para online)
// No requiere servidor corriendo
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const nodemailer = require('nodemailer');
const fs   = require('fs');
const path = require('path');

const alumnos = [
    { email: 'kimberly.mayta@outlook.es' },
    { email: 'blanca.portales.chavarria@gmail.com' },
    { email: 'jhairbenites97@gmail.com' },
    { email: 'dantec200@gmail.com' },
    { email: 'nora71824376@gmail.com' },
    { email: 'anthuane.yr@gmail.com' },
    { email: 'pancitafelizfood0@gmail.com' },
    { email: 'leonardo.israel2015@gmail.com' },
    { email: 'criss.diaz1@unmsm.edu.pe' },
    { email: 'matias09zarate04@gmail.com' },
    { email: 'roberto777ab@gmail.com' },
    { email: 'renzovilcasimpe@hotmail.com' },
    { email: 'kanameto_14196@hotmail.com' },
    { email: 'miguel.fajardo.fm@gmail.com' },
    { email: 'jaimenscp35@gmail.com' },
    { email: 'diegobladimirfloreshernanadez@gmail.com' },
    { email: 'alan.casme@gmail.com' },
    { email: 'isaac_valderrama@outlook.com' },
    { email: 'jor.gut.102@gmail.com' },
    { email: 'josedavidmc99@gmail.com' },
    { email: 'viviana.vilchez@unmsm.edu.pe' },
    { email: 'jordan.antoni96@gmail.com' },
    { email: 'luisfernando.63279646@gmail.com' },
    { email: 'zapatagodinez@yahoo.com' },
    { email: 'dchavezcotera@gmail.com' },
    { email: 'hector.yovera@pucp.edu.pe' },
    { email: 'marshellliann18@gmail.com' },
    { email: 'arianqg1@hotmail.com' },
    { email: 'jorgeandresindustrialsupply@gmail.com' },
    { email: 'gianellaturin7@gmail.com' },
    { email: 'williams.ruiz30@gmail.com' },
    { email: 'jose.muguruza1@unmsm.edu.pe' },
    { email: 'ted123132@gmail.com' },
    { email: 'leny.chavarria.r@gmail.com' },
    { email: 'emplindacg@gmail.com' },
    { email: 'janelhuanca@gmail.com' },
    { email: 'maycoln.diaz@gmail.com' },
    { email: 'alexandrabenavente10@gmail.com' },
    { email: 'katherinevarillas255@gmail.com' },
    { email: 'felixflorezchoque@gmail.com' },
    { email: 'jose1valle17@gmail.com' },
    { email: 'cristian.martinez.p22@gmail.com' },
    { email: 'anghellodiaz@hotmail.com' },
    { email: 'luisflm456@gmail.com' },
    { email: 'jportocarrerosistemas@gmail.com' },
    { email: 'myvnoly@gmail.com' },
    { email: 'crsy13@hotmail.com' },
    { email: 'jover.huaman@pucp.pe' },
    { email: 'ingridfloray3@gmail.com' },
    { email: 'josephbejarano01@gmail.com' },
    { email: '20100330@ue.edu.pe' },
    { email: 'moisesayclq@gmail.com' },
    { email: 'mhidalgopalacios.mahp@gmail.com' },
    { email: 'sebastianfiestas10@gmail.com' },
    { email: 'george.catter.gca@gmail.com' },
    { email: 'alejandracuadroscabrera@gmail.com' },
    { email: 'jeanncarloscm2895@gmail.com' },
    { email: 'joshua1987_17@hotmail.com' },
    { email: 'richardpacco14@gmail.com' },
    { email: 'vanessamedinac123@gmail.com' },
    { email: 'kaorimillarodriguez@gmail.com' },
    { email: 'bcordova@unsa.edu.pe' },
    { email: 'eckner.lopez7@gmail.com' },
    { email: 'mariamedrano5@outlook.es' },
    { email: 'rguerreroquiroga1@gmail.com' },
    { email: 'vivienmichelle.23@gmail.com' },
    { email: 'alexisespinoza808@gmail.com' },
    { email: 'pilar_21_95@hotmail.com' },
    { email: 'jennermds281026@gmail.com' },
    { email: 'mavez2023@gmail.com' },
    { email: 'jcuadrosd2019@gmail.com' },
    { email: 'luislozano200427@gmail.com' },
    { email: 'luqui_lqv.8@hotmail.com' },
    { email: 'maya.monte18@hotmail.com' },
    { email: 'yeniferpilar@gmail.com' },
    { email: 'mvzr.rojas@gmail.com' },
    { email: 'diego.olarteb21@gmail.com' },
    { email: 'yorwijunior@hotmail.com' },
    { email: 'nixon.70132671@gmail.com' },
    { email: 'anghelocmpucp@gmail.com' },
    { email: 'kef45678@gmail.com' },
    { email: 'margiori1497@gmail.com' },
    { email: 'gc.catherine.rojas@gmail.com' },
    { email: 'argelythzpmendoza@gmail.com' },
    { email: 'landa.ramon.roberto@gmail.com' },
    { email: 'fersmart1001@gmail.com' },
    { email: 'ia.allison.we@gmail.com' },
    { email: 'jlatorrelara24@gmail.com' },
    { email: 'isabeljimenezva@gmail.com' },
    { email: 'efra2204@outlook.com.pe' },
    { email: 'gacaanthony@gmail.com' },
    { email: 'valram.070699@gmail.com' },
    { email: 'brandonsagitario5@gmail.com' },
    { email: 'ammyjasmin@gmail.com' },
    { email: 'ktrina.2606@gmail.com' },
    { email: 'leonardoolivaresluzclarita@gmail.com' },
    { email: 'ale19co@gmail.com' },
    { email: 'y.mere@pucp.edu.pe' },
    { email: 'miremorilla@gmail.com' },
    { email: 'riverosverabetsy@gmail.com' },
    { email: 'josephfloresvillaverde@gmail.com' },
];

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_KEY_48H,
    },
});

async function run() {
    const templatePath = path.join(__dirname, '..', 'templates', 'online.html');

    if (!fs.existsSync(templatePath)) {
        console.error('❌ Falta templates/online.html');
        process.exit(1);
    }

    const htmlFinal = fs.readFileSync(templatePath, 'utf8');
    console.log(`🚀 Enviando a ${alumnos.length} alumnos...`);

    let sentCount = 0, errorCount = 0;

    for (const alumno of alumnos) {
        try {
            await transporter.sendMail({
                from:    `"WE Educación Ejecutiva" <${process.env.SENDER_GENERAL}>`,
                to:      alumno.email,
                subject: '🎓 ¡Última oportunidad para certificarte en SAP MM: Módulo Logístico Online!',
                html:    htmlFinal,
            });
            console.log(`   ✅ Enviado a: ${alumno.email}`);
            sentCount++;
            await new Promise(r => setTimeout(r, 100));
        } catch (err) {
            console.error(`   ❌ Error en ${alumno.email}:`, err.message);
            errorCount++;
        }
    }

    console.log(`\n🏁 Finalizado. Enviados: ${sentCount} | Errores: ${errorCount}`);
}

run();
