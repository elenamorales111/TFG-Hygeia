require("dotenv").config();

//Comprobación de que .env tiene todas sus variables definidas
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'GEMINI_API_KEY'
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Falta la variable ${envVar} en el archivo .env`);
  }
});


const app = require("./app");
const { sequelize } = require("./sequelize");
const { seedAll } = require("./seed");

const PORT = process.env.PORT || 3000;

//Sincronizar base de datos y arrancar el servidor
sequelize.sync().then(async () => {

  console.log("Hygeia database synchronized");
  
  await seedAll();

  app.listen(PORT, () => {

    console.log(`Hygeia server listening on http://localhost:${PORT}`);

  });

}).catch((error) => {

  console.error("Database synchronization error:", error);

});