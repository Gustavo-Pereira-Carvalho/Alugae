import { db, auth } from "./firebaseini.js";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const listaPedidos = document.getElementById("listaPedidos");
const listaSaques = document.getElementById("listaSaques");
const totalPedidosEl = document.getElementById("totalPedidos");
const totalSaquesEl = document.getElementById("totalSaques");

const TAXA = 0.1; // Comissão 10%

// 🔒 Verificar se usuário é admin
async function verificarAdmin(user) {
  const snap = await getDoc(doc(db, "usuarios", user.uid));
  if (!snap.exists() || snap.data().admin !== true) {
    alert("Acesso negado");
    window.location.href = "index.html";
    return false;
  }
  return true;
}

// 📦 Carregar pedidos
async function carregarPedidos() {
  const snap = await getDocs(collection(db, "pedidos"));
  let totalPedidos = 0;
  listaPedidos.innerHTML = "";

  snap.forEach(docSnap => {
    const p = docSnap.data();
    totalPedidos++;

    const card = document.createElement("div");
    card.className = "item";

    card.innerHTML = `
      <p><strong>${p.nomeItem}</strong></p>
      <p>R$${Number(p.total).toFixed(2)}</p>
      <p>Status: ${p.status}</p>
      <p>Entrega: ${p.frete > 0 ? "Com entrega" : "Retirada no local"}</p>
      ${p.status === "pendente" ? `
        <button data-id="${docSnap.id}" class="aceitar">Aceitar</button>
        <button data-id="${docSnap.id}" class="recusar">Recusar</button>
      ` : ""}
    `;

    if (p.status === "pendente") {
      card.querySelector(".aceitar").onclick = () => atualizarStatus(docSnap.id, "aceito");
      card.querySelector(".recusar").onclick = () => atualizarStatus(docSnap.id, "recusado");
    }

    listaPedidos.appendChild(card);
  });

  totalPedidosEl.innerText = totalPedidos;
}

// ✅ Atualizar status do pedido
async function atualizarStatus(id, status) {
  const pedidoRef = doc(db, "pedidos", id);
  const pedidoSnap = await getDoc(pedidoRef);
  const pedido = pedidoSnap.data();

  if (pedido.status === "aceito") return alert("Pedido já aceito");

  await updateDoc(pedidoRef, { status });

  // Atualizar saldo do vendedor
  if (status === "aceito") {
    const valorProduto = pedido.total - pedido.frete;
    const comissao = valorProduto * TAXA;
    const valorFinal = valorProduto - comissao;

    await updateDoc(doc(db, "usuarios", pedido.vendedorId), {
      saldo: increment(valorFinal)
    });
  }

  carregarPedidos();
}

// 💸 Carregar saques
async function carregarSaques() {
  const snap = await getDocs(collection(db, "saques"));
  let totalPendentes = 0;

  listaSaques.innerHTML = "";

  snap.forEach(docSnap => {
    const s = docSnap.data();
    const id = docSnap.id;

    if (s.status === "pendente") totalPendentes++;

    const card = document.createElement("div");
    card.className = "item";

    card.innerHTML = `
      <p>Usuário: ${s.userId}</p>
      <p>Valor: R$${Number(s.valor).toFixed(2)}</p>
      <p>Status: ${s.status}</p>
      ${s.status === "pendente" ? `<button data-id="${id}">Marcar como pago</button>` : ""}
    `;

    if (s.status === "pendente") {
      card.querySelector("button").onclick = () => pagarSaque(id, s.userId, Number(s.valor));
    }

    listaSaques.appendChild(card);
  });

  totalSaquesEl.innerText = totalPendentes;
}

// ✅ Marcar saque como pago e diminuir saldo do vendedor
async function pagarSaque(id, userId, valor) {
  await updateDoc(doc(db, "saques", id), { status: "pago" });
  await updateDoc(doc(db, "usuarios", userId), { saldo: increment(-valor) });
  carregarSaques();
}

// 🚀 Inicializar
auth.onAuthStateChanged(async user => {
  if (!user) return;
  const isAdmin = await verificarAdmin(user);
  if (isAdmin) {
    carregarPedidos();
    carregarSaques();
  }
});