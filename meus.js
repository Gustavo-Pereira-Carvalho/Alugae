import { db, auth } from "./firebaseini.js";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const container = document.querySelector(".display-itens");

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    alert("Você precisa estar logado!");
    window.location.href = "login.html";
    return;
  }

  carregarItens(user.uid);
});

async function carregarItens(userId) {

  container.innerHTML = "<p class='nenhum-item'>Carregando...</p>";

  try {
    const q = query(
      collection(db, "itens"),
      where("userId", "==", userId),
      orderBy("criadoEm", "desc")
    );

    const snapshot = await getDocs(q);

    const itens = [];

    snapshot.forEach(docSnap => {
      itens.push({ id: docSnap.id, ...docSnap.data() });
    });

    mostrarItens(itens);

  } catch (erro) {
    console.error(erro);
    container.innerHTML = "<p class='nenhum-item'>Erro ao carregar 😔</p>";
  }
}

function mostrarItens(itens) {

  container.innerHTML = "";

  if (itens.length === 0) {
    container.innerHTML = `<p class="nenhum-item">Nenhum item publicado 😔</p>`;
    return;
  }

  itens.forEach((item, index) => {

    const card = document.createElement("div");
    card.classList.add("card-item");

    const entrega = item.entrega
      ? "🚚 Entrega"
      : "📍 Retirada";

    const tamanho = item.tamanho
      ? `📦 ${item.tamanho}`
      : "";

    card.innerHTML = `
      <img src="${item.imagem || 'img/default.png'}">
      <h3>${item.nome}</h3>
      <h2>R$${item.preco}/dia</h2>

      <p class="info-extra">${entrega} • ${tamanho}</p>

      <div class="acoes">
        <button class="btn-item">Ver</button>
        <button class="btn-editar">Editar</button>
        <button class="btn-excluir">Excluir</button>
      </div>
    `;

    container.appendChild(card);

    setTimeout(() => {
      card.classList.add("show");
    }, index * 100);

    // VER
    card.querySelector(".btn-item").onclick = () => {
      window.location.href = `produto.html?id=${item.id}`;
    };

    // EDITAR
    card.querySelector(".btn-editar").onclick = () => {
      window.location.href = `editar.html?id=${item.id}`;
    };

    // EXCLUIR
    card.querySelector(".btn-excluir").onclick = async () => {

      const confirmar = confirm("Deseja excluir este item?");
      if (!confirmar) return;

      try {
        await deleteDoc(doc(db, "itens", item.id));
        card.remove();
      } catch (erro) {
        console.error(erro);
        alert("Erro ao excluir ❌");
      }
    };

  });
}