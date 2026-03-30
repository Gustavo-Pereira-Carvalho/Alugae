import { db, auth } from "./firebaseini.js";

import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const saldoEl = document.getElementById("saldo");
const totalEl = document.getElementById("total");
const pedidosEl = document.getElementById("pedidos");

const TAXA = 0.1; // 10%

async function carregarPainel() {
  const user = auth.currentUser;

  if (!user) return;

  const q = query(
    collection(db, "pedidos"),
    where("vendedorId", "==", user.uid),
    where("status", "==", "aceito")
  );

  const snap = await getDocs(q);

  let total = 0;
  let saldo = 0;
  let pedidos = 0;

  snap.forEach(doc => {
    const p = doc.data();

    const valor = p.total - p.frete; // remove frete
    const comissao = valor * TAXA;

    total += valor;
    saldo += (valor - comissao);
    pedidos++;
  });

  totalEl.innerText = `R$${total.toFixed(2)}`;
  saldoEl.innerText = `R$${saldo.toFixed(2)}`;
  pedidosEl.innerText = pedidos;
}

// saque fake
document.getElementById("btnSaque").onclick = () => {
  alert("Solicitação enviada 💸");
};

auth.onAuthStateChanged(user => {
  if (user) carregarPainel();
});