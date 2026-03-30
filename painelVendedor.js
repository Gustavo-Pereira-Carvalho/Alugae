import { db, auth } from "./firebaseini.js";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const saldoEl = document.getElementById("saldo");
const totalEl = document.getElementById("total");
const pedidosEl = document.getElementById("pedidos");
const btnSaque = document.getElementById("btnSaque");

const TAXA = 0.1;

// 🔥 CARREGAR DADOS DO PAINEL
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

  snap.forEach(docSnap => {
    const p = docSnap.data();
    const valor = p.total - p.frete;
    const comissao = valor * TAXA;

    total += valor;
    saldo += valor - comissao;
    pedidos++;
  });

  totalEl.innerText = `R$${total.toFixed(2)}`;
  saldoEl.innerText = `R$${saldo.toFixed(2)}`;
  pedidosEl.innerText = pedidos;
}

// 💸 SOLICITAR SAQUE
btnSaque.onclick = async () => {
  const user = auth.currentUser;
  if (!user) return alert("Faça login");

  const saldoAtual = parseFloat(saldoEl.innerText.replace("R$", "").replace(",", "."));
  if (saldoAtual <= 0) return alert("Saldo insuficiente");

  try {
    await addDoc(collection(db, "saques"), {
      userId: user.uid,
      valor: saldoAtual,
      status: "pendente",
      criadoEm: { seconds: Math.floor(Date.now() / 1000) }
    });
    alert(`Saque de R$${saldoAtual.toFixed(2)} solicitado com sucesso! 💸`);
  } catch (err) {
    console.error(err);
    alert("Erro ao solicitar saque");
  }
};

// 🚀 INIT
auth.onAuthStateChanged(user => {
  if (user) carregarPainel();
});