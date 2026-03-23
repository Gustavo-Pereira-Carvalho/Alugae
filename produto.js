import { db } from "./firebaseini.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// pegar ID da URL
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// elementos
const nome = document.getElementById("nome");
const preco = document.getElementById("preco");
const cidade = document.getElementById("cidade");
const imagem = document.getElementById("imagem");
const btn = document.querySelector(".btn-alugar");

async function carregarProduto() {

  // valida ID
  if (!id) {
    nome.innerText = "Produto inválido ❌";
    return;
  }

  try {
    const docRef = doc(db, "itens", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      nome.innerText = "Produto não encontrado ❌";
      return;
    }

    const item = docSnap.data();

    // DEBUG (pode apagar depois)
    console.log("ITEM:", item);

    // preencher tela
    nome.innerText = item.nome;
    preco.innerText = "R$" + item.preco + "/dia";
    cidade.innerText = item.cidade;
    imagem.src = item.imagem;

    // botão whatsapp
    if (btn) {
      btn.addEventListener("click", () => {

        if (!item.telefone) {
          alert("Esse item não possui telefone ❌");
          return;
        }

        // limpa número (remove tudo que não é número)
        const numero = item.telefone.toString().replace(/\D/g, "");

        console.log("Número limpo:", numero);

        if (numero.length < 10) {
          alert("Telefone inválido ❌");
          return;
        }

        const mensagem = `Olá! Tenho interesse no item: ${item.nome}`;

        const url = `https://wa.me/55${numero}?text=${encodeURIComponent(mensagem)}`;

        window.open(url, "_blank");
      });
    }

  } catch (erro) {
    console.error("Erro ao carregar produto:", erro);
    nome.innerText = "Erro ao carregar produto ❌";
  }
}

// iniciar
carregarProduto();