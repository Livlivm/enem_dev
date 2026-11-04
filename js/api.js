const API_URL = "https://api.enem.dev/v1";

const DISCIPLINE_RANGES = {
  languages: [1, 45],
  "human-sciences": [46, 90],
  "natural-sciences": [91, 135],
  mathematics: [136, 180]
};

async function getQuestions(year, discipline, language = "portuguese") {

  const validDisciplines = Object.keys(DISCIPLINE_RANGES);

  if (!validDisciplines.includes(discipline)) {
    throw new Error("Área do conhecimento inválida.");
  }

  const params = new URLSearchParams();

  params.set("discipline", discipline);
  params.set("limit", "50");

  if (discipline === "languages") {

    if (language === "english" || language === "spanish") {
      params.set("language", language);
    }

  }

  const url =
    `${API_URL}/exams/${year}/questions?${params.toString()}`;

  console.log("URL consultada:", url);

  const response = await fetch(url);

  if (!response.ok) {
    const errorDetails = await response.text();

    throw new Error(
      `Erro ${response.status}: ${errorDetails}`
    );
  }

  const data = await response.json();

  let questions = [];

  if (Array.isArray(data)) {
    questions = data;

  } else if (Array.isArray(data.questions)) {
    questions = data.questions;

  } else if (Array.isArray(data.data)) {
    questions = data.data;

  } else {
    throw new Error(
      "A API retornou um formato de questões inesperado."
    );
  }

  const [first, last] = DISCIPLINE_RANGES[discipline];

  questions = questions.filter(question => {

    const index = Number(question.index);

    return Number.isInteger(index) &&
      index >= first &&
      index <= last;

  });

 
  if (discipline === "languages") {

    if (language === "portuguese") {

      questions = questions.filter(question => {
        const index = Number(question.index);
        return index >= 6 && index <= 45;
      });

    } else {

      questions = questions.filter(question => {
        const index = Number(question.index);
        return index >= 1 && index <= 5;
      });

    }

  }

  questions.sort((a, b) => {
    return Number(a.index) - Number(b.index);
  });

  console.log("Total de questões:", questions.length);

  console.log("Questões recebidas:", questions);

  return questions;
}
