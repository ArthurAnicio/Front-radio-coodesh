# Front Radio Browser

Disponível em https://front-radio-coodesh.vercel.app/

Aplicação para busca, filtragem e favoritamento de rádios online do mundo todo.

![tela_desktop](https://github.com/ArthurAnicio/Front-radio-coodesh/blob/main/public/desktop.png)

![tela_mobile](https://github.com/ArthurAnicio/Front-radio-coodesh/blob/main/public/mobile.png)

## 🧾 Descrição

Este projeto permite ao usuário pesquisar estações de rádio por nome, país e idioma, ouvir as rádios diretamente pela interface e adicionar suas favoritas.

## 🚀 Tecnologias Utilizadas

- **Linguagem**: TypeScript  
- **Framework**: React  
- **Build Tool**: Vite  
- **Estilo**: Tailwind CSS  
- **API**: [Radio Browser API](http://at1.api.radio-browser.info/json/stations/)  
- **Testes**: Playwright (E2E Testing)  
- **Containerização**: Docker  

## ⚙️ Como instalar e usar o projeto

### Pré-requisitos

- Node.js v18+
- Docker (opcional, para rodar com container)
- Yarn ou npm

### Passo a passo

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/radio-app.git
cd radio-app

# Instale as dependências
npm install
# ou
yarn install

# Rode o projeto
npm run dev
# ou
yarn dev
```

### Usando com Docker

```bash
# Construir a imagem Docker
docker build -t radio-app .

# Rodar o container
docker run -d -p 3000:3000 radio-app
```

Acesse no navegador: [http://localhost:3000](http://localhost:3000)

### Rodar os testes (Playwright)

```bash
# Instale as dependências de testes
npx playwright install

# Execute os testes
npx playwright test
```

---

## 🗂️ .gitignore

O projeto já inclui um `.gitignore` com os seguintes conteúdos principais:

```
node_modules
dist
.env
.vscode
.idea
.DS_Store
```

---

## 👨‍💻 Challenge

This is a challenge by Coodesh.
