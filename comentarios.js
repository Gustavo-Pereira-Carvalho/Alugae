import { db, auth } from "./firebaseini.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Elementos
const listaComentarios = document.getElementById("comentariosList");
const comentarioForm = document.getElementById("comentarioForm");
const nomeUsuario = document.getElementById("nomeUsuario");
const mensagemUsuario = document.getElementById("mensagemUsuario");
const estrelasEls = document.querySelectorAll("#estrelinhas span");

let notaSelecionada = 0;

// 🌟 Interação com estrelas
estrelasEls.forEach(span => {
  span.addEventListener("mouseover", () => {
    const star = parseInt(span.dataset.value);
    estrelasEls.forEach(s => {
      s.classList.toggle("filled", parseInt(s.dataset.value) <= star);
    });
  });

  span.addEventListener("mouseout", () => {
    estrelasEls.forEach(s => {
      s.classList.toggle("filled", parseInt(s.dataset.value) <= notaSelecionada);
    });
  });

  span.addEventListener("click", () => {
    notaSelecionada = parseInt(span.dataset.value);
    estrelasEls.forEach(s => {
      s.classList.toggle("filled", parseInt(s.dataset.value) <= notaSelecionada);
    });
  });
});

// 🚀 Carregar comentários
async function carregarComentarios() {
  const q = query(collection(db, "comentarios"), orderBy("criadoEm", "desc"));
  const snap = await getDocs(q);

  listaComentarios.innerHTML = "";

  snap.forEach(docSnap => {
    const c = docSnap.data();
    const div = document.createElement("div");
    div.className = "comentario-item";

    const estrelas = "★".repeat(c.nota) + "☆".repeat(5 - c.nota);

    div.innerHTML = `
      <div class="usuario-info">
        <strong>${c.usuarioNome || "Anônimo"}</strong>
        <span style="color:#ffb400; margin-left:5px;">${estrelas}</span>
      </div>
      <p class="mensagem">${c.texto}</p>
    `;

    listaComentarios.appendChild(div);
  });
}

// 💬 Enviar comentário
comentarioForm.onsubmit = async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) return alert("Faça login para comentar");
  if (notaSelecionada === 0) return alert("Selecione uma nota de 1 a 5 estrelas");
  if (!mensagemUsuario.value.trim()) return alert("Escreva um comentário");

  try {
    await addDoc(collection(db, "comentarios"), {
      usuarioId: user.uid,
      usuarioNome: nomeUsuario.value.trim() || user.displayName || user.email,
      texto: mensagemUsuario.value.trim(),
      nota: notaSelecionada,
      criadoEm: serverTimestamp()
    });

    // Reset
    mensagemUsuario.value = "";
    nomeUsuario.value = "";
    notaSelecionada = 0;
    estrelasEls.forEach(s => s.classList.remove("filled"));

    carregarComentarios();
  } catch (err) {
    console.error(err);
    alert("Erro ao enviar comentário");
  }
};

// 🚀 INIT
carregarComentarios();