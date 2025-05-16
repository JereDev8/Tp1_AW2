const listOfProducts = document.querySelector("#product-list");
const filterbyAccesorios = document.querySelector("#filterby-accesorios");
const filterbyCalzados = document.querySelector("#filterby-calzados");
const filterbyRopa = document.querySelector("#filterby-ropa");
const title = document.querySelector(".type-of-product");


async function getProducts() {
    const response = await fetch("http://localhost:3000/api/productos");
    const products = await response.json();
    return products;   
}

async function renderProducts(category) {
    const products = await getProducts();
    const filteredProducts = products.filter(product => product.categoria === category);

    let template = "";


    filteredProducts.forEach(product => {
        template += `
            <div class="card">
                <h3>${product.nombre}</h3>
                <p>${product.descripcion}</p>
                <p>$${product.precio}</p>
            </div>
        `;
    });
    listOfProducts.innerHTML = template;
    title.textContent = `Tipo de producto: ${category}`;
    console.log(products)
}

filterbyAccesorios.addEventListener("click", () => {
    renderProducts("Accesorio");
});
filterbyCalzados.addEventListener("click", () => {
    renderProducts("Calzado");
});
filterbyRopa.addEventListener("click", () => {
    renderProducts("Ropa");
});