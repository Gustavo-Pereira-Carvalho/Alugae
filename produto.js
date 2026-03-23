import { db } from "./firebaseini.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// pegar ID do item
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// elementos
const nome = document.getElementById("nome");
const preco = document.getElementById("preco");
const cidade = document.getElementById("cidade");
const endereco = document.getElementById("endereco");
const distanciaEl = document.getElementById("distancia");
const imagem = document.getElementById("imagem");
const btn = document.querySelector(".btn-alugar");

// 👤 dono
const userFoto = document.getElementById("userFoto");
const userNome = document.getElementById("userNome");
const donoBox = document.getElementById("donoBox");

let userLat = null;
let userLng = null;

async function carregarProduto() {
  if (!id) {
    nome.innerText = "Produto inválido ❌";
    return;
  }

  try {
    const docRef = doc(db, "itens", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      nome.innerText = "Produto não encontrado ❌";
      return;
    }

    const item = docSnap.data();

    // preencher dados básicos
    nome.innerText = item.nome;
    preco.innerText = `R$${item.preco}/dia`;
    cidade.innerText = item.cidade || "Cidade não informada";

    // Endereço completo
    endereco.innerText = `${item.endereco || "Endereço não informado"}${item.numero ? ", " + item.numero : ""}`;

    // imagem
    imagem.src = item.imagem || "img/default.png";

    // 👤 DONO
    if (item.userId) {
      try {
        const userRef = doc(db, "usuarios", item.userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          userNome.innerText = userData.nome || "Usuário";
          userFoto.src = userData.foto || "img/user.png";
        } else {
          userNome.innerText = "Usuário";
          userFoto.src = "img/user.png";
        }
      } catch (erro) {
        console.error("Erro ao buscar usuário:", erro);
        userNome.innerText = "Usuário";
        userFoto.src = "img/user.png";
      }
    }

    // clicar no perfil
    donoBox.addEventListener("click", () => {
      if(item.userId){
        window.location.href = `perfilUsuario.html?id=${item.userId}`;
      }
    });

    // botão WhatsApp
    btn.addEventListener("click", () => {
      if (!item.telefone) {
        alert("Esse item não possui telefone ❌");
        return;
      }

      const numero = item.telefone.toString().replace(/\D/g, "");
      if (numero.length < 10) {
        alert("Telefone inválido ❌");
        return;
      }

      const mensagem = `Olá! Tenho interesse no item: ${item.nome}`;
      const url = `https://wa.me/55${numero}?text=${encodeURIComponent(mensagem)}`;
      window.open(url, "_blank");
    });

    // pegar localização do usuário e calcular distância
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          userLat = pos.coords.latitude;
          userLng = pos.coords.longitude;

          // calcular distância se o item tiver lat/lng
          if(item.lat && item.lng){
            const distancia = calcularDistancia(userLat, userLng, item.lat, item.lng);
            distanciaEl.innerText = `Distância: ${distancia.toFixed(1)} km`;
          } else {
            distanciaEl.innerText = "";
          }
        },
        () => { console.log("Permissão de localização negada"); distanciaEl.innerText = ""; }
      );
    } else {
      distanciaEl.innerText = "";
    }

  } catch (erro) {
    console.error("Erro:", erro);
    nome.innerText = "Erro ao carregar ❌";
  }
}

// 🔹 CALCULA DISTÂNCIA EM KM ENTRE DOIS PONTOS
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
function deg2rad(deg) { return deg * (Math.PI/180); }

// iniciar
carregarProduto();