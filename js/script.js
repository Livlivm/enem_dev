const subjectNames = {
  languages: "Linguagens",
  "human-sciences": "Ciências Humanas",
  "natural-sciences": "Ciências da Natureza",
  mathematics: "Matemática"
};

const $ = selector => document.querySelector(selector);

let questions = [];
let currentQuestion = 0;
let selectedAlternative = null;
let answerChecked = false;
let requestId = 0;



function showPage(pageName) {

  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  document.querySelectorAll(".nav-link").forEach(link => {
    link.classList.remove("active");
  });

  const page = document.getElementById(pageName);

  if (!page) return;

  page.classList.add("active");

  const activeLink = document.querySelector(
    `.nav-link[data-page="${pageName}"]`
  );

  if (activeLink) {
    activeLink.classList.add("active");
  }

  const titles = {
    inicio: "Início",
    questoes: "Questões",
    materias: "Matérias",
    sobre: "Sobre"
  };

  $("#page-title").textContent = titles[pageName] || "ENOVA";

}


document.querySelectorAll(".nav-link").forEach(link => {

  link.addEventListener("click", event => {

    event.preventDefault();

    showPage(link.dataset.page);

  });

});


document.querySelectorAll("[data-go]").forEach(button => {

  button.addEventListener("click", () => {

    showPage(button.dataset.go);

  });

});



function updateLanguageVisibility() {

  const discipline = $("#discipline").value;

  const languageGroup = $("#language-group");

  languageGroup.style.display =
    discipline === "languages" ? "flex" : "none";

}

$("#discipline").addEventListener(
  "change",
  updateLanguageVisibility
);

updateLanguageVisibility();



document.querySelectorAll("[data-subject]").forEach(card => {

  card.addEventListener("click", () => {

    const selectedSubject = card.dataset.subject;

    $("#discipline").value = selectedSubject;

    $("#language").value = "portuguese";

    updateLanguageVisibility();

    showPage("questoes");

    loadQuestions();

  });

});



$("#search-button").addEventListener(
  "click",
  loadQuestions
);



async function loadQuestions() {

  const currentRequest = ++requestId;

  const year = $("#year").value;

  const discipline = $("#discipline").value;

  const language = $("#language").value;

  const status = $("#question-status");

  const container = $("#question-container");

  const button = $("#search-button");

  status.textContent = "Carregando questões... 💛";

  container.replaceChildren();

  button.disabled = true;

  button.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin"></i> Carregando';

  questions = [];

  currentQuestion = 0;

  try {

    const result = await getQuestions(
      year,
      discipline,
      language
    );

    
    if (currentRequest !== requestId) return;

    questions = result;

    if (!questions.length) {

      status.textContent =
        "Não encontramos questões para essa seleção. Tente outro ano.";

      return;

    }

    let languageName = "";

    if (discipline === "languages") {

      const languageNames = {
        portuguese: "Português",
        english: "Inglês",
        spanish: "Espanhol"
      };

      languageName = ` — ${languageNames[language]}`;

    }

    status.textContent =
      `${questions.length} questões encontradas — ` +
      `${subjectNames[discipline]}${languageName}, ENEM ${year}.`;

    currentQuestion = 0;

    renderQuestion();

  } catch (error) {

    if (currentRequest !== requestId) return;

    console.error("Erro ao buscar questões:", error);

    status.textContent =
      `Não foi possível carregar as questões. ${error.message}`;

  } finally {

    if (currentRequest === requestId) {

      button.disabled = false;

      button.innerHTML =
        '<i class="fa-solid fa-magnifying-glass"></i> Buscar questões';

    }

  }

}



function appendText(parent, className, content) {

  if (!content) return;

  const element = document.createElement("p");

  element.className = className;

  element.textContent = content;

  element.style.whiteSpace = "pre-line";

  parent.appendChild(element);

}



function appendQuestionImage(parent, url, altText) {

  if (typeof url !== "string" || !url.trim()) return;

  const image = document.createElement("img");

  image.className = "question-image";

  image.src = url;

  image.alt = altText;

  image.loading = "lazy";

  image.onerror = () => {
    image.remove();
  };

  parent.appendChild(image);

}



function getImageUrl(file) {

  if (typeof file === "string") {
    return file;
  }

  if (file && typeof file === "object") {
    return file.url || file.path || "";
  }

  return "";

}



function renderQuestion() {

  const container = $("#question-container");

  container.replaceChildren();

  const question = questions[currentQuestion];

  if (!question) return;

  selectedAlternative = null;

  answerChecked = false;

  const year = $("#year").value;

  const discipline = $("#discipline").value;

  const card = document.createElement("article");

  card.className = "question-card";

  

  const header = document.createElement("div");

  header.className = "question-header";

  const tag = document.createElement("span");

  tag.className = "question-tag";

  tag.textContent =
    `${subjectNames[discipline]} • ENEM ${year}`;

  const number = document.createElement("span");

  number.className = "question-number";

  number.textContent =
    `Questão ${question.index ?? currentQuestion + 1}`;

  header.append(tag, number);

  card.appendChild(header);



  appendText(
    card,
    "question-text",
    question.context
  );



  appendText(
    card,
    "question-text",
    question.title || "Enunciado não disponível."
  );

  if (Array.isArray(question.files)) {

    question.files.forEach((file, index) => {

      appendQuestionImage(
        card,
        getImageUrl(file),
        `Imagem de apoio ${index + 1}`
      );

    });

  }


  appendText(
    card,
    "question-text",
    question.alternativesIntroduction
  );



  const alternativesBox = document.createElement("div");

  alternativesBox.className = "alternatives";

  const alternatives = Array.isArray(question.alternatives)
    ? question.alternatives
    : [];

  alternatives.forEach(alternative => {

    const option = document.createElement("button");

    option.type = "button";

    option.className = "alternative";

    const letter = document.createElement("span");

    letter.className = "alternative-letter";

    letter.textContent = alternative.letter || "?";

    const text = document.createElement("span");

    text.textContent = alternative.text || "";

    option.append(letter, text);


    if (alternative.file) {

      appendQuestionImage(
        option,
        getImageUrl(alternative.file),
        `Imagem da alternativa ${alternative.letter}`
      );

    }

    option.addEventListener("click", () => {

      if (answerChecked) return;

      selectedAlternative = alternative.letter;

      alternativesBox
        .querySelectorAll(".alternative")
        .forEach(item => {
          item.classList.remove("selected");
        });

      option.classList.add("selected");

    });

    alternativesBox.appendChild(option);

  });

  card.appendChild(alternativesBox);

  
  const feedback = document.createElement("div");

  feedback.id = "answer-feedback";

  card.appendChild(feedback);


  const actions = document.createElement("div");

  actions.className = "question-actions";

  const checkButton = document.createElement("button");

  checkButton.type = "button";

  checkButton.textContent = "Conferir resposta";

  checkButton.addEventListener(
    "click",
    checkAnswer
  );

  const nextButton = document.createElement("button");

  nextButton.type = "button";

  nextButton.className = "secondary";

  nextButton.textContent = "Próxima questão";

  nextButton.disabled =
    currentQuestion === questions.length - 1;

  nextButton.addEventListener(
    "click",
    nextQuestion
  );

  actions.append(checkButton, nextButton);

  card.appendChild(actions);

  

  const pagination = document.createElement("div");

  pagination.className = "pagination";

  const previous = document.createElement("button");

  previous.type = "button";

  previous.textContent = "Anterior";

  previous.disabled = currentQuestion === 0;

  previous.addEventListener(
    "click",
    previousQuestion
  );

  const position = document.createElement("span");

  position.textContent =
    `${currentQuestion + 1} de ${questions.length}`;

  const next = document.createElement("button");

  next.type = "button";

  next.textContent = "Próxima";

  next.disabled =
    currentQuestion === questions.length - 1;

  next.addEventListener(
    "click",
    nextQuestion
  );

  pagination.append(previous, position, next);

  container.append(card, pagination);

}


function checkAnswer() {

  if (!selectedAlternative) {

    alert("Escolha uma alternativa primeiro!");

    return;

  }

  const question = questions[currentQuestion];

  const correct = String(
    question.correctAlternative || ""
  ).toUpperCase();

  const feedback = $("#answer-feedback");

  if (!correct) {

    feedback.className = "feedback error";

    feedback.textContent =
      "O gabarito desta questão não está disponível na API.";

    return;

  }

  answerChecked = true;

  document.querySelectorAll(".alternative").forEach(option => {

    const letter = option
      .querySelector(".alternative-letter")
      .textContent
      .toUpperCase();

    if (letter === correct) {

      option.classList.add("correct");

    }

    if (
      letter === selectedAlternative.toUpperCase() &&
      letter !== correct
    ) {

      option.classList.add("wrong");

    }

  });

  if (selectedAlternative.toUpperCase() === correct) {

    feedback.className = "feedback success";

    feedback.textContent =
      "Muito bem! Você acertou! 🎉";

  } else {

    feedback.className = "feedback error";

    feedback.textContent =
      `Não foi dessa vez. A alternativa correta é ${correct}. Continue praticando! 💛`;

  }

}

function nextQuestion() {

  if (currentQuestion < questions.length - 1) {

    currentQuestion++;

    renderQuestion();

  }

}



function previousQuestion() {

  if (currentQuestion > 0) {

    currentQuestion--;

    renderQuestion();

  }

}
