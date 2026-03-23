import { db, auth } from "./firebaseini.js";
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const container = document.querySelector(".display-itens");
const inputPesquisa = document.querySelector(".pesquisa");
const btnSearch = document.querySelector(".search-button");
const cardsDestaque = document.querySelectorAll(".card-destaque");
const distanciaInput = document.getElementById("distanciaMax");
const btnFiltrarDistancia = document.getElementById("btnFiltrarDistancia");

let itens = [];
let userLat = null;
let userLng = null;

// 🔒 HEADER LOGIN
const btnHeader = document.getElementById("headerActions");
const btnLogin = document.getElementById("btnLogin");
const btnCad = document.getElementById("btnCad");

onAuthStateChanged(auth, (user) => {
  if (user) {
    if(btnLogin) btnLogin.style.display = "none";
    if(btnCad) btnCad.style.display = "none";

    const usuarioDiv = document.createElement("div");
    usuarioDiv.classList.add("btn-usuario");

    const btnPerfil = document.createElement("button");
    btnPerfil.textContent = "Perfil";
    btnPerfil.classList.add("btn-perfil");
    btnPerfil.onclick = () => window.location.href = "perfil.html";

    const btnSair = document.createElement("button");
    btnSair.textContent = "Sair";
    btnSair.classList.add("btn-sair");
    btnSair.onclick = async () => { 
      await signOut(auth); 
      window.location.reload(); 
    };

    usuarioDiv.appendChild(btnPerfil);
    usuarioDiv.appendChild(btnSair);
    btnHeader.appendChild(usuarioDiv);
  }
});

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

// 🎨 MOSTRAR ITENS COM DISTÂNCIA
function mostrarItens(lista) {
  container.innerHTML = "";

  if(lista.length === 0){
    container.innerHTML = `<p class="nenhum-item">Nenhum item encontrado 😔</p>`;
    return;
  }

  const maxDist = Number(distanciaInput.value) || null;

  // calcula distância e ordena proximidade se o usuário tiver permitido localização
  let listaComDistancia = lista.map(item => {
    if(userLat !== null && userLng !== null && item.lat && item.lng){
      item.distancia = calcularDistancia(userLat, userLng, item.lat, item.lng);
    } else {
      item.distancia = null;
    }
    return item;
  });

  // ordenar por proximidade
  listaComDistancia.sort((a,b) => {
    if(a.distancia === null) return 1;
    if(b.distancia === null) return -1;
    return a.distancia - b.distancia;
  });

  // filtrar por raio apenas se o usuário colocar
  const listaFiltrada = maxDist ? listaComDistancia.filter(item => !item.distancia || item.distancia <= maxDist) : listaComDistancia;

  listaFiltrada.forEach((item, index) => {
    const card = document.createElement("div");
    card.classList.add("card-item");

    let distanciaTexto = item.distancia !== null ? `<p>Distância: ${item.distancia.toFixed(1)} km</p>` : "";

    card.innerHTML = `
      <img src="${item.imagem}">
      <h3>${item.nome}</h3>
      <h2>R$${item.preco}/dia</h2>
      <p>${item.cidade}</p>
      ${distanciaTexto}
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
    (item.cidade || "").toLowerCase().includes(termo)
  );

  mostrarItens(filtrados);
}
btnSearch.addEventListener("click", buscarItens);
inputPesquisa.addEventListener("keyup", (e) => { if(e.key==="Enter") buscarItens(); });

// 🎯 FILTRO POR CATEGORIA
cardsDestaque.forEach(card => {
  card.addEventListener("click", () => {
    const categoria = card.dataset.categoria.toLowerCase();
    const filtrados = categoria === "todos"
      ? itens
      : itens.filter(item => (item.categoria || "").toLowerCase() === categoria);

    mostrarItens(filtrados);
  });
});

// 📏 FILTRO DE DISTÂNCIA
btnFiltrarDistancia.addEventListener("click", () => mostrarItens(itens));

// 🚀 LOCALIZAÇÃO
function pegarLocalizacao() {
  if (!navigator.geolocation) {
    console.log("Geolocalização não suportada ❌");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userLat = pos.coords.latitude;
      userLng = pos.coords.longitude;
      console.log("Localização:", userLat, userLng);
      if(itens.length > 0) mostrarItens(itens);
    },
    () => console.log("Permita a localização para usar o filtro de proximidade 📍")
  );
}

// 🔢 FUNÇÃO DISTÂNCIA (Haversine)
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2)**2 +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
function deg2rad(deg) { return deg * (Math.PI/180); }

// 🚀 INICIAL
pegarLocalizacao();
carregarItens();