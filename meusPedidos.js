import { db, auth } from "./firebaseini.js";
import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const lista = document.getElementById("listaPedidos");

// 🔥 CARREGAR PEDIDOS DO CLIENTE
async function carregarPedidos() {
  const user = auth.currentUser;

  if (!user) {
    alert("Faça login");
    return;
  }

  const q = query(
    collection(db, "pedidos"),
    where("userId", "==", user.uid) // Corrigido para o campo correto no Firestore
  );

  const snap = await getDocs(q);

  lista.innerHTML = "";

  if (snap.empty) {
    lista.innerHTML = "<p>Você ainda não fez pedidos.</p>";
    return;
  }

  snap.forEach((docSnap) => {
    const pedido = docSnap.data();

    // 🔹 Normalizar status para classe CSS
    let statusClass = "";
    const status = (pedido.status || "pendente").toLowerCase();

    switch (status) {
      case "pendente":
        statusClass = "pendente";
        break;
      case "aceito":
      case "aprovado":
        statusClass = "aprovado";
        break;
      case "cancelado":
        statusClass = "cancelado";
        break;
      case "entregue":
        statusClass = "entregue";
        break;
      default:
        statusClass = "pendente";
    }

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${pedido.nomeItem}</h3>
      <p>📅 ${pedido.dias} dias</p>
      <p>💰 Total: R$${pedido.total}</p>
      <p>🚚 Entrega: ${pedido.metodoEntrega || "Retirar"}</p>
      <p class="status ${statusClass}">
        Status: ${pedido.status || "pendente"}
      </p>
    `;

    lista.appendChild(card);
  });
}

// 🔹 INICIALIZAÇÃO
auth.onAuthStateChanged((user) => {
  if (user) carregarPedidos();
});