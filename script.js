import { db } from "./firebaseini.js";
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const container = document.querySelector(".display-itens");
const inputPesquisa = document.querySelector(".pesquisa");
const btnSearch = document.querySelector(".search-button");
const cardsDestaque = document.querySelectorAll(".card-destaque");

let itens = [];

// 🚀 CARREGAR ITENS
async function carregarItens() {
  container.innerHTML = "";

  const q = query(collection(db, "itens"), orderBy("criadoEm", "desc"));
  const querySnapshot = await getDocs(q);

  itens = [];
  querySnapshot.forEach(doc => {
    itens.push({ id: doc.id, ...doc.data() });
  });

  mostrarItens(itens);
}

// 🎨 MOSTRAR ITENS
function mostrarItens(lista) {
  container.innerHTML = "";

  if(lista.length === 0){
    container.innerHTML = `<p class="nenhum-item">Nenhum item encontrado 😔</p>`;
    return;
  }

  lista.forEach((item, index) => {
    const card = document.createElement("div");
    card.classList.add("card-item");

    // montar texto das opções de entrega
const opcoes = ["Retirada no local"];

if (item.entregaOpcoes?.moto) opcoes.push("Moto (R$20)");
if (item.entregaOpcoes?.carro) opcoes.push("Carro (R$25)");
if (item.entregaOpcoes?.caminhao) opcoes.push("Caminhão (R$50)");

    const entregaTexto = opcoes.join(" / ");

    card.innerHTML = `
      <img src="${item.imagem || 'img/default.png'}">
      <h3>${item.nome}</h3>
      <h2>R$${item.preco}/dia</h2>

      <p class="descricao">
        ${(item.descricao || "Sem descrição").slice(0, 80)}...
      </p>

      <p><strong>Entrega:</strong> ${entregaTexto}</p>

      <a href="produto.html?id=${item.id}">
        <button class="btn-item">Ver mais</button>
      </a>
    `;

    container.appendChild(card);
    setTimeout(() => card.classList.add("show"), index * 100);
  });
}

// 🔍 BUSCA
function buscarItens() {
  const termo = inputPesquisa.value.toLowerCase();

  if(termo === "") return mostrarItens(itens);

  const filtrados = itens.filter(item =>
    (item.nome || "").toLowerCase().includes(termo) ||
    (item.descricao || "").toLowerCase().includes(termo)
  );

  mostrarItens(filtrados);
}

btnSearch.addEventListener("click", buscarItens);

inputPesquisa.addEventListener("keyup", (e) => {
  if(e.key === "Enter") buscarItens();
});

// 🎯 FILTRO POR CATEGORIA
cardsDestaque.forEach(card => {
  card.addEventListener("click", () => {
    const categoria = card.dataset.categoria.toLowerCase();

    const filtrados = categoria === "todos"
      ? itens
      : itens.filter(item =>
          (item.categoria || "").toLowerCase() === categoria
        );

    mostrarItens(filtrados);
  });
});

// 🚀 INICIAL
carregarItens();