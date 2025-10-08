// main.js - Основные функции для всего сайта

// Глобальные переменные
let currentCars = [];
let currentFilters = {};

// Инициализация сайта
document.addEventListener('DOMContentLoaded', function() {
    initSite();
});

// Основная функция инициализации
function initSite() {
    console.log('MinivanRent инициализирован');
    
    // Инициализация модальных окон
    initModals();
    
    // Загрузка данных для главной страницы
    if (document.getElementById('carouselInner')) {
        loadCarouselData();
    }
    
    // Загрузка данных для каталога
    if (document.getElementById('carsGrid')) {
        loadCatalogData();
    }
    
    // Инициализация фильтров на главной странице
    initHomePageFilters();
}

// ==================== УПРАВЛЕНИЕ МОДАЛЬНЫМИ ОКНАМИ ====================

function initModals() {
    // Закрытие модальных окон при клике вне их
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });

    // Закрытие модальных окон при нажатии Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal[style*="display: block"]');
            openModals.forEach(modal => closeModal(modal.id));
        }
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// ==================== ОТПРАВКА ФОРМ ====================

function submitChatForm(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    // В реальном проекте здесь будет отправка на email
    console.log('Сообщение в поддержку:', data);
    
    // Показываем уведомление
    showNotification('Сообщение отправлено! Мы ответим вам в течение 24 часов.', 'success');
    
    // Закрываем модальное окно
    closeModal('chatModal');
    event.target.reset();
}

function submitCallbackForm(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    // В реальном проекте здесь будет отправка на email
    console.log('Запрос обратного звонка:', data);
    
    // Показываем уведомление
    showNotification('Спасибо! Мы свяжемся с вами в ближайшее время.', 'success');
    
    // Закрываем модальное окно
    closeModal('callbackModal');
    event.target.reset();
}

// ==================== УВЕДОМЛЕНИЯ ====================

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? 'rgba(93, 139, 43, 0.9)' : 'rgba(139, 90, 43, 0.9)'};
        color: white;
        border-radius: 5px;
        z-index: 1002;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Автоматическое скрытие через 5 секунд
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Добавляем стили для анимаций уведомлений
if (!document.querySelector('#notificationStyles')) {
    const notificationStyles = `
        <style id="notificationStyles">
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        </style>
    `;
    document.head.insertAdjacentHTML('beforeend', notificationStyles);
}

// ==================== РАБОТА С ДАННЫМИ АВТОМОБИЛЕЙ ====================

// Загрузка данных автомобилей
async function loadCarsData() {
    try {
        const response = await fetch('data/cars.json');
        if (!response.ok) {
            throw new Error('Ошибка загрузки данных');
        }
        const cars = await response.json();
        return cars;
    } catch (error) {
        console.error('Ошибка загрузки данных автомобилей:', error);
        showNotification('Ошибка загрузки данных. Пожалуйста, обновите страницу.', 'error');
        return [];
    }
}

// Получение цены автомобиля в зависимости от количества дней
function getCarPrice(car, days = 1) {
    if (!car.prices) {
        console.warn('У автомобиля нет данных о ценах', car);
        return 0;
    }
    
    // Определяем подходящую цену в зависимости от количества дней
    if (days >= 21 && car.prices["21"]) {
        return car.prices["21"];
    } else if (days >= 14 && car.prices["14"]) {
        return car.prices["14"];
    } else if (days >= 7 && car.prices["7"]) {
        return car.prices["7"];
    } else if (days >= 4 && car.prices["4"]) {
        return car.prices["4"];
    } else {
        return car.prices["1"];
    }
}

// Получение всех цен автомобиля для отображения
function getCarAllPrices(car) {
    if (!car.prices) {
        return [];
    }
    
    return [
        { days: 1, price: car.prices["1"] },
        { days: 4, price: car.prices["4"] },
        { days: 7, price: car.prices["7"] },
        { days: 14, price: car.prices["14"] },
        { days: 21, price: car.prices["21"] }
    ];
}

// Получение правил аренды автомобиля
function getCarRentalRules(car) {
    const rules = [];
    
    // Депозит
    rules.push({
        label: 'Депозит',
        value: `${formatPrice(car.deposit)} ₽`
    });
    
    // Минимальный стаж вождения
    if (car.rentalRules && car.rentalRules.minExperience) {
        rules.push({
            label: 'Минимальный стаж вождения',
            value: `${car.rentalRules.minExperience} ${getYearsText(car.rentalRules.minExperience)}`
        });
    } else {
        rules.push({
            label: 'Минимальный стаж вождения',
            value: '3 года'
        });
    }
    
    // Минимальный возраст
    if (car.rentalRules && car.rentalRules.minAge) {
        rules.push({
            label: 'Минимальный возраст',
            value: `${car.rentalRules.minAge} ${getYearsText(car.rentalRules.minAge)}`
        });
    } else {
        rules.push({
            label: 'Минимальный возраст',
            value: '23 года'
        });
    }
    
    return rules;
}

// Вспомогательная функция для правильного склонения "лет/года/год"
function getYearsText(number) {
    if (number % 10 === 1 && number % 100 !== 11) {
        return 'год';
    } else if ([2, 3, 4].includes(number % 10) && ![12, 13, 14].includes(number % 100)) {
        return 'года';
    } else {
        return 'лет';
    }
}

// Утилиты для работы с автомобилями
function getTransmissionLabel(transmission) {
    return transmission === 'automatic' ? 'Автоматическая' : 'Механическая';
}

function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU').format(price);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Поиск автомобиля по ID
function findCarById(carId, cars) {
    return cars.find(car => car.id == carId);
}

// Фильтрация автомобилей (обновленная для работы с новой структурой цен)
function filterCars(cars, filters) {
    return cars.filter(car => {
        // Фильтр по марке
        if (filters.brands && filters.brands.length > 0 && !filters.brands.includes(car.brand)) {
            return false;
        }
        
        // Фильтр по году
        if (filters.years && filters.years.length > 0 && !filters.years.includes(car.year)) {
            return false;
        }
        
        // Фильтр по коробке передач
        if (filters.transmissions && filters.transmissions.length > 0 && !filters.transmissions.includes(car.transmission)) {
            return false;
        }
        
        // Фильтр по цене (используем цену за 1 день для фильтрации)
        const basePrice = car.prices ? car.prices["1"] : 0;
        if (filters.minPrice && basePrice < filters.minPrice) return false;
        if (filters.maxPrice && basePrice > filters.maxPrice) return false;
        
        // Фильтр по количеству мест
        if (filters.seats && filters.seats.length > 0 && !filters.seats.includes(car.seats)) {
            return false;
        }
        
        return true;
    });
}

// ==================== УТИЛИТЫ ====================

// Валидация email
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Валидация телефона
function isValidPhone(phone) {
    return /^[\+]?[78][\s\(]?\d{3}[\)\s]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/.test(phone);
}

// Генерация случайного ID для заявок
function generateBookingId() {
    return 'MV-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Сохранение в localStorage
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Ошибка сохранения в localStorage:', error);
        return false;
    }
}

// Загрузка из localStorage
function loadFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Ошибка загрузки из localStorage:', error);
        return null;
    }
}

// ==================== ФУНКЦИИ ДЛЯ КАРУСЕЛИ И КАТАЛОГА ====================

// Загрузка данных для карусели (если есть на странице)
async function loadCarouselData() {
    try {
        const cars = await loadCarsData();
        const popularCars = cars.filter(car => car.isPopular).slice(0, 5);
        
        if (popularCars.length > 0) {
            renderCarousel(popularCars);
        }
    } catch (error) {
        console.error('Ошибка загрузки данных для карусели:', error);
    }
}

// Загрузка данных для каталога (если есть на странице)
async function loadCatalogData() {
    try {
        const cars = await loadCarsData();
        currentCars = cars;
        renderCarsGrid(cars);
        setupFilters(cars);
    } catch (error) {
        console.error('Ошибка загрузки данных для каталога:', error);
    }
}

// Рендер карусели
function renderCarousel(cars) {
    const carouselInner = document.getElementById('carouselInner');
    if (!carouselInner) return;
    
    carouselInner.innerHTML = cars.map((car, index) => `
        <div class="carousel-item ${index === 0 ? 'active' : ''}">
            <div class="car-card">
                <div class="car-image">
                    <img src="${car.images[0]}" alt="${car.brand} ${car.model}" 
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='block'">
                    <div class="image-placeholder" style="display: none;">${car.brand} ${car.model}</div>
                </div>
                <div class="car-info">
                    <h3>${car.brand} ${car.model}</h3>
                    <p class="car-year">${car.year} год</p>
                    <p class="car-specs">${car.engine} • ${getTransmissionLabel(car.transmission)} • ${car.seats} мест</p>
                    <div class="car-price">${formatPrice(car.prices["1"])} ₽/день</div>
                    <a href="car-detail.html?id=${car.id}" class="btn btn-primary">Подробнее</a>
                </div>
            </div>
        </div>
    `).join('');
}

// Рендер сетки автомобилей
function renderCarsGrid(cars) {
    const carsGrid = document.getElementById('carsGrid');
    if (!carsGrid) return;
    
    if (cars.length === 0) {
        carsGrid.innerHTML = '<div class="no-results"><p>По вашему запросу ничего не найдено</p></div>';
        return;
    }
    
    carsGrid.innerHTML = cars.map(car => `
        <div class="car-card" onclick="window.location.href='car-detail.html?id=${car.id}'">
            <div class="car-image">
                <img src="${car.images[0]}" alt="${car.brand} ${car.model}" 
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                <div class="image-placeholder">${car.brand} ${car.model}</div>
                ${car.isPopular ? '<div class="popular-badge">Популярный</div>' : ''}
            </div>
            <div class="car-info">
                <h3>${car.brand} ${car.model}</h3>
                <p class="car-year">${car.year} год</p>
                <p class="car-specs">${car.engine} • ${getTransmissionLabel(car.transmission)} • ${car.seats} мест</p>
                <div class="car-price">от ${formatPrice(car.prices["1"])} ₽/день</div>
            </div>
        </div>
    `).join('');
}

// Настройка фильтров
function setupFilters(cars) {
    // Здесь будет логика для инициализации фильтров
    // (можно добавить позже при необходимости)
}

// ==================== ФИЛЬТРЫ НА ГЛАВНОЙ СТРАНИЦЕ ====================

function initHomePageFilters() {
    // Инициализация фильтров только на главной странице
    const filtersSection = document.querySelector('.filters-section');
    if (!filtersSection) return;
    
    const applyBtn = filtersSection.querySelector('.btn-primary');
    const resetBtn = filtersSection.querySelector('.btn-secondary');
    
    if (applyBtn) {
        applyBtn.addEventListener('click', function() {
            // Перенаправляем в каталог с примененными фильтрами
            window.location.href = 'catalog.html';
        });
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            // Сбрасываем все фильтры
            const filterElements = filtersSection.querySelectorAll('select, input');
            filterElements.forEach(element => {
                if (element.type === 'text' || element.type === 'number') {
                    element.value = '';
                } else {
                    element.selectedIndex = 0;
                }
            });
            showNotification('Фильтры сброшены', 'success');
        });
    }
}

// ==================== ЭКСПОРТ ФУНКЦИЙ ДЛЯ ИСПОЛЬЗОВАНИЯ В ДРУГИХ ФАЙЛАХ ====================

// Делаем функции доступными глобально для использования в HTML
window.openModal = openModal;
window.closeModal = closeModal;
window.submitChatForm = submitChatForm;
window.submitCallbackForm = submitCallbackForm;
window.showNotification = showNotification;
window.loadCarsData = loadCarsData;
window.findCarById = findCarById;
window.filterCars = filterCars;
window.getTransmissionLabel = getTransmissionLabel;
window.formatPrice = formatPrice;
window.formatDate = formatDate;
window.isValidEmail = isValidEmail;
window.isValidPhone = isValidPhone;
window.generateBookingId = generateBookingId;
window.saveToLocalStorage = saveToLocalStorage;
window.loadFromLocalStorage = loadFromLocalStorage;
window.getCarPrice = getCarPrice;
window.getCarAllPrices = getCarAllPrices;
window.getCarRentalRules = getCarRentalRules;