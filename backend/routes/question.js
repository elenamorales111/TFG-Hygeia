const express = require("express");
const router = express.Router();

const {
  Question,
  Patient,
  HumanDoctor,
  AIDoctor
} = require("../sequelize");

//Obtener todas las preguntas guardadas en la base de datos
router.get("/questions", async (req, res) => {

  try {

    const questions = await Question.findAll({
      include: [
        Patient,
        HumanDoctor,
        AIDoctor
      ]
    });

    res.json({
      ok: true,
      questions
    });

  } catch (err) {

    console.error("Ha ocurrido un error al obtener las preguntas:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});

//Obtener preguntas por id de paciente
router.get("/patients/:id/questions", async (req, res) => {

  try {

    const questions = await Question.findAll({
      where: {
        patient_id: req.params.id
      },
      include: [
        HumanDoctor,
        AIDoctor
      ]
    });

    res.json({
      ok: true,
      questions
    });

  } catch (err) {

    console.error("Ha ocurrido un error al obtener las preguntas:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});

//Crear pregunta
router.post("/questions", async (req, res) => {

  try {

    const question = await Question.create(req.body);

    res.status(201).json({
      ok: true,
      message: "Pregunta creada correctamente",
      question
    });

  } catch (err) {

    console.error("Ha ocurrido un error al crear la pregunta:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});

//Actualizar pregunta
router.put("/questions/:id", async (req, res) => {

  try {

    const question = await Question.findByPk(req.params.id);

    if (!question) {

      return res.status(404).json({
        ok: false,
        message: "Pregunta no encontrada"
      });

    }

    await question.update(req.body);

    res.json({
      ok: true,
      message: "Pregunta actualizada correctamente",
      question
    });

  } catch (err) {

    console.error("Ha ocurrido un error al actualizar la pregunta:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});

//Eliminar pregunta
router.delete("/questions/:id", async (req, res) => {

  try {

    const question = await Question.findByPk(req.params.id);

    if (!question) {

      return res.status(404).json({
        ok: false,
        message: "Pregunta no encontrada"
      });

    }

    await question.destroy();

    res.json({
      ok: true,
      message: "Pregunta eliminada correctamente"
    });

  } catch (err) {

    console.error("Ha ocurrido un error al eliminar la pregunta:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});

module.exports = router;