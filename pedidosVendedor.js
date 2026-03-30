import { db, auth } from "./firebaseini.js";

import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  increment,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const lista = document.getElementById("listaPedidos");

// 🔥 CARREGAR PEDIDOS
async function carregarPedidos() {
  const user = auth.currentUser;

  if (!user) {
    alert("Faça login");
    return;
  }

  const q = query(
    collection(db, "pedidos"),
    where("vendedorId", "==", user.uid)
  );

  const snap = await getDocs(q);

  lista.innerHTML = "";

  if (snap.empty) {
    lista.innerHTML = "<p>Você ainda não recebeu pedidos.</p>";
    return;
  }

  snap.forEach((docSnap) => {
    const pedido = docSnap.data();
    const id = docSnap.id;

    const status = pedido.status || "pendente";

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${pedido.nomeItem}</h3>
      <p>📅 ${pedido.dias} dias</p>
      <p>💰 R$${pedido.total}</p>

      <p class="status ${status}">
        Status: ${status}
      </p>

      <div class="botoes">
        ${status === "pendente" ? `
          <button class="btn aceitar">Aceitar</button>
          <button class="btn recusar">Recusar</button>
        ` : ""}
      </div>
    `;

    const btnAceitar = card.querySelector(".aceitar");
    const btnRecusar = card.querySelector(".recusar");

    if (btnAceitar) {
      btnAceitar.onclick = () => atualizarStatus(id, "aceito");
    }

    if (btnRecusar) {
      btnRecusar.onclick = () => atualizarStatus(id, "recusado");
    }

    lista.appendChild(card);
  });
}

// 🔥 ATUALIZAR STATUS + SALDO + DISPONIBILIDADE
async function atualizarStatus(id, status) {

  const pedidoRef = doc(db, "pedidos", id);
  const pedidoSnap = await getDoc(pedidoRef);
  const pedido = pedidoSnap.data();

  // 🔒 evita duplicar saldo
  if (pedido.status === "aceito") {
    alert("Pedido já foi aceito");
    return;
  }

  // atualiza status
  await updateDoc(pedidoRef, { status });

  // 🔥 SE ACEITOU
  if (status === "aceito") {

    const valorProduto = pedido.total - pedido.frete;
    const comissao = valorProduto * 0.1;
    const valorFinal = valorProduto - comissao;

    // 💰 atualiza saldo
    const vendedorRef = doc(db, "usuarios", pedido.vendedorId);

    await updateDoc(vendedorRef, {
      saldo: increment(valorFinal)
    });

    // 🚫 deixa item indisponível
    if (pedido.itemId) {
      const itemRef = doc(db, "itens", pedido.itemId);

      await updateDoc(itemRef, {
        disponivel: false
      });
    }

    console.log("💰 saldo atualizado:", valorFinal);
  }

  carregarPedidos();
}

// 🚀 INIT
auth.onAuthStateChanged((user) => {
  if (user) carregarPedidos();
});