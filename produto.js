import { db, auth } from "./firebaseini.js";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ELEMENTOS
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const nomeEl = document.getElementById("nome");
const precoEl = document.getElementById("preco");
const descricaoEl = document.getElementById("descricao");
const imagemEl = document.getElementById("imagem");
const nomeDonoEl = document.getElementById("nomeDono");

const tipoEntrega = document.getElementById("tipoEntrega");
const totalEl = document.getElementById("total");
const btnAlugar = document.getElementById("btnAlugar");
const btnWhats = document.getElementById("btnWhats");
const calendarioEl = document.getElementById("calendario");

let itemGlobal = null;
let datasBloqueadas = [];
let calendarioFlatpickr = null;

// FORMATAR DATA
function formatDate(date) {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();
  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  return [year, month, day].join('-');
}

// CARREGAR PRODUTO
async function carregarProduto() {
  if (!id) {
    nomeEl.innerText = "Produto não encontrado";
    precoEl.innerText = "R$0/dia";
    return;
  }

  const snap = await getDoc(doc(db, "itens", id));
  if (!snap.exists()) return;

  const item = snap.data();
  itemGlobal = item;

  nomeEl.innerText = item.nome;
  precoEl.innerText = `R$${item.preco}/dia`;
  descricaoEl.innerText = item.descricao || "";
  imagemEl.src = item.imagem || "img/default.png";
  nomeDonoEl.innerText = item.nomeUsuario || "Dono";

  // ✅ Ajustar opções de entrega de acordo com o que o anunciante marcou
  tipoEntrega.innerHTML = "";
  tipoEntrega.appendChild(new Option("Retirar no local", "retirar"));

  if (item.entregaOpcoes?.moto) {
    tipoEntrega.appendChild(new Option("Moto (R$20)", "moto"));
  }

  if (item.entregaOpcoes?.carro) {
    tipoEntrega.appendChild(new Option("Carro (R$50)", "carro"));
  }

  await carregarDatasBloqueadas();
  initCalendario();
}

// CARREGAR DATAS BLOQUEADAS
async function carregarDatasBloqueadas() {
  const q = query(
    collection(db, "pedidos"),
    where("itemId", "==", id),
    where("status", "==", "aceito")
  );

  const snap = await getDocs(q);
  datasBloqueadas = [];

  snap.forEach(docSnap => {
    const p = docSnap.data();
    const start = new Date(p.dataInicio.seconds * 1000);
    const end = new Date(p.dataFim.seconds * 1000);

    let current = new Date(start);
    while (current <= end) {
      datasBloqueadas.push(formatDate(current));
      current.setDate(current.getDate() + 1);
    }
  });
}

// INICIALIZAR CALENDÁRIO
function initCalendario() {
  if(calendarioFlatpickr) calendarioFlatpickr.destroy();

  calendarioFlatpickr = flatpickr(calendarioEl, {
    mode: "range",
    minDate: "today",
    dateFormat: "Y-m-d",
    disable: datasBloqueadas,
    onDayCreate: function(dObj, dStr, fp, dayElem) {
      const date = dayElem.dateObj;
      if (datasBloqueadas.includes(formatDate(date))) {
        dayElem.style.background = "#ffcccc";
        dayElem.style.color = "#555";
      }
    },
    onChange: calcularTotal
  });
}

// CALCULAR TOTAL
function calcularTotal(selectedDates = null) {
  if (!itemGlobal) return;

  const dates = selectedDates || calendarioFlatpickr.selectedDates;
  if (dates.length !== 2) {
    totalEl.innerText = `Total: R$0`;
    return;
  }

  const diffTime = Math.abs(dates[1] - dates[0]);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  let frete = 0;
  if (tipoEntrega.value === "moto") frete = 20;
  if (tipoEntrega.value === "carro") frete = 50;

  const total = itemGlobal.preco * diffDays + frete;
  totalEl.innerText = `Total: R$${total.toFixed(2)}`;
}

// VALIDAR DATAS
function validarDatas() {
  const dates = calendarioFlatpickr.selectedDates;
  if (dates.length !== 2) return false;

  let current = new Date(dates[0]);
  const endDate = new Date(dates[1]);

  while(current <= endDate) {
    if (datasBloqueadas.includes(formatDate(current))) {
      alert("Essa data já está alugada!");
      return false;
    }
    current.setDate(current.getDate() + 1);
  }

  return true;
}

// BOTÃO ALUGAR
btnAlugar.addEventListener("click", async () => {
  if (!id) return alert("Produto inválido!");
  const user = auth.currentUser;
  if (!user) return alert("Faça login");
  if (!validarDatas()) return;

  const dates = calendarioFlatpickr.selectedDates;
  const dataInicio = dates[0];
  const dataFim = dates[1];

  let frete = 0;
  if (tipoEntrega.value === "moto") frete = 20;
  if (tipoEntrega.value === "carro") frete = 50;

  const diffTime = Math.abs(dataFim - dataInicio);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const total = itemGlobal.preco * diffDays + frete;

  await addDoc(collection(db, "pedidos"), {
    itemId: id,
    nomeItem: itemGlobal.nome,
    dias: diffDays,
    dataInicio: { seconds: Math.floor(dataInicio.getTime() / 1000) },
    dataFim: { seconds: Math.floor(dataFim.getTime() / 1000) },
    total,
    frete,
    userId: user.uid,
    vendedorId: itemGlobal.userId,
    status: "pendente",
    criadoEm: { seconds: Math.floor(Date.now() / 1000) }
  });

  alert("Pedido feito com sucesso! 🚀");
  await carregarProduto();
});

// BOTÃO WHATS
btnWhats.addEventListener("click", () => {
  const numero = itemGlobal.telefone?.replace(/\D/g, "");
  if (!numero) return;
  window.open(`https://wa.me/55${numero}`);
});

tipoEntrega.addEventListener("change", () => calcularTotal());

// INICIAL
carregarProduto();