const express = require("express");
const router = express.Router();

const {
  MedicalRecord,
  Patient,
  HumanDoctor,
  Doctor
} = require("../sequelize");



//Obtener todas las fichas médicas guardadas en la base de datos
router.get("/medical-records", async (req, res) => {

  try {

    const medicalRecords = await MedicalRecord.findAll({
      include: [Patient]
    });

    res.json({
      ok: true,
      medicalRecords
    });

  } catch (err) {

    console.error("Ha ocurrido un error al obtener las fichas médicas:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});

//Obtener ficha médica por id de paciente
router.get("/patients/:id/medical-record", async (req, res) => {

  try {

    const medicalRecord = await MedicalRecord.findOne({
      where: {
        patient_id: req.params.id
      },
      include: [Patient]
    });

    if (!medicalRecord) {

      return res.status(404).json({
        ok: false,
        message: "Ficha médica no encontrada"
      });

    }

    res.json({
      ok: true,
      medicalRecord
    });

  } catch (err) {

    console.error("Ha ocurrido un error al obtener la ficha médica:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});


//Rellenar los ids de los médicos de cabecera
router.put("/medical-records/fill-family-doctor-ids", async (req, res) => {

  try {

    const medicalRecords = await MedicalRecord.findAll();

    //Contador que servirá para ver cuántas fichas se han corregido
    let updatedRecords = 0;

    //Recorrer fichas médicas
    for (const medicalRecord of medicalRecords) {

      /*Comprobar si a la ficha médica le falta el id del médico de cabecera
	  pero si que tiene su nombre*/
      if (!medicalRecord.familyDoctor_id && medicalRecord.familyDoctor) {

        //Si le falta, busca su id y lo pone en el body
        const completedBody =
          await completeFamilyDoctorId(medicalRecord.toJSON());

        if (completedBody.familyDoctor_id) {

         //Actualizar ficha médica
          await medicalRecord.update({
            familyDoctor_id: completedBody.familyDoctor_id
          });

          updatedRecords++;

        }

      }

    }

    res.json({
      ok: true,
      message: "familyDoctor_id rellenado automáticamente",
      updatedRecords
    });

  } catch (err) {

    console.error("Error rellenando familyDoctor_id:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});

//Crear ficha médica
router.post("/medical-records", async (req, res) => {

  try {

    const medicalRecordBody = await completeFamilyDoctorId(req.body);

	const medicalRecord = await MedicalRecord.create(medicalRecordBody);

    res.status(201).json({
      ok: true,
      message: "Ficha médica creada correctamente",
      medicalRecord
    });

  } catch (err) {

    console.error("Ha ocurrido un error al crear la ficha médica:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});

//Actualizar ficha médica
router.put("/medical-records/:id", async (req, res) => {

  try {

    const medicalRecord = await MedicalRecord.findByPk(req.params.id);

    if (!medicalRecord) {

      return res.status(404).json({
        ok: false,
        message: "Ficha médica no encontrada"
      });

    }

    const medicalRecordBody = await completeFamilyDoctorId(req.body);

	await medicalRecord.update(medicalRecordBody);

    res.json({
      ok: true,
      message: "Ficha médica actualizada correctamente",
      medicalRecord
    });

  } catch (err) {

    console.error("Ha ocurrido un error al actualizar la ficha médica:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});

//Eliminar ficha médica
router.delete("/medical-records/:id", async (req, res) => {

  try {

    const medicalRecord = await MedicalRecord.findByPk(req.params.id);

    if (!medicalRecord) {

      return res.status(404).json({
        ok: false,
        message: "Ficha médica no encontrada"
      });

    }

    await medicalRecord.destroy();

    res.json({
      ok: true,
      message: "Ficha médica eliminada correctamente"
    });

  } catch (err) {

    console.error("Ha ocurrido un error al eliminar la ficha médica:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});






//FUNCIONES

//Para añadir el id del médico de cabecera a los datos de la ficha médica
async function completeFamilyDoctorId(body) {

/*Si ya hay llega el médico de cabecera con id o no hay médico de cabecera
devuelve el body tal y como llega del frontend*/
  if (body.familyDoctor_id || !body.familyDoctor) {
    return body;
  }

  const humanDoctors = await HumanDoctor.findAll({
	//Incluye Doctor para tener el nombre del médico
    include: [Doctor]
  });

  /*Normaliza el nombre del doctor de la ficha médica
  (Eliminando espacios iniciales y finales y pasándolo todo a minúscula)
  Ej: pablo hierro*/
  const normalizedFamilyDoctor =
    body.familyDoctor.trim().toLowerCase();

  const matchingDoctor = humanDoctors.find((humanDoctor) => {

   //Sequelize puede devolver cualquiera de las dos opciones
    const doctorBase =
      humanDoctor.Doctor || humanDoctor.doctor;

    const fullName =
      `${doctorBase.name} ${humanDoctor.surnames}`.trim().toLowerCase();

    //Compara nombre del médico de la DB con el nombre del de la ficha médica
    return fullName === normalizedFamilyDoctor;

  });

  /*Concatenar el body que ya venía con el médico de cabecera buscado
  y si no ha encontrado devuelve null*/
  return {
    ...body,
    familyDoctor_id: matchingDoctor ? matchingDoctor.doctor_id : null
  };

}


module.exports = router;