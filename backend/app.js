const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

const rootDir = path.join(__dirname, "..");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
  extended: true,
}));
app.use(express.static(rootDir));


app.get("/", (req, res) => {

  res.sendFile(path.join(rootDir, "index.html"));

});

//Ruta de prueba para comprobar que el servidor de la aplicación funciona
app.get("/api/check", (req, res) => {

  res.json({
    ok: true,
    app: "Hygeia",
  });

});

app.get("/login", (req, res) => {

  res.sendFile(path.join(rootDir, "login.html"));

});

app.get("/register", (req, res) => {

  res.sendFile(path.join(rootDir, "register.html"));

});

app.get("/home", (req, res) => {

  res.sendFile(path.join(rootDir, "home.html"));

});


app.use("/api", require("./routes/authentication"));
app.use("/api", require("./routes/patient"));
app.use("/api", require("./routes/medicalRecord"));
app.use("/api", require("./routes/medicalAppointment"));
app.use("/api", require("./routes/medication"));
app.use("/api", require("./routes/question"));
app.use("/api", require("./routes/doctor"));
app.use("/api", require("./routes/realDoctorAppointment"));
app.use("/api", require("./routes/aiDoctor"));

module.exports = app;