import { db, auth } from "./firebaseini.js";
import { addDoc, collection, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// elementos
const nomeInput = document.getElementById("nomeItem");
const precoInput = document.getElementById("precoItem");
const cidadeInput = document.getElementById("cidadeItem");
const enderecoInput = document.getElementById("enderecoItem");
const numeroInput = document.getElementById("numeroItem");
const telefoneInput = document.getElementById("telefoneItem");
const imagemInput = document.getElementById("imagemItem");
const categoriaSelect = document.getElementById("categoriaItem");
const btn = document.getElementById("btnSalvar");

let userAtual = null;
let dadosPerfil = null;

// 🔒 PROTEGER + CARREGAR PERFIL
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Você precisa estar logado!");
    window.location.href = "login.html";
    return;
  }

  userAtual = user;

  try {
    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists() || !snap.data().perfilCompleto) {
      alert("Complete seu perfil primeiro!");
      window.location.href = "perfil.html";
      return;
    }

    dadosPerfil = snap.data();

    // 🔥 AUTO PREENCHER
    cidadeInput.value = dadosPerfil.cidade || "";
    enderecoInput.value = dadosPerfil.endereco || "";
    numeroInput.value = dadosPerfil.numero || "";
    telefoneInput.value = dadosPerfil.telefone || "";

  } catch (erro) {
    console.error("Erro ao buscar perfil:", erro);
    alert("Erro ao carregar perfil");
  }
});

// 🚀 SALVAR ITEM
async function salvarItem() {
  if (!userAtual || !dadosPerfil) {
    alert("Erro de autenticação");
    return;
  }

  const nome = nomeInput.value.trim();
  const preco = precoInput.value.trim();
  const cidade = cidadeInput.value.trim() || dadosPerfil.cidade;
  const endereco = enderecoInput.value.trim() || dadosPerfil.endereco;
  const numero = numeroInput.value.trim() || dadosPerfil.numero;
  const telefone = telefoneInput.value.trim() || dadosPerfil.telefone;
  const imagem = imagemInput.value.trim();
  const categoria = categoriaSelect.value;

  if (!nome || !preco || !cidade || !endereco || !numero || !imagem || !telefone || !categoria) {
    alert("Preencha todos os campos!");
    return;
  }

  // 📍 Transformar endereço completo em lat/lng
  let lat = null;
  let lng = null;

  const enderecoCompleto = `${endereco}, ${numero}, ${cidade}, Brasil`;

  try {
    const pos = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    lat = pos.coords.latitude;
    lng = pos.coords.longitude;

  } catch (erro) {
    console.log("Geolocalização falhou, tentando pelo endereço...");

    try {
      // Geocoding usando Nominatim (OpenStreetMap)
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoCompleto)}`);
      const data = await res.json();

      if (data.length > 0) {
        lat = parseFloat(data[0].lat);
        lng = parseFloat(data[0].lon);
      } else {
        console.log("Não foi possível obter latitude/longitude do endereço");
      }
    } catch (erro2) {
      console.error("Erro ao pegar lat/lng pelo endereço:", erro2);
    }
  }

  try {
    await addDoc(collection(db, "itens"), {
      nome,
      preco: Number(preco),
      cidade,
      endereco,
      numero,
      telefone,
      imagem,
      categoria,
      criadoEm: new Date(),

      // 👤 dados do usuário
      userId: userAtual.uid,
      nomeUsuario: dadosPerfil.nome,
      fotoUsuario: dadosPerfil.foto,

      // 🔥 lat/lng
      lat,
      lng
    });

    alert("Item publicado 🚀");
    window.location.href = "index.html";

  } catch (erro) {
    console.error("Erro ao salvar:", erro);
    alert("Erro ao publicar item");
  }
}

btn.addEventListener("click", salvarItem);