// Data de ejemplo (esto vendría de tu backend en una aplicación real)
const currentMonthRevenue = 8745;
const lastMonthRevenue = 7400;
const lastYearSameMonthRevenue = 7500;
const monthlyGoal = 12000; // Este se mantiene para las tarjetas superiores
const currentMonthSales = 1248;


// Actualizar las tarjetas de estadísticas
document.getElementById('currentMonthSales').textContent = `${currentMonthSales} uds.`;
document.getElementById('currentMonthRevenue').textContent = `€${currentMonthRevenue.toLocaleString()}`;
document.getElementById('monthlyGoal').textContent = `€${monthlyGoal.toLocaleString()}`;

const completionPercentage = (currentMonthRevenue / monthlyGoal * 100).toFixed(1);
document.getElementById('goalCompletion').textContent = `${completionPercentage}% completado`;

const lastMonthChange = (((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1);
const lastYearChange = (((currentMonthRevenue - lastYearSameMonthRevenue) / lastYearSameMonthRevenue) * 100).toFixed(1);

document.querySelector('#currentMonthRevenue + p').innerHTML = `
    <i class="fas fa-arrow-${lastMonthChange >= 0 ? 'up text-green-500' : 'down text-red-500'} mr-1"></i> ${Math.abs(lastMonthChange)}% vs mes pasado
`;
document.getElementById('yearlyComparison').textContent = `€${lastYearSameMonthRevenue.toLocaleString()}`;
document.querySelector('#yearlyComparison + p').innerHTML = `
    <i class="fas fa-arrow-${lastYearChange >= 0 ? 'up text-green-500' : 'down text-red-500'} mr-1"></i> ${Math.abs(lastYearChange)}% vs Junio 2024
`;


// Gráfica anual de la facturación
// Datos de ejemplo para la gráfica de progreso mensual
// Estos datos deberían venir de tu backend
const facturacionAnioActual = [
    10000, 11000, 9500, 12000, 10500, 8745, null, null, null, null, null, null // Junio es el mes actual, los siguientes son null
];
const facturacionAnioAnterior = [
    9000, 10500, 9200, 11500, 10000, 7500, 8000, 8500, 9000, 10000, 11000, 12000
];
const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// Obtener el mes y año actuales para ajustar la visualización y cargar objetivos
const fechaActual = new Date();
const mesActual = fechaActual.getMonth(); // 0 para Enero, 11 para Diciembre
const anioActual = fechaActual.getFullYear(); // Obtener el año actual

// Asegurarse de que los meses futuros del año actual sean 'null'
// Esto es importante para que la línea no se extienda más allá de los datos reales.
for (let i = mesActual + 1; i < 12; i++) {
    facturacionAnioActual[i] = null;
}

// --- Variables para objetivos globales y persistencia ---
let monthlyGoals = JSON.parse(localStorage.getItem('monthlyGoals')) || {}; // { año: [mes1, mes2, ...], ...}
let goalLineColor = localStorage.getItem('goalLineColor') || '#FF0000'; // Color por defecto para la línea de objetivo

// Referencia global al gráfico para poder actualizarlo
let progressChart;

// Función para cargar objetivos desde localStorage
function loadGoals() {
    const storedGoals = localStorage.getItem('monthlyGoals');
    if (storedGoals) {
        monthlyGoals = JSON.parse(storedGoals);
    } else {
        // Inicializar con objetivos por defecto si no hay ninguno guardado
        monthlyGoals[anioActual] = Array(12).fill(12000); // Objetivos de ejemplo para el año actual
        monthlyGoals[anioActual - 1] = Array(12).fill(11000); // Objetivos de ejemplo para el año anterior
        localStorage.setItem('monthlyGoals', JSON.stringify(monthlyGoals));
    }

    const storedGoalColor = localStorage.getItem('goalLineColor');
    if (storedGoalColor) {
        goalLineColor = storedGoalColor;
    }
}
loadGoals(); // Cargar los objetivos al inicio

// Ajustar el tamaño del contenedor del gráfico
document.querySelector('.chart-container').style.height = '400px';

// Chart Initialization - Gráfica de Líneas para Progreso Mensual
const ctx = document.getElementById('progressChart').getContext('2d');
progressChart = new Chart(ctx, { // Asignamos a la variable global
    type: 'line',
    data: {
        labels: meses,
        datasets: [
            {
                label: 'Año Actual',
                data: facturacionAnioActual,
                borderColor: 'blue',
                backgroundColor: 'rgba(0, 0, 255, 0.1)',
                fill: false,
                tension: 0.4,
                spanGaps: true
            },
            {
                label: 'Año Anterior',
                data: facturacionAnioAnterior,
                borderColor: 'lightblue',
                backgroundColor: 'rgba(173, 216, 230, 0.1)',
                fill: false,
                tension: 0.4,
                borderDash: [5, 5]
            },
            {
                label: 'Objetivo Mensual', // Nueva serie para los objetivos
                data: monthlyGoals[anioActual] || Array(12).fill(null), // Carga los objetivos del año actual
                borderColor: goalLineColor, // Usa el color elegido
                backgroundColor: 'rgba(255, 99, 132, 0.1)',
                fill: false,
                tension: 0.4,
                borderDash: [2, 2] // Línea de objetivos discontinua
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                align: 'end',
                labels: {
                    boxWidth: 12,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            title: {
                display: false,
                text: 'Progreso de Facturación Mensual'
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += '€' + context.parsed.y.toLocaleString();
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Mes'
                }
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Facturación (€)'
                },
                ticks: {
                    callback: function(value) {
                        return '€' + value.toLocaleString();
                    }
                }
            }
        }
    }
});


// --- Elementos del DOM del nuevo modal de objetivos ---
const goalModal = document.getElementById('goalModal');
const closeModalBtn = document.getElementById('closeModal');
const goalYearSelect = document.getElementById('goalYearSelect'); // Selector de año dentro del modal
const monthlyGoalsGrid = document.getElementById('monthlyGoalsGrid'); // Contenedor para los inputs de meses
const saveGoalsBtn = document.getElementById('saveGoals');
const goalLineColorInput = document.getElementById('goalLineColor');

// Obtener el botón "Establecer objetivos" que abre el modal (asegúrate de que tenga el ID 'setGoalsBtn' en tu HTML)
const setGoalsBtn = document.getElementById('setGoalsBtn'); // Este ID debe estar en tu HTML en el botón que abre el modal

// --- Funciones del Modal y Objetivos ---

// Función para inicializar los años en el selector del modal
function initializeYearSelect() {
    const currentYear = new Date().getFullYear();
    // Limpiar opciones previas para evitar duplicados al abrir el modal varias veces
    goalYearSelect.innerHTML = '';
    for (let i = currentYear - 2; i <= currentYear + 5; i++) { // Rango de años, ajusta si es necesario
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        goalYearSelect.appendChild(option);
    }
    goalYearSelect.value = currentYear; // Seleccionar el año actual por defecto
    goalLineColorInput.value = goalLineColor; // Establecer el color guardado
}

// Función para renderizar los inputs de objetivos mensuales para el año seleccionado en el modal
function renderMonthlyGoalInputs(year) {
    monthlyGoalsGrid.innerHTML = ''; // Limpiar la cuadrícula
    const currentYearGoals = monthlyGoals[year] || Array(12).fill(null); // Obtener objetivos del año o array vacío

    // 'meses' ya está definido globalmente.
    meses.forEach((month, index) => {
        const monthDiv = document.createElement('div');
        monthDiv.className = 'flex flex-col'; // Para Tailwind, apilar label e input
        monthDiv.innerHTML = `
            <label for="month-${index + 1}" class="block text-gray-700 text-sm font-medium mb-1">${month}:</label>
            <input type="number" id="month-${index + 1}" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value="${currentYearGoals[index] !== null ? currentYearGoals[index] : ''}" placeholder="€">
        `;
        monthlyGoalsGrid.appendChild(monthDiv);
    });
}

// --- Event Listeners del nuevo modal ---

// Abrir el modal
if (setGoalsBtn) { // Asegúrate de que el botón exista antes de añadir el listener
    setGoalsBtn.addEventListener('click', () => {
        goalModal.classList.remove('hidden');
        initializeYearSelect(); // Inicializa el selector de año y el color
        // anioActual ya está disponible globalmente, pero initializeYearSelect setea goalYearSelect.value
        renderMonthlyGoalInputs(parseInt(goalYearSelect.value)); // Renderizar para el año actualmente seleccionado en el modal
    });
}

// Cerrar el modal
closeModalBtn.addEventListener('click', () => {
    goalModal.classList.add('hidden');
});

// Cerrar el modal haciendo clic fuera de él
window.addEventListener('click', (event) => {
    if (event.target === goalModal) {
        goalModal.classList.add('hidden');
    }
});

// Cambiar los inputs al seleccionar un año diferente en el modal
goalYearSelect.addEventListener('change', (event) => {
    renderMonthlyGoalInputs(parseInt(event.target.value));
});

// Guardar los objetivos y actualizar la gráfica desde el modal
saveGoalsBtn.addEventListener('click', () => {
    const selectedYear = parseInt(goalYearSelect.value);
    const yearGoals = [];
    for (let i = 0; i < 12; i++) {
        const inputElement = document.getElementById(`month-${i + 1}`);
        yearGoals.push(inputElement.value ? parseFloat(inputElement.value) : null); // Guardar null si está vacío
    }
    monthlyGoals[selectedYear] = yearGoals;
    goalLineColor = goalLineColorInput.value; // Guardar el color seleccionado

    localStorage.setItem('monthlyGoals', JSON.stringify(monthlyGoals));
    localStorage.setItem('goalLineColor', goalLineColor);

    // Actualizar la gráfica principal con los nuevos datos de objetivos
    // Asumiendo que tu gráfica principal tiene un selector de año (ej. <select>)
    const chartSelectElement = document.querySelector('.relative select');
    const chartSelectValue = chartSelectElement ? chartSelectElement.value : '';
    const matchYear = chartSelectValue.match(/\d{4}/);
    const currentSelectedYearInChart = matchYear ? parseInt(matchYear[0]) : anioActual; // Usa anioActual si no se encuentra el selector o el año

    progressChart.data.datasets[2].data = monthlyGoals[currentSelectedYearInChart] || Array(12).fill(null);
    progressChart.data.datasets[2].borderColor = goalLineColor; // Actualizar el color de la línea
    progressChart.update();

    alert('Objetivos guardados y gráfica actualizada.');
    goalModal.classList.add('hidden'); // Ocultar el formulario después de guardar
});


// Llama a esta función al cargar la página para asegurar que los objetivos estén cargados
document.addEventListener('DOMContentLoaded', () => {
    // initializeYearSelect() y renderMonthlyGoalInputs() se llaman al abrir el modal,
    // así que no es necesario llamarlos aquí al inicio.
});

// Sample data for the table (you would replace this with real data)
const products = [
    { name: "Agenda Profesional", sales: 452, revenue: 3164, trend: "up" }];