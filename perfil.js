import { auth, db } from "./firebaseini.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const nome = document.getElementById("nome");
const telefone = document.getElementById("telefone");
const cidade = document.getElementById("cidade");
const endereco = document.getElementById("endereco");
const numero = document.getElementById("numero"); // NOVO
const foto = document.getElementById("foto");
const previewFoto = document.getElementById("previewFoto");
const cep = document.getElementById("cep");

const btnCep = document.getElementById("buscarCep");
const salvar = document.getElementById("salvar");

let userAtual = null;

// 🔒 LOGIN
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  userAtual = user;

  const ref = doc(db, "usuarios", user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const data = snap.data();

    nome.value = data.nome || "";
    telefone.value = data.telefone || "";
    cidade.value = data.cidade || "";
    endereco.value = data.endereco || "";
    numero.value = data.numero || ""; // NOVO
    foto.value = data.foto || "";
    cep.value = data.cep || "";

    previewFoto.src = data.foto || "img/user.png";
  }
});

// 🖼️ PREVIEW FOTO
foto.addEventListener("input", () => {
  previewFoto.src = foto.value || "img/user.png";
});

// 📍 CEP AUTOMÁTICO
btnCep.addEventListener("click", async () => {
  const valor = cep.value.replace(/\D/g, "");

  if (valor.length !== 8) {
    alert("CEP inválido");
    return;
  }

  try {
    const res = await fetch(`https://viacep.com.br/ws/${valor}/json/`);
    const data = await res.json();

    if (data.erro) {
      alert("CEP não encontrado");
      return;
    }

    cidade.value = data.localidade;
    endereco.value = data.logradouro;

  } catch (erro) {
    alert("Erro ao buscar CEP");
  }
});

// 💾 SALVAR
salvar.addEventListener("click", async () => {
  if (!nome.value || !telefone.value || !cidade.value || !endereco.value || !numero.value) {
    alert("Preencha os campos obrigatórios!");
    return;
  }

  await setDoc(doc(db, "usuarios", userAtual.uid), {
    nome: nome.value,
    telefone: telefone.value,
    cidade: cidade.value,
    endereco: endereco.value,
    numero: numero.value, // NOVO
    foto: foto.value,
    cep: cep.value,
    perfilCompleto: true
  });

  alert("Perfil salvo 🚀");
});