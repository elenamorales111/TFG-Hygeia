const sleepForm = document.getElementById("sleepForm");
const sleepMessage = document.getElementById("sleepMessage");
const sleepRecommendationsContainer = document.getElementById("sleepRecommendationsContainer");
const sleepRecommendationsList = document.getElementById("sleepRecommendationsList");

//Seleccionar todas las opciones del cuestionario de sueño
const sleepOptions = document.querySelectorAll(".sleep-option");

//Recorrer todas las opciones
sleepOptions.forEach((option) => {

  //Detecta cuando el paciente chequea una caja
  option.addEventListener("change", () => {

    if (!option.checked) {

      return;

    }


    //Nombre de la pregunta respondida
    const questionName = option.name;

    //Seleccionar todas las respuestas que están asociadas a esa pregunta
    const optionsFromSameQuestion = document.querySelectorAll(`input[name="${questionName}"]`);

    //Recorrerlas
    optionsFromSameQuestion.forEach((checkbox) => {

      //Quita el check de las opciones que no son la marcada
      if (checkbox !== option) {

        checkbox.checked = false;

      }

    });

  });

});

//Enviar formulario de sueño
sleepForm.addEventListener("submit", (event) => {

  event.preventDefault();

  const answers =
    getSleepAnswers();

  if (!allSleepQuestionsAnswered(answers)) {

    sleepMessage.className =
      "alert alert-danger mt-4";

    sleepMessage.textContent =
      "Primero debes responder todas las preguntas para recibir recomendaciones.";

    sleepRecommendationsContainer
      .classList
      .add("d-none");

    return;

  }

  sleepMessage.className =
    "alert d-none";

  sleepMessage.textContent =
    "";

  const recommendations =
    generateSleepRecommendations(answers);

  renderSleepRecommendations(recommendations);

  saveSleepQuestionnaire(
    answers,
    recommendations
  );

});

//Obtener respuestas marcadas del formulario
function getSleepAnswers() {

  return {

    sleepHours:
      document.querySelector('input[name="sleepHours"]:checked')?.value,

    screens:
      document.querySelector('input[name="screens"]:checked')?.value,

    caffeine:
      document.querySelector('input[name="caffeine"]:checked')?.value,

    dinner:
      document.querySelector('input[name="dinner"]:checked')?.value,

    exercise:
      document.querySelector('input[name="exercise"]:checked')?.value,

    schedule:
      document.querySelector('input[name="schedule"]:checked')?.value,

    fallAsleep:
      document.querySelector('input[name="fallAsleep"]:checked')?.value,

    awakenings:
      document.querySelector('input[name="awakenings"]:checked')?.value,

    snoring:
      document.querySelector('input[name="snoring"]:checked')?.value,

    dayTiredness:
      document.querySelector('input[name="dayTiredness"]:checked')?.value

  };

}

//Comprobar si se ha respondido a todas las preguntas para poder recibir las recomendaciones
function allSleepQuestionsAnswered(answers) {

  return Object.values(answers).every((answer) => {

    return answer !== undefined &&
      answer !== null &&
      answer !== "";

  });

}

//Generar recomendaciones según las respuestas
function generateSleepRecommendations(answers) {

  const recommendations = [];

  if (answers.sleepHours === "medium") {

    recommendations.push({
      question: "1. ¿Cuántas horas has dormido esta noche?",
      recommendation:
        "No está muy mal, pero sería bueno que intentases dormir más horas."
    });

  }

  if (answers.sleepHours === "bad") {

    recommendations.push({
      question: "1. ¿Cuántas horas has dormido esta noche?",
      recommendation:
        "Dormir menos de 6 horas de forma frecuente puede afectar a la concentración, el estado de ánimo, la salud y provocar enfermedades en el futuro."
    });

  }

  if (answers.screens === "medium" || answers.screens === "bad") {

    recommendations.push({
      question: "2. ¿Has usado aparatos tecnológicos poco antes de irte a dormir?",
      recommendation:
        "Intenta dejar de usar tecnología por lo menos una hora antes de irte a dormir."
    });

  }

  if (answers.caffeine === "medium" || answers.caffeine === "bad") {

    recommendations.push({
      question: "3. ¿Has tomado alguna bebida con cafeína por la tarde o noche?",
      recommendation:
        "Consumir bebidas con cafeína por la tarde o noche puede afectar al sueño. Intenta consumirlas solo por la mañana."
    });

  }

  if (answers.dinner === "medium") {

    recommendations.push({
      question: "4. ¿Has cenado poco antes de irte a dormir?",
      recommendation:
        "No cenar puede hacer que no descanses bien del todo. Intenta cenar aunque sea poca cantidad."
    });

  }

  if (answers.dinner === "bad") {

    recommendations.push({
      question: "4. ¿Has cenado poco antes de irte a dormir?",
      recommendation:
        "Cenar solo media hora antes de dormir puede dificultar la digestión y alterar la calidad del sueño. Intenta dejar más tiempo entre la cena y el momento de irte a dormir."
    });

  }

  if (answers.exercise === "medium" || answers.exercise === "bad") {

    recommendations.push({
      question: "5. ¿Has hecho ejercicio antes de dormir?",
      recommendation:
        "El ejercicio intenso antes de irte a dormir puede activar demasiado tu cuerpo. Intenta hacerlo por la tarde."
    });

  }

  if (answers.schedule === "medium" || answers.schedule === "bad") {

    recommendations.push({
      question: "6. ¿Te has ido a dormir a una hora parecida a la de otros días?",
      recommendation:
        "Tener un horario irregular de sueño puede afectar a tu rendimiento cerebral y físico del día siguiente. Intenta irte a dormir todos los días a horas similares."
    });

  }

  if (answers.fallAsleep === "medium") {

    recommendations.push({
      question: "7. ¿Cuánto has tardado en dormirte?",
      recommendation:
        "Tardar más de 30 minutos en dormirte puede estar relacionado con estrés, pantallas, cafeína o falta de rutina. Prueba técnicas de relajación antes de acostarte."
    });

  }

  if (answers.fallAsleep === "bad") {

    recommendations.push({
      question: "7. ¿Cuánto has tardado en dormirte?",
      recommendation:
        "Tardar más de una hora en dormirte de forma frecuente puede estar relacionado con insomnio, estrés o ansiedad. Si ocurre durante varias semanas, consúltalo con un médico."
    });

  }

  if (answers.awakenings === "medium") {

    recommendations.push({
      question: "8. ¿Te has despertado durante la noche?",
      recommendation:
        "Despertarse una o dos veces durante la noche puede ocurrir de forma puntual, pero si se repite con frecuencia consúltalo con un médico."
    });

  }

  if (answers.awakenings === "bad") {

    recommendations.push({
      question: "8. ¿Te has despertado durante la noche?",
      recommendation:
        "Despertarte varias veces durante la noche puede estar relacionado con insomnio u otros trastornos del sueño. Si se repite con frecuencia, consúltalo con un médico."
    });

  }

  if (answers.snoring === "medium") {

    recommendations.push({
      question: "9. ¿Te han dicho alguna vez que roncas?",
      recommendation:
        "Si no sabes si roncas, puede ser útil observarlo si convives con alguien, especialmente si también te levantas cansado con frecuencia."
    });

  }

  if (answers.snoring === "bad") {

    recommendations.push({
      question: "9. ¿Te han dicho alguna vez que roncas?",
      recommendation:
        "Los ronquidos frecuentes pueden estar relacionados con apnea obstructiva del sueño, especialmente si se acompañan de pausas respiratorias o cansancio diurno. Si ocurre con frecuencia, consúltalo con un médico."
    });

  }

  if (answers.dayTiredness === "medium") {

    recommendations.push({
      question: "10. ¿Cómo te has sentido durante el día de hoy?",
      recommendation:
        "Sentirte cansado durante el día puede indicar que el descanso no ha hecho descansar a tu cuerpo del todo. Cuida tus hábitos de sueño."
    });

  }

  if (answers.dayTiredness === "bad") {

    recommendations.push({
      question: "10. ¿Cómo te has sentido durante el día de hoy?",
      recommendation:
        "La somnolencia diurna importante o la dificultad para concentrarte pueden estar relacionadas con falta de sueño, insomnio, apnea del sueño u otros problemas. Si persiste, consúltalo con un médico."
    });

  }

  if (recommendations.length === 0) {

    recommendations.push({
      question: "Resultado general",
      recommendation:
        "¡Buen trabajo! Tus respuestas indican hábitos de sueño adecuados. ¡Sigue así!."
    });

  }

  return recommendations;

}

//Mostrar recomendaciones en pantalla
function renderSleepRecommendations(recommendations) {

  sleepRecommendationsList.innerHTML = "";

  recommendations.forEach((item) => {

    const recommendationItem =
      document.createElement("li");

    recommendationItem.className =
      "list-group-item";

    recommendationItem.innerHTML = `
      <h6 class="text-primary mb-2">
        ${item.question}
      </h6>

      <p class="mb-0">
        ${item.recommendation}
      </p>
    `;

    sleepRecommendationsList
      .appendChild(recommendationItem);

  });

  sleepRecommendationsContainer
    .classList
    .remove("d-none");

  sleepRecommendationsContainer.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}

//Guardar cuestionario en localStorage
function saveSleepQuestionnaire(
  answers,
  recommendations
) {

  const patientId =
    localStorage.getItem("patient_id");

  const questionnaires =
    JSON.parse(localStorage.getItem("sleepQuestionnaires")) || [];

  questionnaires.push({

    patient_id: patientId || null,

    date: new Date().toISOString(),

    answers,

    recommendations

  });

  localStorage.setItem(
    "sleepQuestionnaires",
    JSON.stringify(questionnaires)
  );

}


//CUESTIONARIO DE HABITOS DE ALIMENTACIÓN

const nutritionForm =
  document.getElementById("nutritionForm");

const nutritionMessage =
  document.getElementById("nutritionMessage");

const nutritionRecommendationsContainer =
  document.getElementById("nutritionRecommendationsContainer");

const nutritionRecommendationsList =
  document.getElementById("nutritionRecommendationsList");

//Seleccionar todas las opciones del cuestionario de alimentación
const nutritionOptions =
  document.querySelectorAll(".nutrition-option");

//Sólo se puede responder una opción
nutritionOptions.forEach((option) => {

  option.addEventListener("change", () => {

    if (!option.checked) {

      return;

    }

    const questionName =
      option.name;

    const optionsFromSameQuestion =
      document.querySelectorAll(`input[name="${questionName}"]`);

    optionsFromSameQuestion.forEach((checkbox) => {

      if (checkbox !== option) {

        checkbox.checked = false;

      }

    });

  });

});

//Enviar formulario de alimentación
nutritionForm.addEventListener("submit", (event) => {

  event.preventDefault();

  const answers =
    getNutritionAnswers();

  if (!allNutritionQuestionsAnswered(answers)) {

    nutritionMessage.className =
      "alert alert-danger mt-4";

    nutritionMessage.textContent =
      "Primero debes responder todas las preguntas para recibir recomendaciones.";

    nutritionRecommendationsContainer
      .classList
      .add("d-none");

    return;

  }

  nutritionMessage.className =
    "alert d-none";

  nutritionMessage.textContent =
    "";

  const recommendations =
    generateNutritionRecommendations(answers);

  renderNutritionRecommendations(recommendations);

  saveNutritionQuestionnaire(
    answers,
    recommendations
  );

});

//Obtener respuestas marcadas del formulario
function getNutritionAnswers() {

  return {

    breakfast:
      document.querySelector('input[name="breakfast"]:checked')?.value,

    lunch:
      document.querySelector('input[name="lunch"]:checked')?.value,

    dinnerNutrition:
      document.querySelector('input[name="dinnerNutrition"]:checked')?.value,

    water:
      document.querySelector('input[name="water"]:checked')?.value,

    softDrinks:
      document.querySelector('input[name="softDrinks"]:checked')?.value,

    fruit:
      document.querySelector('input[name="fruit"]:checked')?.value,

    emotionalEating:
      document.querySelector('input[name="emotionalEating"]:checked')?.value,

    regularMeals:
      document.querySelector('input[name="regularMeals"]:checked')?.value,

    bodyImageEating:
      document.querySelector('input[name="bodyImageEating"]:checked')?.value,

    nutritionAssessment:
      document.querySelector('input[name="nutritionAssessment"]:checked')?.value

  };

}

//Comprobar si se ha respondido a todas las preguntas
function allNutritionQuestionsAnswered(answers) {

  return Object.values(answers).every((answer) => {

    return answer !== undefined &&
      answer !== null &&
      answer !== "";

  });

}

//Generar recomendaciones según las respuestas
function generateNutritionRecommendations(answers) {

  const recommendations = [];

  if (answers.breakfast === "medium") {

    recommendations.push({
      question: "1. ¿Has desayunado hoy?",
      recommendation:
        "Intenta que tus desayunos sean más completos para tener las suficientes vitaminas por la mañana."
    });

  }

  if (answers.breakfast === "bad") {

    recommendations.push({
      question: "1. ¿Has desayunado hoy?",
      recommendation:
        "Saltarse el desayuno puede provocar bajadas de tensión y mareos. Intenta desayunar todos los días."
    });

  }


  if (answers.lunch === "bad") {

    recommendations.push({
      question: "2. ¿Has comido hoy?",
      recommendation:
        "Saltarse al comida puede provocar bajadas de tensión y mareos. Intenta comer todos los días."
    });

  }

  if (answers.dinnerNutrition === "medium") {

    recommendations.push({
      question: "3. ¿Has cenado hoy?",
      recommendation:
        "Una cena muy abundante puede dificultar la digestión y el descanso. Intenta que la cena no contenga tanta cantidad de comida."
    });

  }

  if (answers.dinnerNutrition === "bad") {

    recommendations.push({
      question: "3. ¿Has cenado hoy?",
      recommendation:
        "Saltarse la cena puede provocar que te despiertes más veces por la noche. Intenta cenar todos los días."
    });

  }

  if (answers.water === "medium" || answers.water === "bad") {

    recommendations.push({
      question: "4. ¿Has bebido suficiente agua?",
      recommendation:
        "Intenta beber más agua, ¡el 70% de tu cuerpo es agua y es muy importante para las células!."
    });

  }



  if (answers.softDrinks === "medium" || answers.softDrinks === "bad") {

    recommendations.push({
      question: "5. ¿Has tomado algún refresco?",
      recommendation:
        "El consumo frecuente de refrescos puede aumentar los problemas de salud asociados al azúcar en sangre. Intenta tomar menos."
    });

  }


  if (answers.fruit === "medium" || answers.fruit === "bad") {

    recommendations.push({
      question: "6. ¿Has comido fruta en algún momento del día?",
      recommendation:
        "La fruta aporta vitaminas, minerales y fibra. Intenta incluir al menos una pieza de fruta al día."
    });

  }


  if (answers.emotionalEating === "medium" || answers.emotionalEating === "bad") {

    recommendations.push({
      question: "7. ¿Has comido entre horas por ansiedad o aburrimiento?",
      recommendation:
        "Comer frecuentemente por ansiedad o aburrimiento puede dificultar mantener hábitos alimentarios saludables. Si ocurre a menudo, consúltalo con un médico."
    });

  }

  if (answers.regularMeals === "medium" || answers.regularMeals === "bad") {

    recommendations.push({
      question: "8. ¿Has realizado las comidas principales a horarios regulares?",
      recommendation:
        "Los horarios muy irregulares pueden dificultar una alimentación equilibrada. Intenta establecer una rutina de comidas."
    });

  }


  if (answers.bodyImageEating === "medium" || answers.bodyImageEating === "bad") {

    recommendations.push({
      question: "9. ¿Has comido más o menos cantidad por pensar en tu físico?",
      recommendation:
        "Modificar la cantidad de comida ingerida con frecuencia por temas físicos y no por salud puede afectar a tu relación con la alimentación. Si te genera malestar, consúltalo con un médico."
    });

  }


  if (answers.nutritionAssessment === "medium" || answers.nutritionAssessment === "bad") {
    recommendations.push({
      question: "10. ¿Al comer has sentido que te has llenado muy rápido?",
      recommendation:
        "Si te llenas muy rápido y además tienes molestias digestivas, consúltalo con un médico"
    });

  }
  
  if (recommendations.length === 0) {

  recommendations.push({
    question: "Resultado general",
    recommendation:
      "¡Buen trabajo! Tus respuestas indican que tu alimentación diaria es saludable. ¡Sigue así! "
  });

}


  return recommendations;

}

//Mostrar recomendaciones en pantalla
function renderNutritionRecommendations(recommendations) {

  nutritionRecommendationsList.innerHTML = "";

  recommendations.forEach((item) => {

    const recommendationItem =
      document.createElement("li");

    recommendationItem.className =
      "list-group-item";

    recommendationItem.innerHTML = `
      <h6 class="text-success mb-2">
        ${item.question}
      </h6>

      <p class="mb-0">
        ${item.recommendation}
      </p>
    `;

    nutritionRecommendationsList
      .appendChild(recommendationItem);

  });

  nutritionRecommendationsContainer
    .classList
    .remove("d-none");

  nutritionRecommendationsContainer.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}

//Guardar cuestionario en localStorage
function saveNutritionQuestionnaire(
  answers,
  recommendations
) {

  const patientId =
    localStorage.getItem("patient_id");

  const questionnaires =
    JSON.parse(localStorage.getItem("nutritionQuestionnaires")) || [];

  questionnaires.push({

    patient_id: patientId || null,

    date: new Date().toISOString(),

    answers,

    recommendations

  });

  localStorage.setItem(
    "nutritionQuestionnaires",
    JSON.stringify(questionnaires)
  );

}