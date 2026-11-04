# ENOVA — Plataforma de estudos para o ENEM

## Estrutura
- `index.html`: estrutura das páginas.
- `css/style.css`: identidade visual e responsividade.
- `js/api.js`: comunicação com a API ENEM.dev.
- `js/script.js`: navegação, filtros e correção das questões.
- `assets/logo.png`: mascote da ENOVA.

## Como executar
1. Abra a pasta ENOVA no VS Code.
2. Instale/ative a extensão Live Server.
3. Clique com o botão direito em `index.html`.
4. Escolha **Open with Live Server**.
5. Entre em Questões, escolha o ano e a área, e clique em Buscar questões.

## API
Endpoint usado:
`https://api.enem.dev/v1/exams/{ano}/questions?discipline={area}&limit=200`

Áreas aceitas:
- `languages`
- `human-sciences`
- `natural-sciences`
- `mathematics`

A aplicação é front-end e precisa de internet para carregar questões, fontes e ícones.
