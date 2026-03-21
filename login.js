import { auth } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");

const btnLogin = document.getElementById("btnLogin");
const btnCadastro = document.getElementById("btnCadastro");

// LOGIN
btnLogin.addEventListener("click", async () => {
  const email = emailInput.value;
  const senha = senhaInput.value;

  try {
    await signInWithEmailAndPassword(auth, email, senha);
    alert("Logado 🚀");
    window.location.href = "index.html";
  } catch (erro) {
    alert("Erro: " + erro.message);
  }
});

// CADASTRO
btnCadastro.addEventListener("click", async () => {
  const email = emailInput.value;
  const senha = senhaInput.value;

  try {
    await createUserWithEmailAndPassword(auth, email, senha);
    alert("Conta criada 🚀");
  } catch (erro) {
    alert("Erro: " + erro.message);
  }
});