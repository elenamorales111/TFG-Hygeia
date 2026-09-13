HYGEIA

Hygeia es un portal de paciente creado como Trabajo de Fin de Grado de la carrera Ingeniería Biomédica. Esta aplicación 
ha sido creada principalmente para que los usuarios hagan un seguimiento diario de sus citas médicas, medicamentos, cuestionarios
de como vivir siguiendo hábitos más saludables y consulten a un chat de inteligencia artificial sus dudas sanitarias.


- INSTALACIÓN



Para instalar la aplicación realiza los siguientes pasos:

1. Crea una carpeta para guardar el proyecto
2. Entra en ella desde la terminal y clona el repositorio:

```
git clone https://github.com/elenamorales111/TFG-Hygeia.git
```

3. Escribe en tu terminal:

```
cd TFG-Hygeia
npm install
cd backend
npm install
   ```



- CREAR ARCHIVO .ENV



Crear un .env en la carpeta de backend con las siguientes variables:

    NODE_ENV=development
    
    RUN_SEED=true
   
    PORT=3000
   
    GEMINI_API_KEY=
 

La variable GEMINI_API_KEY debes igualarla a la clave API de Google AI Studio que esté asociada a tu
cuenta de Google.




- BASE DE DATOS



La base de datos se inicializa con un archivo seed.js. Para ejecutarlo, debes escribir en tu terminal:

```
cd backend 
node seed.js
```



- EJECUTAR APLICACIÓN



Para ejecutar el servidor, debes escribir en tu terminal:

```
cd backend  
node server.js
```

Finalmente, abre http://localhost:3000 en tu navegador para usar la página web
