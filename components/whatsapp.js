export function initWhatsAppButton() {
  const button = `
    <a href="https://wa.me/5511972681424" 
       class="whatsapp-float" 
       target="_blank">
       💬
    </a>
  `;

  document.body.insertAdjacentHTML("beforeend", button);
}