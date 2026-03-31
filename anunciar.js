import { db, auth } from "./firebaseini.js";
import { addDoc, collection, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ELEMENTOS
const nomeInput = document.getElementById("nomeItem");
const precoInput = document.getElementById("precoItem");
const descricaoInput = document.getElementById("descricaoItem");
const telefoneInput = document.getElementById("telefoneItem");
const imagemInput = document.getElementById("imagemItem");
const categoriaSelect = document.getElementById("categoriaItem");
const tamanhoSelect = document.getElementById("tamanhoItem");
const btn = document.getElementById("btnSalvar");

const entregaMotoCheckbox = document.getElementById("entregaMoto");
const entregaCarroCheckbox = document.getElementById("entregaCarro");
const entregaCaminhaoCheckbox = document.getElementById("entregaCaminhao");

let userAtual = null;
let dadosPerfil = null;

// 🔒 PROTEGER ROTA
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
  const descricao = descricaoInput.value.trim();
  const telefone = telefoneInput.value.trim();
  const imagem = imagemInput.value.trim();
  const categoria = categoriaSelect.value;
  const tamanho = tamanhoSelect.value;

  const entregaMoto = entregaMotoCheckbox.checked;
  const entregaCarro = entregaCarroCheckbox.checked;
  const entregaCaminhao = entregaCaminhaoCheckbox.checked;

  if (!nome || !preco || !descricao || !telefone || !imagem || !categoria || !tamanho) {
    alert("Preencha todos os campos!");
    return;
  }

  if (!entregaMoto && !entregaCarro && !entregaCaminhao) {
    alert("Escolha pelo menos um tipo de entrega!");
    return;
  }

  try {
    await addDoc(collection(db, "itens"), {
      nome,
      preco: Number(preco),
      descricao,
      telefone,
      imagem,
      categoria,
      tamanho,
      entregaOpcoes: {
        moto: entregaMoto,
        carro: entregaCarro,
        caminhao: entregaCaminhao
      },
      criadoEm: new Date(),

      userId: userAtual.uid,
      nomeUsuario: dadosPerfil.nome,
      fotoUsuario: dadosPerfil.foto
    });

    alert("Item publicado 🚀");
    window.location.href = "index.html";

  } catch (erro) {
    console.error("Erro ao salvar:", erro);
    alert("Erro ao publicar item");
  }
}

btn.addEventListener("click", salvarItem);