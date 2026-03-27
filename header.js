import { auth, db } from "./firebaseini.js";

import { 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ELEMENTOS
const header = document.getElementById("headerActions");
const nav = document.querySelector(".nav");
const logo = document.querySelector(".logo");

// CLICK NA LOGO
if (logo) {
  logo.addEventListener("click", () => {
    window.location.href = "index.html";
  });
}

// FUNÇÃO PRINCIPAL
function renderHeader(user, foto) {

  header.innerHTML = "";

  const isMobile = window.innerWidth <= 1000;

  if (user) {

    // ================= USER =================
    const userBox = document.createElement("div");
    userBox.classList.add("user-box");

    const img = document.createElement("img");
    img.src = foto;
    img.classList.add("user-foto");

    const dropdown = document.createElement("div");
    dropdown.classList.add("dropdown");

    // BOTÕES
    const btnPerfil = document.createElement("button");
    btnPerfil.textContent = "Meu perfil";
    btnPerfil.onclick = () => window.location.href = "perfil.html";

    const btnMeus = document.createElement("button");
    btnMeus.textContent = "Meus anúncios";
    btnMeus.onclick = () => window.location.href = "meus-anuncios.html";

    const btnAnunciar = document.createElement("button");
    btnAnunciar.textContent = "📢 Anunciar";
    btnAnunciar.onclick = () => window.location.href = "anunciar.html";

    const btnSair = document.createElement("button");
    btnSair.textContent = "Sair";
    btnSair.onclick = async () => {
      await signOut(auth);
      window.location.href = "index.html";
    };

    // ORDEM DO DROPDOWN
    dropdown.appendChild(btnPerfil);
    dropdown.appendChild(btnMeus);

    // 👉 MOBILE: botão anunciar dentro do menu
    if (isMobile) {
      dropdown.appendChild(btnAnunciar);
    }

    dropdown.appendChild(btnSair);

    // MONTA
    userBox.appendChild(img);
    userBox.appendChild(dropdown);

    // TOGGLE
    img.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("ativo");
    });

    // FECHAR AO CLICAR FORA
    document.addEventListener("click", () => {
      dropdown.classList.remove("ativo");
    });

    header.appendChild(userBox);

    // ================= DESKTOP =================
    if (!isMobile && nav) {

      const btnAnunciarDesktop = document.createElement("a");
      btnAnunciarDesktop.textContent = "Anunciar";
      btnAnunciarDesktop.href = "anunciar.html";
      btnAnunciarDesktop.classList.add("btn-nav", "destaque");

      // 🔥 COLOCA NA NAV (AO LADO DOS OUTROS)
      nav.appendChild(btnAnunciarDesktop);
    }

  } else {

    // ================= NÃO LOGADO =================
    const btnLogin = document.createElement("button");
    btnLogin.textContent = "Login";
    btnLogin.classList.add("btn-header");

    btnLogin.onclick = () => {
      window.location.href = "login.html";
    };

    header.appendChild(btnLogin);
  }
}

// ================= FIREBASE =================

onAuthStateChanged(auth, async (user) => {

  let foto = "img/user.png";

  if (user) {
    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const dados = snap.data();
      foto = dados.foto || foto;
    }
  }

  renderHeader(user, foto);
});