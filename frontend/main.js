const listOfProducts = document.querySelector("#product-list");
localStorage.setItem("cart", JSON.stringify([]));


async function getProducts() {
    const response = await fetch("http://localhost:3000/api/productos");
    const products = await response.json();
    return products;   
}

async function renderProducts() {
    const products = await getProducts();
    let template = "";
    products.forEach(product => {
        template += `
            <div class="card">
                <h3>${product.nombre}</h3>
                <p>${product.descripcion}</p>
                <p>$${product.precio}</p>
                <button data-product-id=${product.id} data-product-name=${product.nombre} data-price=${product.precio} id="aac${product.id}">Agregar al carrito</button>
            </div>
        `;
    });
    listOfProducts.innerHTML = template;
    const addToCartButtons = document.querySelectorAll("[id^='aac']");
    console.log(addToCartButtons)
    console.log(products)

    addToCartButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            const producto = {
                id: e.target.dataset.productId,
                nombre: e.target.dataset.productName,
                precio: e.target.dataset.price
            }
            const cart = JSON.parse(localStorage.getItem("cart"));
            cart.push(producto);
            localStorage.setItem("cart", JSON.stringify(cart));
        });
    });
}

renderProducts();



// console.log(addToCartButtons)
