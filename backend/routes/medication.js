const express = require("express");
const router = express.Router();

const {
  Medication,
  Patient,
  MedicalRecord
} = require("../sequelize");

//Obtener toda la medicación guardada en la base de datos
router.get("/medications", async (req, res) => {

  try {

    const medications = await Medication.findAll({
      include: [Patient]
    });

    res.json({
      ok: true,
      medications
    });

  } catch (err) {

    console.error("Ha ocurrido un error al obtener la medicación:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});

//Obtener medicación por id de paciente
router.get("/patients/:id/medications", async (req, res) => {

  try {

    const medications = await Medication.findAll({
      where: {
        patient_id: req.params.id
      }
    });

    res.json({
      ok: true,
      medications
    });

  } catch (err) {

    console.error("Ha ocurrido un error al obtener la medicación:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});

//Obtener pacientes cuyo médico de cabecera es este doctor
router.get("/doctors/:id/family-doctor-patients", async (req, res) => {

  try {

    const patients = await Patient.findAll({
      include: [
        {
          model: MedicalRecord,
          where: {
            familyDoctor_id: req.params.id
          }
        }
      ]
    });

    res.json({
      ok: true,
      patients
    });

  } catch (err) {

    console.error("Error al obtener pacientes del médico de cabecera:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});

//Crear medicación
router.post("/medications", async (req, res) => {

  try {

    const medication = await Medication.create(req.body);

    res.status(201).json({
      ok: true,
      message: "Medicación creada correctamente",
      medication
    });

  } catch (err) {

    console.error("Ha ocurrido un error al crear la medicación:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});

//Actualizar medicación
router.put("/medications/:id", async (req, res) => {

  try {

    const medication = await Medication.findByPk(req.params.id);

    if (!medication) {

      return res.status(404).json({
        ok: false,
        message: "Medicación no encontrada"
      });

    }

    await medication.update(req.body);

    res.json({
      ok: true,
      message: "Medicación actualizada correctamente",
      medication
    });

  } catch (err) {

    console.error("Ha ocurrido un error al actualizar la medicación:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});

//Eliminar medicación
router.delete("/medications/:id", async (req, res) => {

  try {

    const medication = await Medication.findByPk(req.params.id);

    if (!medication) {

      return res.status(404).json({
        ok: false,
        message: "Medicación no encontrada"
      });

    }

    await medication.destroy();

    res.json({
      ok: true,
      message: "Medicación eliminada correctamente"
    });

  } catch (err) {

    console.error("Ha ocurrido un error al eliminar la medicación:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});

module.exports = router;