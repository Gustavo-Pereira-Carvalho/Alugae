import { db, auth } from "./firebaseini.js";
import { addDoc, collection } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// elementos
const nomeInput = document.getElementById("nomeItem");
const precoInput = document.getElementById("precoItem");
const cidadeInput = document.getElementById("cidadeItem");
const imagemInput = document.getElementById("imagemItem");
const telefoneInput = document.getElementById("telefoneItem");
const categoriaSelect = document.getElementById("categoriaItem");
const btn = document.getElementById("btnSalvar");

// 🔒 PROTEGER PÁGINA
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Você precisa estar logado!");
    window.location.href = "login.html";
  }
});

// 🚀 SALVAR ITEM
async function salvarItem() {
  const user = auth.currentUser;

  const nome = nomeInput.value.trim();
  const preco = precoInput.value.trim();
  const cidade = cidadeInput.value.trim();
  const imagem = imagemInput.value.trim();
  const telefone = telefoneInput.value.trim();
  const categoria = categoriaSelect.value;

  if (!nome || !preco || !cidade || !imagem || !telefone || !categoria) {
    alert("Preencha todos os campos!");
    return;
  }

  await addDoc(collection(db, "itens"), {
    nome,
    preco: Number(preco),
    cidade,
    imagem,
    telefone,
    categoria,
    criadoEm: new Date(),
    userId: user.uid
  });

  alert("Item publicado 🚀");
  window.location.href = "index.html";
}

btn.addEventListener("click", salvarItem);