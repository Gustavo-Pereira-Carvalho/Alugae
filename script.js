// script.js

import { db } from "./firebase.js";

import { 
  collection, 
  getDocs, 
  query, 
  orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const container = document.querySelector(".display-itens");

// carregar itens
async function carregarItens() {
  container.innerHTML = "";

  const q = query(collection(db, "itens"), orderBy("criadoEm", "desc"));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    const item = doc.data();

    const card = document.createElement("div");
    card.classList.add("card-item");

card.innerHTML = `
  <img src="${item.imagem}">
  <h3>${item.nome}</h3>
  <h2>R$${item.preco}/dia</h2>
  <p>${item.cidade}</p>
  <a href="produto.html?id=${doc.id}">
    <button class="btn-item">Ver mais</button>
  </a>
`;

    container.appendChild(card);
  });
}

// iniciar
carregarItens();