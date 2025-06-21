document.addEventListener('DOMContentLoaded', () => {
    const createFamilyForm = document.getElementById('createFamilyForm');
    const productFamiliesGrid = document.getElementById('productFamiliesGrid');
    const noFamiliesMessage = document.getElementById('noFamiliesMessage');

    // Función para cargar familias desde localStorage
    function loadFamilies() {
        const families = JSON.parse(localStorage.getItem('productFamilies')) || [];
        return families;
    }

    // Función para guardar familias en localStorage
    function saveFamilies(families) {
        localStorage.setItem('productFamilies', JSON.stringify(families));
    }

    // Función para renderizar las tarjetas de las familias
    function renderFamilies() {
        const families = loadFamilies();
        productFamiliesGrid.innerHTML = ''; // Limpiar la cuadrícula antes de renderizar

        if (families.length === 0) {
            noFamiliesMessage.classList.remove('hidden'); // Mostrar mensaje si no hay familias
        } else {
            noFamiliesMessage.classList.add('hidden'); // Ocultar mensaje si hay familias
            families.forEach(family => {
                const familyCard = document.createElement('div');
                familyCard.className = 'bg-white rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105 cursor-pointer';
                familyCard.dataset.familyId = family.id; // Para identificar la familia al hacer clic

                let photoHtml = '';
                if (family.photo) {
                    photoHtml = `<img src="${family.photo}" alt="${family.title}" class="w-full h-48 object-cover">`;
                } else {
                    // Placeholder si no hay foto
                    photoHtml = `<div class="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                                    <i class="fas fa-image fa-3x"></i>
                                 </div>`;
                }

                familyCard.innerHTML = `
                    ${photoHtml}
                    <div class="p-4">
                        <h3 class="text-xl font-semibold text-gray-800 mb-2">${family.title}</h3>
                        <p class="text-gray-600 text-sm mb-3">País: ${family.country}</p>
                        <button class="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90 transition duration-150 ease-in-out enter-family-btn">
                            <i class="fas fa-arrow-right mr-2"></i> Entrar
                        </button>
                    </div>
                `;
                productFamiliesGrid.appendChild(familyCard);
            });
        }
    }

    // Manejar el envío del formulario para crear una nueva familia
    createFamilyForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Evitar que la página se recargue

        const familyTitle = document.getElementById('familyTitle').value;
        const familyCountry = document.getElementById('familyCountry').value;
        const familyPhotoInput = document.getElementById('familyPhoto');
        let familyPhotoBase64 = null;

        // Leer la imagen como Base64 si se ha seleccionado una
        if (familyPhotoInput.files.length > 0) {
            const reader = new FileReader();
            reader.onload = (event) => {
                familyPhotoBase64 = event.target.result;
                addNewFamily(familyTitle, familyCountry, familyPhotoBase64);
            };
            reader.readAsDataURL(familyPhotoInput.files[0]);
        } else {
            addNewFamily(familyTitle, familyCountry, familyPhotoBase64);
        }
    });

    // Función auxiliar para añadir la nueva familia
    function addNewFamily(title, country, photo) {
        const families = loadFamilies();
        const newFamily = {
            id: Date.now(), // Un ID único simple basado en el timestamp
            title: title,
            country: country,
            photo: photo, // La imagen en Base64
            products: [], // Array para productos de la familia
            competitors: [] // Array para productos competidores
        };

        families.push(newFamily);
        saveFamilies(families); // Guardar la lista actualizada
        renderFamilies(); // Volver a renderizar las tarjetas para mostrar la nueva familia
        createFamilyForm.reset(); // Limpiar el formulario
        alert('Familia de producto creada con éxito!');
    }

    // Manejar el clic en las tarjetas de familia para "entrar" en la familia
    productFamiliesGrid.addEventListener('click', (e) => {
        const enterButton = e.target.closest('.enter-family-btn');
        if (enterButton) {
            const familyCard = enterButton.closest('[data-family-id]');
            const familyId = familyCard.dataset.familyId;
            // Redirigir a la página de detalles de la familia, pasando el ID
            window.location.href = `familia_producto.html?id=${familyId}`;
        }
    });

    // Renderizar las familias existentes al cargar la página
    renderFamilies();
});