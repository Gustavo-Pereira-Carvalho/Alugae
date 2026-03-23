import { auth, db } from "./firebaseini.js";

import { 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const header = document.getElementById("headerActions");
const logo = document.querySelector(".logo");

// clicar na logo
if (logo) {
  logo.addEventListener("click", () => {
    window.location.href = "index.html";
  });
}

onAuthStateChanged(auth, async (user) => {

  header.innerHTML = "";

  if (user) {

    // buscar dados do usuário
    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);

    let foto = "img/user.png";

    if (snap.exists()) {
      const dados = snap.data();
      foto = dados.foto || foto;
    }

    // container
    const userBox = document.createElement("div");
    userBox.classList.add("user-box");

    // foto
    const img = document.createElement("img");
    img.src = foto;
    img.classList.add("user-foto");

    // dropdown
    const dropdown = document.createElement("div");
    dropdown.classList.add("dropdown");

    // botão perfil
    const btnPerfil = document.createElement("button");
    btnPerfil.textContent = "Meu perfil";
    btnPerfil.onclick = () => window.location.href = "perfil.html";

    // botão meus anúncios
    const btnMeus = document.createElement("button");
    btnMeus.textContent = "Meus anúncios";
    btnMeus.onclick = () => window.location.href = "meus-anuncios.html";

    // botão sair
    const btnSair = document.createElement("button");
    btnSair.textContent = "Sair";
    btnSair.onclick = async () => {
      await signOut(auth);
      window.location.href = "index.html";
    };

    dropdown.appendChild(btnPerfil);
    dropdown.appendChild(btnMeus);
    dropdown.appendChild(btnSair);

    userBox.appendChild(img);
    userBox.appendChild(dropdown);

    // abrir/fechar dropdown
    userBox.addEventListener("click", () => {
      dropdown.style.display =
        dropdown.style.display === "flex" ? "none" : "flex";
    });

    header.appendChild(userBox);

  } else {

    const btnLogin = document.createElement("button");
    btnLogin.textContent = "Login";
    btnLogin.classList.add("btn-header");
    btnLogin.onclick = () => window.location.href = "login.html";

    header.appendChild(btnLogin);
  }
});