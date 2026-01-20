# Usamos una imagen ligera de Node
FROM node:18-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos los archivos de dependencias primero para aprovechar la caché de Docker
COPY package*.json ./

# Instalamos las dependencias
RUN npm install --production

# Copiamos el resto del código (incluyendo carpetas credentials y templates)
COPY . .

# Exponemos el puerto que solicitaste
EXPOSE 4111

# Comando para iniciar la app
CMD ["node", "app.js"]