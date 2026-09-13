const express = require("express");
const router = express.Router();

const {
  Patient,
  MedicalRecord,
  MedicalAppointment,
  Medication,
  Question,
} = require("../sequelize");

//Obtener todos los pacientes guardados en la base de datos
router.get("/patients", async (req, res) => {
	
  try {
	  
    const patients = await Patient.findAll();

/*Backend envia la respuesta al Frontend en formato JSON para
decirle que se han encontrado pacientes y enviarle la lista patients*/
    res.json({
      ok: true,
      patients
    });
	
  } catch (err) {
	  
    console.error("Ha ocurrido un error al obtener los pacientes:", err);
	
    res.status(500).json({ 
		ok: false, 
		error: err.message
		});
  }
});

//Obtener pacientes por id
router.get("/patients/:id", async (req, res) => {
  try {
	  
    const patient = await Patient.findByPk(req.params.id, {
      include: [
        MedicalRecord,
        MedicalAppointment,
        Medication,
        Question,
      ],
    });

    if (!patient) {
		
      return res.status(404).json({
        ok: false,
        message: "Paciente no encontrado"
      });
    }

    res.json({
      ok: true,
      patient
    });
	
  } catch (err) {
	  
    console.error("Ha ocurrido un error al obtener los pacientes por id:", err);
	
    res.status(500).json({ 
		ok: false, 
		error: err.message 
	});
	
  }
});

//Crear paciente
router.post("/patients", async (req, res) => {
  try {
	  
    const patient = await Patient.create(req.body);

    res.status(201).json({
      ok: true,
      message: "Paciente creado correctamente",
      patient
    });
	
  } catch (err) {
	  
    console.error("Ha ocurrido un error al crear los pacientes:", err);
	
    res.status(500).json({ 
		ok: false, 
		error: err.message 
		
		});
	
  }
});

//Actualizar paciente
router.put("/patients/:id", async (req, res) => {
	
  try {
	  
    const patient = await Patient.findByPk(req.params.id);

    if (!patient) {
		
      return res.status(404).json({
        ok: false,
        message: "Paciente no encontrado"
      });
    }

    await patient.update(req.body);

    res.json({
      ok: true,
      message: "Paciente actualizado correctamente",
      patient
    });
	
  } catch (err) {
	  
    console.error("Ha ocurrido un error al actualizar paciente:", err);
	
    res.status(500).json({ 
		ok: false, 
		error: err.message 
	});
  }
});

//Eliminar paciente
router.delete("/patients/:id", async (req, res) => {
	
  try {
	  
    const patient = await Patient.findByPk(req.params.id);

    if (!patient) {
		
      return res.status(404).json({
        ok: false,
        message: "Paciente no encontrado"
      });
	  
    }

    await patient.destroy();

    res.json({
      ok: true,
      message: "Paciente eliminado correctamente"
    });
	
  } catch (err) {
	  
    console.error("Ha ocurrido un error al eliminar paciente:", err);
	
    res.status(500).json({ 
		ok: false, 
		error: err.message 
	});
  }
});

//Guardar consentimiento de términos y condiciones de uso en HygeIA
router.put("/patients/:id/ai-consent", async (req, res) => {

  try {

    const patient = await Patient.findByPk(req.params.id);

    if (!patient) {
      return res.status(404).json({
        ok: false,
        message: "Paciente no encontrado"
      });
    }

    await patient.update({
      aiMedicalConsent: req.body.aiMedicalConsent
    });

    res.json({
      ok: true,
      aiMedicalConsent: patient.aiMedicalConsent
    });

  } catch (err) {

    res.status(500).json({
      ok: false,
      message: "Error al guardar el consentimiento",
      error: err.message
    });

  }

});

//Obtener consentimiento de uso de datos médicos
router.get("/patients/:id/ai-consent", async (req, res) => {

  try {

    const patient = await Patient.findByPk(req.params.id);

    if (!patient) {
      return res.status(404).json({
        ok: false,
        message: "Paciente no encontrado"
      });
    }

    res.json({
      ok: true,
      aiMedicalConsent: patient.aiMedicalConsent
    });

  } catch (err) {

    res.status(500).json({
      ok: false,
      message: "Error al obtener el consentimiento",
      error: err.message
    });

  }

});

module.exports = router;