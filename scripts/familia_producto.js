document.addEventListener('DOMContentLoaded', () => {
    const familyDetailTitle = document.getElementById('familyDetailTitle');
    const familyDetailCountry = document.getElementById('familyDetailCountry');
    const familyDetailPhoto = document.getElementById('familyDetailPhoto');
    const familyProductsList = document.getElementById('familyProductsList');
    const noFamilyProductsMessage = document.getElementById('noFamilyProductsMessage');
    const addCompetitorForm = document.getElementById('addCompetitorForm');
    const familyCompetitorsList = document.getElementById('familyCompetitorsList');
    const noCompetitorsMessage = document.getElementById('noCompetitorsMessage');
    const createNewProductBtn = document.getElementById('createNewProductBtn');
    const addExistingProductBtn = document.getElementById('addExistingProductBtn');


    let currentFamily = null; // Variable para almacenar la familia actual

    // Función para obtener el ID de la familia de la URL
    function getFamilyIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return parseInt(urlParams.get('id'));
    }

    // Función para cargar todas las familias desde localStorage
    function loadAllFamilies() {
        return JSON.parse(localStorage.getItem('productFamilies')) || [];
    }

    // Función para guardar todas las familias en localStorage
    function saveAllFamilies(families) {
        localStorage.setItem('productFamilies', JSON.stringify(families));
    }

    // Función para renderizar los detalles de la familia
    function renderFamilyDetails() {
        const familyId = getFamilyIdFromUrl();
        const allFamilies = loadAllFamilies();
        currentFamily = allFamilies.find(f => f.id === familyId);

        if (currentFamily) {
            familyDetailTitle.textContent = currentFamily.title;
            familyDetailCountry.textContent = `País: ${currentFamily.country}`;
            if (currentFamily.photo) {
                familyDetailPhoto.src = currentFamily.photo;
            } else {
                familyDetailPhoto.src = 'https://via.placeholder.com/100'; // Placeholder si no hay foto
            }
            renderFamilyProducts(currentFamily.products);
            renderFamilyCompetitors(currentFamily.competitors);
        } else {
            // Manejar caso de familia no encontrada
            familyDetailTitle.textContent = 'Familia no encontrada';
            familyDetailCountry.textContent = '';
            familyDetailPhoto.src = 'https://via.placeholder.com/100';
            noFamilyProductsMessage.textContent = 'Esta familia no existe o ha sido eliminada.';
            noCompetitorsMessage.textContent = 'Esta familia no existe o ha sido eliminada.';
        }
    }

    // Función para renderizar los productos de la familia (actualmente placeholders)
    function renderFamilyProducts(products) {
        familyProductsList.innerHTML = ''; // Limpiar lista

        if (products.length === 0) {
            noFamilyProductsMessage.classList.remove('hidden');
        } else {
            noFamilyProductsMessage.classList.add('hidden');
            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'bg-gray-100 p-4 rounded-lg shadow-sm flex items-center space-x-4';
                // Aquí podrías añadir un botón para eliminar el producto de la familia si lo deseas
                productCard.innerHTML = `
                    <img src="${product.photo || 'https://via.placeholder.com/60'}" alt="${product.title}" class="w-16 h-16 object-cover rounded-md">
                    <div>
                        <h4 class="font-semibold text-gray-800">${product.title}</h4>
                        <p class="text-sm text-gray-600">Ref: ${product.ref} - Precio: €${product.price ? product.price.toLocaleString() : 'N/A'}</p>
                    </div>
                `;
                familyProductsList.appendChild(productCard);
            });
        }
    }

    // Función para renderizar los competidores de la familia
    function renderFamilyCompetitors(competitors) {
        familyCompetitorsList.innerHTML = ''; // Limpiar lista

        if (competitors.length === 0) {
            noCompetitorsMessage.classList.remove('hidden');
        } else {
            noCompetitorsMessage.classList.add('hidden');
            competitors.forEach(competitor => {
                const competitorCard = document.createElement('div');
                competitorCard.className = 'bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center relative';
                // Botón de eliminar competidor
                competitorCard.innerHTML = `
                    <button class="absolute top-2 right-2 text-red-500 hover:text-red-700 delete-competitor-btn" data-competitor-id="${competitor.id}">
                        <i class="fas fa-times-circle"></i>
                    </button>
                    <img src="${competitor.photo || 'https://via.placeholder.com/80'}" alt="${competitor.title}" class="w-20 h-20 object-cover rounded-md mb-2">
                    <h4 class="font-semibold text-gray-800 text-lg">${competitor.title}</h4>
                    <p class="text-sm text-gray-600">ASIN: ${competitor.asin || 'N/A'}</p>
                    <p class="text-sm text-gray-600">País: ${competitor.country}</p>
                    <p class="text-sm text-gray-600">Vendedor: ${competitor.seller || 'N/A'}</p>
                    <p class="text-lg font-bold text-primary">€${competitor.price ? competitor.price.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}</p>
                    <p class="text-xs text-gray-500">${competitor.ratings ? competitor.ratings.toLocaleString() : '0'} valoraciones</p>
                `;
                familyCompetitorsList.appendChild(competitorCard);
            });
        }
    }

    // Manejar el envío del formulario para añadir un nuevo competidor
    addCompetitorForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const competitorTitle = document.getElementById('competitorTitle').value;
        const competitorASIN = document.getElementById('competitorASIN').value;
        const competitorCountry = document.getElementById('competitorCountry').value;
        const competitorSeller = document.getElementById('competitorSeller').value;
        const competitorPrice = parseFloat(document.getElementById('competitorPrice').value);
        const competitorRatings = parseInt(document.getElementById('competitorRatings').value);
        const competitorPhotoInput = document.getElementById('competitorPhoto');
        let competitorPhotoBase64 = null;

        if (competitorPhotoInput.files.length > 0) {
            const reader = new FileReader();
            reader.onload = (event) => {
                competitorPhotoBase64 = event.target.result;
                addNewCompetitor(competitorTitle, competitorASIN, competitorCountry, competitorSeller, competitorPrice, competitorRatings, competitorPhotoBase64);
            };
            reader.readAsDataURL(competitorPhotoInput.files[0]);
        } else {
            addNewCompetitor(competitorTitle, competitorASIN, competitorCountry, competitorSeller, competitorPrice, competitorRatings, competitorPhotoBase64);
        }
    });

    // Función auxiliar para añadir un nuevo competidor a la familia actual
    function addNewCompetitor(title, asin, country, seller, price, ratings, photo) {
        if (!currentFamily) return; // No hacer nada si no hay una familia cargada

        const newCompetitor = {
            id: Date.now(), // ID único para el competidor
            title: title,
            asin: asin,
            country: country,
            seller: seller,
            price: price,
            ratings: ratings,
            photo: photo
        };

        currentFamily.competitors.push(newCompetitor);

        // Actualizar la familia en la lista global de familias en localStorage
        const allFamilies = loadAllFamilies();
        const familyIndex = allFamilies.findIndex(f => f.id === currentFamily.id);
        if (familyIndex > -1) {
            allFamilies[familyIndex] = currentFamily; // Actualizar la familia en el array
            saveAllFamilies(allFamilies); // Guardar todo el array actualizado
            renderFamilyCompetitors(currentFamily.competitors); // Volver a renderizar los competidores
            addCompetitorForm.reset(); // Limpiar el formulario
            alert('Competidor añadido con éxito!');
        } else {
            alert('Error: Familia no encontrada para actualizar.');
        }
    }

    // Manejar eliminación de competidor
    familyCompetitorsList.addEventListener('click', (e) => {
        const deleteButton = e.target.closest('.delete-competitor-btn');
        if (deleteButton) {
            const competitorIdToDelete = parseInt(deleteButton.dataset.competitorId);
            if (confirm('¿Estás seguro de que quieres eliminar este competidor?')) {
                currentFamily.competitors = currentFamily.competitors.filter(comp => comp.id !== competitorIdToDelete);
                // Volver a guardar la familia actualizada en localStorage
                const allFamilies = loadAllFamilies();
                const familyIndex = allFamilies.findIndex(f => f.id === currentFamily.id);
                if (familyIndex > -1) {
                    allFamilies[familyIndex] = currentFamily;
                    saveAllFamilies(allFamilies);
                    renderFamilyCompetitors(currentFamily.competitors); // Re-renderizar
                }
            }
        }
    });

    // --- Lógica para Productos de la Tienda ---
    // Simulación de "base de datos" de productos de la tienda
    let storeProducts = JSON.parse(localStorage.getItem('storeProducts')) || [];

    // Este botón te redirigirá a la página de creación de productos
    createNewProductBtn.addEventListener('click', () => {
        window.location.href = 'create-product.html';
    });

    // Este botón (por ahora) solo mostrará una alerta.
    // La lógica real implicaría un modal para seleccionar productos existentes.
    addExistingProductBtn.addEventListener('click', () => {
        alert('Aquí se abriría un modal para seleccionar un producto existente de tu "base de datos" de la tienda.');
        // Ejemplo de cómo se añadiría un producto (necesitas la lógica de selección primero)
        // const selectedProduct = { id: Date.now(), title: "Producto Existente", ref: "REF123", price: 99.99, photo: null };
        // if (currentFamily) {
        //     currentFamily.products.push(selectedProduct);
        //     const allFamilies = loadAllFamilies();
        //     const familyIndex = allFamilies.findIndex(f => f.id === currentFamily.id);
        //     if (familyIndex > -1) {
        //         allFamilies[familyIndex] = currentFamily;
        //         saveAllFamilies(allFamilies);
        //         renderFamilyProducts(currentFamily.products);
        //     }
        // }
    });


    // Inicializar la página de detalles
    renderFamilyDetails();
});