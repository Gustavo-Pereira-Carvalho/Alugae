import { db, auth } from "./firebaseini.js";
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const container = document.querySelector(".display-itens");
const inputPesquisa = document.querySelector(".pesquisa");
const btnSearch = document.querySelector(".search-button");
const cardsDestaque = document.querySelectorAll(".card-destaque");

let itens = [];

// 🔒 Verificar login e atualizar header
const btnLogin = document.getElementById("btnLogin");
const btnCad = document.getElementById("btnCad");
const btnHeader = document.getElementById("btnHeader");

onAuthStateChanged(auth, (user) => {
  if (user) {
    if(btnLogin) btnLogin.style.display = "none";
    if(btnCad) btnCad.style.display = "none";

    const usuarioDiv = document.createElement("div");
    usuarioDiv.classList.add("btn-usuario");

    const btnPerfil = document.createElement("button");
    btnPerfil.textContent = "Perfil";
    btnPerfil.classList.add("btn-perfil");
    btnPerfil.onclick = () => window.location.href = "meus-anuncios.html";

    const btnSair = document.createElement("button");
    btnSair.textContent = "Sair";
    btnSair.classList.add("btn-sair");
    btnSair.onclick = async () => { await signOut(auth); window.location.reload(); };

    usuarioDiv.appendChild(btnPerfil);
    usuarioDiv.appendChild(btnSair);
    btnHeader.appendChild(usuarioDiv);
  }
});

// carregar itens do Firestore
async function carregarItens() {
  container.innerHTML = "";
  const q = query(collection(db, "itens"), orderBy("criadoEm", "desc"));
  const querySnapshot = await getDocs(q);

  itens = [];
  querySnapshot.forEach(doc => itens.push({ id: doc.id, ...doc.data() }));

  mostrarItens(itens);
}

// mostrar itens com fade-in
function mostrarItens(lista) {
  container.innerHTML = "";
  if(lista.length === 0){
    container.innerHTML = `<p class="nenhum-item">Nenhum item encontrado 😔</p>`;
    return;
  }

  lista.forEach((item, index) => {
    const card = document.createElement("div");
    card.classList.add("card-item");
    card.innerHTML = `
      <img src="${item.imagem}">
      <h3>${item.nome}</h3>
      <h2>R$${item.preco}/dia</h2>
      <p>${item.cidade}</p>
      <a href="produto.html?id=${item.id}">
        <button class="btn-item">Ver mais</button>
      </a>
    `;
    container.appendChild(card);
    setTimeout(() => card.classList.add("show"), index * 100);
  });
}

// busca
function buscarItens() {
  const termo = inputPesquisa.value.toLowerCase();
  if(termo === "") return mostrarItens(itens);

  const filtrados = itens.filter(item =>
    (item.nome || "").toLowerCase().includes(termo) ||
    (item.cidade || "").toLowerCase().includes(termo)
  );

  mostrarItens(filtrados);
}

btnSearch.addEventListener("click", buscarItens);
inputPesquisa.addEventListener("keyup", (e) => { if(e.key === "Enter") buscarItens(); });

// filtro por categoria
cardsDestaque.forEach(card => {
  card.addEventListener("click", () => {
    const categoria = card.querySelector("p").textContent.toLowerCase();

    const filtrados = categoria === "todos" 
      ? itens 
      : itens.filter(item => (item.categoria || "").toLowerCase() === categoria);

    mostrarItens(filtrados);
  });
});

// iniciar
carregarItens();