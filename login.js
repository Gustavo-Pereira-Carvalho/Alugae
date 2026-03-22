import { auth } from "./firebaseini.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// elementos
const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const confirmarInput = document.getElementById("confirmarSenha");

const btn = document.getElementById("btnPrincipal");
const toggle = document.getElementById("toggleModo");
const titulo = document.getElementById("titulo");

// estado
let modo = "login";

// alternar modo
toggle.addEventListener("click", () => {
  if (modo === "login") {
    modo = "cadastro";

    titulo.innerText = "Criar conta";
    btn.innerText = "Cadastrar";
    confirmarInput.style.display = "block";
    toggle.innerText = "Já tem conta? Entrar";

  } else {
    modo = "login";

    titulo.innerText = "Entrar";
    btn.innerText = "Entrar";
    confirmarInput.style.display = "none";
    toggle.innerText = "Não tem conta? Criar conta";
  }
});

// botão principal
btn.addEventListener("click", async () => {

  const email = emailInput.value.trim();
  const senha = senhaInput.value.trim();
  const confirmar = confirmarInput.value.trim();

  // validação básica
  if (!email || !senha) {
    alert("Preencha tudo!");
    return;
  }

  if (senha.length < 6) {
    alert("Senha deve ter pelo menos 6 caracteres");
    return;
  }

  try {

    // LOGIN
    if (modo === "login") {
      await signInWithEmailAndPassword(auth, email, senha);

      alert("Login realizado 🚀");
      window.location.href = "index.html";
    }

    // CADASTRO
    else {
      if (senha !== confirmar) {
        alert("As senhas não coincidem!");
        return;
      }

      await createUserWithEmailAndPassword(auth, email, senha);

      alert("Conta criada com sucesso 🚀");
      window.location.href = "index.html";
    }

  } catch (erro) {
    alert("Erro: " + erro.message);
  }
});