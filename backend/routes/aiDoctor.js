const express = require("express");
const router = express.Router();

const { GoogleGenAI } = require("@google/genai");

const {
  Patient,
  AIDoctor,
  Question,
  MedicalRecord,
  Medication,
  MedicalAppointment,
  RealDoctorAppointment
} = require("../sequelize");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

//Chat con IA
router.post("/ai-chat", async (req, res) => {

  try {

    const {
      patient_id,
      message,
	  useMedicalData
	  
    } = req.body;

    if (!patient_id || !message) {

      return res.status(400).json({
        ok: false,
        message: "Paciente y mensaje son obligatorios"
      });

    }
	
	if (useMedicalData !== true && useMedicalData !== false) {

	  return res.status(400).json({
		ok: false,
		message: "Debes aceptar o denegar el uso de tus datos médicos antes de usar el chat"
	  });

	}

    const patient = await Patient.findByPk(patient_id);

    if (!patient) {

      return res.status(404).json({
        ok: false,
        message: "Paciente no encontrado"
      });

    }

    const aiDoctor = await AIDoctor.findOne();

    if (!aiDoctor) {

      return res.status(404).json({
        ok: false,
        message: "No hay médico IA registrado"
      });

    }
	
	const usePatientMedicalData = useMedicalData === true;

	let patientContext = "";
	let medicalRecordContext = "";
	let automaticMedicationWarning = "";

	if (usePatientMedicalData) {

		const medicalRecord = await MedicalRecord.findOne({
		  where: {
			patient_id: patient.patient_id
		  }
		});
		
		medicalRecordContext = medicalRecord
	  ? `
		Ficha médica del paciente:
		- Enfermedad principal: ${medicalRecord.illness || "No especificada"}
		- Estado: ${medicalRecord.status || "No especificado"}
		- Antecedentes médicos: ${medicalRecord.medicalHistory || "No especificados"}
		- Grupo sanguíneo: ${medicalRecord.bloodType || "No especificado"}
		- ALERGIAS O INTOLERANCIAS DEL PACIENTE: ${medicalRecord.allergies || "No hay"}
		- Medicación habitual: ${medicalRecord.medication || "No especificada"}
		- Seguro médico: ${medicalRecord.healthInsurance || "No especificado"}
		- Médico de cabecera: ${medicalRecord.familyDoctor || "No especificado"}
	  `
	  : "No hay ficha médica registrada.";
		
		
	  const medications = await Medication.findAll({
		where: {
		  patient_id
		}
	  });
	  
	  const medicalAppointments = await MedicalAppointment.findAll({
		  where: {
			patient_id
		  }
		});

		const realDoctorAppointments = await RealDoctorAppointment.findAll({
		  where: {
			patient_id
		  }
		});
	  
	  const medicationWarnings = [];

	if (
	  medicalRecord?.allergies?.toLowerCase().includes("lactosa")
	) {

	  medications.forEach((medication) => {

		if (
		  medication.medicine
			?.toLowerCase()
			.includes("paracetamol")
		) {

		  medicationWarnings.push(`
			IMPORTANTE:
			El paciente tiene alergia o intolerancia a la lactosa y tiene registrado Paracetamol.
			Algunas presentaciones de paracetamol pueden contener lactosa como excipiente.
			Advierte siempre al paciente de que revise el prospecto o consulte con un farmacéutico o médico antes de tomarlo.
		  `);

		  automaticMedicationWarning = `
	IMPORTANTE: En tu ficha médica consta alergia o intolerancia a la lactosa. Algunas presentaciones de paracetamol pueden contener lactosa como excipiente, por lo que debes revisar el prospecto concreto o consultarlo con un farmacéutico o médico antes de tomarlo.
		  `;

		}

	  });

}

    /*Código para explicarle a la IA las frecuencias porque sino
	no sabe deducirlas*/
	const medicationsText = medications.map((medication) => {

	  let frequencyText = "";

	  switch (medication.frequency) {

		case "FRECUENCIA_DIARIA":

		  frequencyText = "Todos los días";

		  break;

		case "FRECUENCIA_MEDIA":

		  frequencyText =
			`Los días ${medication.weekDays}`;

		  break;

		case "FRECUENCIA_BAJA":

		  frequencyText =
			`En la fecha ${medication.specificDate}`;

		  break;

		default:

		  frequencyText = medication.frequency;

	  }

	  return `
		- Medicamento: ${medication.medicine}
		Dosis: ${medication.dailyDose}
		Hora: ${medication.time}
		Frecuencia: ${frequencyText}
	  `;

	}).join("");
	
	const medicalAppointmentsText =
	  medicalAppointments.map((appointment) => {

		return `
		  - Cita médica presencial:
		  Fecha: ${appointment.date}
		  Hora: ${appointment.time}
		  Médico: ${appointment.doctor}
		  Centro: ${appointment.medicalCenter}
		  Motivo: ${appointment.reasonForAppointment || "No especificado"}
		`;

	  }).join("");

	const realDoctorAppointmentsText =
	  realDoctorAppointments.map((appointment) => {

		return `
		  - Cita de telemedicina:
		  Fecha: ${appointment.date}
		  Hora: ${appointment.time}
		  Estado: ${appointment.status}
		  Motivo: ${appointment.reason || "No especificado"}
		`;

	  }).join("");

	  patientContext = `
		El paciente ha aceptado el uso de su historial médico y de su medicación.
		
		Puedes utilizar datos del su historial médico y de su medicación:
		
		Historial médico:
		Enfermedad: ${medicalRecord?.illness || "No hay"}
		Estado: ${medicalRecord?.status || "No hay"}
		Antecedentes: ${medicalRecord?.medicalHistory || "No hay"}
		Grupo sanguíneo: ${medicalRecord?.bloodType || "No hay"}
		Alergias: ${medicalRecord?.allergies || "No hay"}
		Medicación registrada en ficha: ${medicalRecord?.medication || "No hay"}
		Seguro médico: ${medicalRecord?.healthInsurance || "No hay"}
		Médico de familia: ${medicalRecord?.familyDoctor || "No hay"}

		Medicación:
		${medicationsText || "No hay"}
		
		Citas médicas en hospital:
		${medicalAppointmentsText || "No hay"}

		Citas médicas por videollamada:
		${realDoctorAppointmentsText || "No hay"}
		
		Advertencias automáticas:
        ${medicationWarnings.join("\n") || "No hay advertencias"}
	  `;

	} else {

	  patientContext = `
		El paciente NO ha aceptado el uso de su historial médico y de su medicación..
		No utilices su información médica.
	  `;

	}	
	
	const today = new Date();

	const currentDate =
	  today.toLocaleDateString("es-ES");

	const currentDay =
	  today.toLocaleDateString("es-ES", {
		weekday: "long"
	  });

    const prompt = `
      Eres el asistente médico IA de Hygeia.

      Responde en español.
      Responde de forma clara y sencilla.
	  Resume tus respuestas.
	  
	  No saludes siempre, solo cuando inicie la conversacion.
      No sustituyes a un médico humano.
      No des diagnósticos definitivos.
	  
      Si hay síntomas graves, recomienda acudir a urgencias.

      Paciente: ${patient.name} ${patient.surnames}
      Pregunta: ${message}
	  Si el paciente acepta los términos y condiciones de uso, 
	  esta es su información médica: ${patientContext}
	  
	  Fecha actual: ${currentDate}
      Día de la semana actual: ${currentDay}
	  
	  Cuando el paciente pregunte por su medicación o sus citas,
      utiliza siempre la fecha y el día actual proporcionados
      para decirle qué medicaciones debe tomar hoy y qué citas tiene.
	  
	${medicalRecordContext}
	
	OBLIGATORIO:
	Si el paciente pregunta por un medicamento concreto o por cuándo tomar una medicación registrada, 
	debes comprobar siempre si sus alergias o intolerancias
	pueden estar relacionadas con ese medicamento o con sus excipientes.

	Si en la ficha médica aparece lactosa, gluten, AINEs o antihistamínicos, debes mencionarlo 
	explícitamente en la respuesta cuando hables de medicamentos,
	aunque el paciente no pregunte por la alergia.

	Si el medicamento mencionado es paracetamol y el paciente tiene alergia o intolerancia a la lactosa,
	debes avisar siempre de que algunas presentaciones de paracetamol pueden contener lactosa como excipiente
	y que debe revisar el prospecto o consultar con un farmacéutico/médico antes de tomarlo.

	Ten muy en cuenta siempre las alergias o intolerancias
	registradas en la ficha médica del paciente.

	Si el paciente pregunta por un medicamento, 
	avisa por iniciativa propia si contiene algo a lo que tenga alergia o intolerancia

	Si el paciente presenta alergia o intolerancia a alguna sustancia,
	avisa por iniciativa propia aunque el paciente no lo mencione explícitamente.

	Sigue estas recomendaciones:

	- Lactosa:
	  Algunos medicamentos pueden contener lactosa. 
	  Si el paciente presenta intolerancia o alergia a la lactosa, recomienda revisar el prospecto
	  o consultar con un profesional sanitario antes de tomar el medicamento. No recomiendes 
	  directamente medicamentos que puedan contener lactosa sin advertir previamente al paciente.

	- Gluten:
	  Algunos medicamentos pueden contener trazas o derivados del trigo. 
	  Si el paciente presenta enfermedad celíaca o intolerancia al gluten, 
	  avisa de que debe revisar el prospecto del medicamento o consultar 
	  con un farmacéutico para confirmar que es apto para personas con intolerancia al gluten.

	- Antihistamínicos:
	  Si el paciente presenta alergia o reacción adversa conocida
	  a antihistamínicos, no recomiendes medicamentos pertenecientes a
	  este grupo y aconseja consultar con un médico para valorar alternativas
	  terapéuticas seguras.

	- Antiinflamatorios no esteroideos (AINEs):
	  Si el paciente presenta alergia o intolerancia a ibuprofeno, naproxeno,
	  dexketoprofeno, aspirina u otros AINEs, evita recomendar medicamentos del mismo grupo.
	  Advierte al paciente sobre el riesgo de reacciones adversas y aconseja consultar con
	  un profesional sanitario antes de tomar cualquier antiinflamatorio.

	Si no tienes seguridad absoluta sobre si un medicamento contiene un excipiente o pertenece
	a un grupo contraindicado para el paciente, indícalo claramente y
	recomienda revisar el prospecto o consultar con un médico o farmacéutico.

	Da prioridad a la seguridad del paciente antes que a 
	proporcionar una recomendación farmacológica concreta.

	`;


    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

	let answer = response.text;


	if (
	  usePatientMedicalData &&
	  (
		patientContext.toLowerCase().includes("lactosa") ||
		patientContext.toLowerCase().includes("gluten")
	  ) &&
	  patientContext.toLowerCase().includes("paracetamol") &&
	  !answer.toLowerCase().includes("lactosa") &&
	  !answer.toLowerCase().includes("gluten")
	) {

	  answer += `

	IMPORTANTE: En tu ficha médica consta alergia o intolerancia a la lactosa o al gluten. Algunas presentaciones de paracetamol pueden contener lactosa como excipiente o trazas/derivados relacionados con gluten, por lo que debes revisar el prospecto concreto o consultarlo con un farmacéutico o médico antes de tomarlo.`;

	}

	if (usePatientMedicalData) {

	  await Question.create({
		text: message,
		answer,
		patient_id,
		humanDoctor_id: null,
		aiDoctor_id: aiDoctor.aiDoctor_id
	  });

	}

    res.json({
      ok: true,
      answer
    });

  } catch (err) {

    console.error("Error en Chat IA:", err);

	let errorMessage = "Error al consultar HygeIA";

	if (
	  err.message &&
	  (
		err.message.toLowerCase().includes("model") ||
		err.message.toLowerCase().includes("high") ||
		err.message.toLowerCase().includes("demand") ||
		err.message.toLowerCase().includes("unavailable") ||
		err.message.toLowerCase().includes("503")
	  )
	) {
	  errorMessage =
		"El servicio de IA está saturado por alta demanda, lo sentimos. Por favor, intenta volver a utilizarlo en unos minutos.";
	}

	res.status(500).json({
	  ok: false,
	  message: errorMessage
	});

  }

});

//Historial de conversaciones con la IA si el paciente ha dado el consentimiento
router.get("/patients/:id/ai-chat-history", async (req, res) => {

  try {

    const questions = await Question.findAll({
      where: {
        patient_id: req.params.id
      },
      order: [
        ["createdAt", "DESC"]
      ]
    });

    res.json({
      ok: true,
      questions
    });

  } catch (err) {

    console.error("Error al obtener el historial de conversaciones:", err);

    res.status(500).json({
      ok: false,
      message: "Error al obtener el historial de conversaciones",
      error: err.message
    });

  }

});

//Obtener consentimiento de términos y condiciones de uso de HygeIA
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
      message: "Error obteniendo consentimiento",
      error: err.message
    });

  }

});

//Guardar consentimiento de términos y condiciones de uso de HygeIA
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

module.exports = router;