import { db, auth } from "./firebaseini.js";

import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// pegar ID da URL
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// inputs
const nomeInput = document.getElementById("nomeItem");
const precoInput = document.getElementById("precoItem");
const descricaoInput = document.getElementById("descricaoItem");
const telefoneInput = document.getElementById("telefoneItem");
const imagemInput = document.getElementById("imagemItem");
const categoriaSelect = document.getElementById("categoriaItem");
const entregaSelect = document.getElementById("entregaItem");
const tamanhoSelect = document.getElementById("tamanhoItem");
const btn = document.getElementById("btnSalvar");

let userAtual = null;

// 🔒 PROTEÇÃO + CARREGAR DADOS
onAuthStateChanged(auth, async (user) => {

  if (!user) {
    alert("Você precisa estar logado!");
    window.location.href = "login.html";
    return;
  }

  userAtual = user;

  if (!id) {
    alert("Item inválido");
    window.location.href = "meus-anuncios.html";
    return;
  }

  try {
    const ref = doc(db, "itens", id);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      alert("Item não encontrado");
      window.location.href = "meus-anuncios.html";
      return;
    }

    const item = snap.data();

    // 🔥 SEGURANÇA (não editar item dos outros)
    if (item.userId !== user.uid) {
      alert("Você não pode editar esse item");
      window.location.href = "index.html";
      return;
    }

    // 🧠 PREENCHER FORM
    nomeInput.value = item.nome || "";
    precoInput.value = item.preco || "";
    descricaoInput.value = item.descricao || "";
    telefoneInput.value = item.telefone || "";
    imagemInput.value = item.imagem || "";
    categoriaSelect.value = item.categoria || "";
    entregaSelect.value = item.entrega ? "true" : "false";
    tamanhoSelect.value = item.tamanho || "";

  } catch (erro) {
    console.error(erro);
    alert("Erro ao carregar item");
  }
});

// 💾 SALVAR ALTERAÇÕES
btn.addEventListener("click", async () => {

  const nome = nomeInput.value.trim();
  const preco = precoInput.value.trim();
  const descricao = descricaoInput.value.trim();
  const telefone = telefoneInput.value.trim();
  const imagem = imagemInput.value.trim();
  const categoria = categoriaSelect.value;
  const entrega = entregaSelect.value;
  const tamanho = tamanhoSelect.value;

  if (!nome || !preco || !descricao || !telefone || !imagem || !categoria || entrega === "" || !tamanho) {
    alert("Preencha todos os campos!");
    return;
  }

  try {
    const ref = doc(db, "itens", id);

    await updateDoc(ref, {
      nome,
      preco: Number(preco),
      descricao,
      telefone,
      imagem,
      categoria,
      entrega: entrega === "true",
      tamanho
    });

    alert("Atualizado com sucesso 🚀");
    window.location.href = "meus-anuncios.html";

  } catch (erro) {
    console.error(erro);
    alert("Erro ao atualizar ❌");
  }
});