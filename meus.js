import { db, auth } from "./firebaseini.js";
import { collection, getDocs, query, where, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const container = document.querySelector(".display-itens");

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    alert("Você precisa estar logado!");
    window.location.href = "login.html";
    return;
  }

  try {
    await carregarItens(user.uid);
  } catch (error) {
    console.error("Erro ao carregar itens:", error);
    container.innerHTML = "<p class='nenhum-item'>Erro ao carregar 😔</p>";
  }

});

async function carregarItens(userId) {

  if (!container) {
    console.error("Container .display-itens não encontrado ❌");
    return;
  }

  container.innerHTML = "<p class='nenhum-item'>Carregando...</p>";

  try {
    const q = query(
      collection(db, "itens"),
      where("userId", "==", userId),
      orderBy("criadoEm", "desc")
    );

    const querySnapshot = await getDocs(q);

    const itens = [];

    querySnapshot.forEach(docSnap => {
      itens.push({ id: docSnap.id, ...docSnap.data() });
    });

    mostrarItens(itens);

  } catch (error) {
    console.error("Erro Firestore:", error);

    if (error.message.includes("index")) {
      container.innerHTML = "<p class='nenhum-item'>Crie o índice no Firebase ⚠️</p>";
    } else {
      container.innerHTML = "<p class='nenhum-item'>Erro ao carregar 😔</p>";
    }
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

    card.innerHTML = `
      <img src="${item.imagem}" alt="${item.nome}">
      <h3>${item.nome}</h3>
      <h2>R$${item.preco}/dia</h2>
      <p>${item.cidade}</p>
      <div>
        <a href="produto.html?id=${item.id}">
          <button class="btn-item">Ver mais</button>
        </a>
        <button class="btn-excluir">Excluir</button>
      </div>
    `;

    container.appendChild(card);

    setTimeout(() => {
      card.classList.add("show");
    }, index * 100);

    // EXCLUIR
    card.querySelector(".btn-excluir").addEventListener("click", async () => {

      const confirma = confirm("Deseja realmente excluir este item?");
      if (!confirma) return;

      try {
        await deleteDoc(doc(db, "itens", item.id));
        card.remove();

      } catch (err) {
        console.error("Erro ao excluir item:", err);
        alert("Erro ao excluir ❌");
      }

    });

  });
}