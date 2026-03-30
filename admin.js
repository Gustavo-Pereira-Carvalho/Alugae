import { db, auth } from "./firebaseini.js";

import {
  collection,
  getDocs,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const ganhoEl = document.getElementById("ganho");
const pedidosEl = document.getElementById("pedidos");
const saquesEl = document.getElementById("saques");

const listaPedidos = document.getElementById("listaPedidos");
const listaSaques = document.getElementById("listaSaques");

const TAXA = 0.1;

// 🔥 VERIFICAR ADMIN
async function verificarAdmin(user) {
  const snap = await getDocs(collection(db, "usuarios"));

  let isAdmin = false;

  snap.forEach(doc => {
    const data = doc.data();
    if (doc.id === user.uid && data.admin) {
      isAdmin = true;
    }
  });

  if (!isAdmin) {
    alert("Acesso negado");
    window.location.href = "index.html";
  }
}

// 📦 PEDIDOS
async function carregarPedidos() {
  const snap = await getDocs(collection(db, "pedidos"));

  let ganho = 0;
  let totalPedidos = 0;

  listaPedidos.innerHTML = "";

  snap.forEach(docSnap => {
    const p = docSnap.data();

    totalPedidos++;

    if (p.status === "aceito") {
      const valor = p.total - p.frete;
      ganho += valor * TAXA;
    }

    const div = document.createElement("div");
    div.className = "item";

    div.innerHTML = `
      <p><strong>${p.nomeItem}</strong></p>
      <p>R$${p.total}</p>
      <p>Status: ${p.status}</p>
    `;

    listaPedidos.appendChild(div);
  });

  ganhoEl.innerText = `R$${ganho.toFixed(2)}`;
  pedidosEl.innerText = totalPedidos;
}

// 💸 SAQUES
async function carregarSaques() {
  const snap = await getDocs(collection(db, "saques"));

  let pendentes = 0;

  listaSaques.innerHTML = "";

  snap.forEach(docSnap => {
    const s = docSnap.data();
    const id = docSnap.id;

    if (s.status === "pendente") pendentes++;

    const div = document.createElement("div");
    div.className = "item";

    div.innerHTML = `
      <p>Usuário: ${s.userId}</p>
      <p>Valor: R$${s.valor}</p>
      <p>Status: ${s.status}</p>

      ${s.status === "pendente" ? 
        `<button data-id="${id}">Marcar como pago</button>` 
        : ""}
    `;

    if (s.status === "pendente") {
      div.querySelector("button").onclick = () => pagar(id);
    }

    listaSaques.appendChild(div);
  });

  saquesEl.innerText = pendentes;
}

// 💰 PAGAR
async function pagar(id) {
  await updateDoc(doc(db, "saques", id), {
    status: "pago"
  });

  carregarSaques();
}

// 🚀 INICIAR
auth.onAuthStateChanged(async (user) => {
  if (!user) return;

  await verificarAdmin(user);
  carregarPedidos();
  carregarSaques();
});