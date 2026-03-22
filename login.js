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
const termosContainer = document.querySelector(".termos-container");
const checkboxTermos = document.getElementById("aceitoTermos");

// modal
const modal = document.getElementById("modalTermos");
const abrirTermos = document.getElementById("abrirTermos");
const fechar = document.querySelector(".fechar");

// estado
let modo = "login";

// alternar modo login/cadastro
toggle.addEventListener("click", () => {
  if (modo === "login") {
    modo = "cadastro";

    titulo.innerText = "Criar conta";
    btn.innerText = "Cadastrar";
    confirmarInput.style.display = "block";
    termosContainer.style.display = "flex";
    toggle.innerText = "Já tem conta? Entrar";

  } else {
    modo = "login";

    titulo.innerText = "Entrar";
    btn.innerText = "Entrar";
    confirmarInput.style.display = "none";
    termosContainer.style.display = "none";
    toggle.innerText = "Não tem conta? Criar conta";
  }
});

// abrir modal
abrirTermos.addEventListener("click", () => {
    modal.style.display = "block";
});

// fechar modal
fechar.addEventListener("click", () => {
    modal.style.display = "none";
});

// fechar ao clicar fora do modal
window.addEventListener("click", (e) => {
    if (e.target == modal) {
        modal.style.display = "none";
    }
});

// botão principal
btn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const senha = senhaInput.value.trim();
  const confirmar = confirmarInput.value.trim();

  if (!email || !senha) {
    alert("Preencha todos os campos!");
    return;
  }

  if (senha.length < 6) {
    alert("Senha deve ter pelo menos 6 caracteres!");
    return;
  }

  try {
    if (modo === "login") {
      await signInWithEmailAndPassword(auth, email, senha);
      alert("Login realizado 🚀");
      window.location.href = "index.html";
    } else {
      if (senha !== confirmar) {
        alert("As senhas não coincidem!");
        return;
      }

      if (!checkboxTermos.checked) {
        alert("Você precisa aceitar os Termos de Uso!");
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