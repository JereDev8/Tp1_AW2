const cart = document.querySelector("#cart-list");
const btnVc = document.querySelector("#vc");
const btnCc = document.querySelector("#cc");

const cartItems = JSON.parse(localStorage.getItem("cart")) || [];



function renderCart() {
    let template = "";
    cartItems.forEach(item => {
        template += `
            <div class="card">
                <h3>${item.nombre}</h3>
                <p>$${item.precio}</p>
            </div>
        `;
    });
    cart.innerHTML = template;
}

btnVc.addEventListener("click", () => {
    localStorage.setItem("cart", JSON.stringify([]));
    cart.innerHTML = "";
    btnCc.disabled = true;
});

btnCc.addEventListener("click", async () => {
    const carrito = JSON.parse(localStorage.getItem("cart"));
    const total = carrito.reduce((acc, item) => acc + parseFloat(item.precio), 0);
    const idsProductos = carrito.map(item => item.id);

    await fetch("http://localhost:3000/api/ventas", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            total,
            productos: idsProductos
        })
    });

    alert("Compra realizada con éxito");
    localStorage.setItem("cart", JSON.stringify([]));
    cart.innerHTML = "";
    btnCc.disabled = true;
});

if(cartItems.length > 0) {
    btnCc.disabled = false;
}
else{
    btnCc.disabled = true;
}



renderCart();