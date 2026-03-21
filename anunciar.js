import { db } from "./firebase.js";

import {
  addDoc,
  collection
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// inputs
const nomeInput = document.getElementById("nomeItem");
const precoInput = document.getElementById("precoItem");
const cidadeInput = document.getElementById("cidadeItem");
const imagemInput = document.getElementById("imagemItem");
const telefoneInput = document.getElementById("telefoneItem");
const btn = document.getElementById("btnSalvar");
import { auth } from "./firebase.js";

import { 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Você precisa estar logado!");
    window.location.href = "login.html";
  } else {
    console.log("Usuário logado:", user.email);
  }
});

async function salvarItem() {
  const nome = nomeInput.value;
  const preco = precoInput.value;
  const cidade = cidadeInput.value;
  const imagem = imagemInput.value;
  const telefone = telefoneInput.value;

  if (!nome || !preco || !cidade || !imagem || !telefone) {
    alert("Preencha tudo!");
    return;
  }

  if (telefone.length < 10) {
    alert("Telefone inválido!");
    return;
  }

  await addDoc(collection(db, "itens"), {
    nome,
    preco: Number(preco),
    cidade,
    imagem,
    telefone,
    criadoEm: new Date()
  });

  alert("Item publicado 🚀");

  window.location.href = "index.html";
}

if (btn) {
  btn.addEventListener("click", salvarItem);
}