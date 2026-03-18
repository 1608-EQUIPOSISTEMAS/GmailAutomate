const express = require('express');
const bodyParser = require('body-parser');
const { PORT } = require('./config/env');
const templateEngine = require('./services/templateEngine');
const apiRoutes = require('./routes/index');

const app = express();

app.use(bodyParser.json({ limit: '10mb' }));

// Cargar todas las plantillas HTML en memoria antes de arrancar
templateEngine.loadAll();

app.use('/api', apiRoutes);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor listo en puerto ${PORT}`);
});
