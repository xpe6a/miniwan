// filters.js - Управление фильтрами в каталоге

class FiltersManager {
    constructor() {
        this.filters = {
            brands: [],
            models: [],
            years: [],
            transmissions: [],
            fuelTypes: [],
            seats: [],
            priceRange: { min: 0, max: Infinity },
            depositRange: { min: 0, max: Infinity }
        };
        
        this.allCars = [];
        this.filteredCars = [];
        this.currentPage = 1;
        this.carsPerPage = 9;
        
        this.init();
    }
    
    async init() {
        await this.loadCarsData();
        this.setupFilters();
        this.setupEvents();
        this.applyFilters();
    }
    
    async loadCarsData() {
        try {
            this.allCars = await window.loadCarsData();
            this.filteredCars = [...this.allCars];
        } catch (error) {
            console.error('Ошибка загрузки данных для фильтров:', error);
            this.showError('Ошибка загрузки данных автомобилей');
        }
    }
    
    setupFilters() {
        this.populateBrandFilter();
        this.populateYearFilter();
        this.populateTransmissionFilter();
        this.populateFuelFilter();
        this.populateSeatsFilter();
        this.setupPriceFilter();
        this.setupDepositFilter();
    }
    
    populateBrandFilter() {
        const brandSelect = document.getElementById('brand');
        if (!brandSelect) return;
        
        const brands = [...new Set(this.allCars.map(car => car.brand))].sort();
        
        brandSelect.innerHTML = `
            <option value="">Все марки</option>
            ${brands.map(brand => `
                <option value="${brand}">${brand}</option>
            `).join('')}
        `;
        
        // Динамическое обновление моделей при выборе марки
        brandSelect.addEventListener('change', () => {
            this.populateModelFilter();
            this.applyFilters();
        });
    }
    
    populateModelFilter() {
        const brandSelect = document.getElementById('brand');
        const modelSelect = document.getElementById('model');
        if (!brandSelect || !modelSelect) return;
        
        const selectedBrand = brandSelect.value;
        let models = [];
        
        if (selectedBrand) {
            models = [...new Set(this.allCars
                .filter(car => car.brand === selectedBrand)
                .map(car => car.model)
            )].sort();
        } else {
            models = [...new Set(this.allCars.map(car => car.model))].sort();
        }
        
        modelSelect.innerHTML = `
            <option value="">Все модели</option>
            ${models.map(model => `
                <option value="${model}">${model}</option>
            `).join('')}
        `;
    }
    
    populateYearFilter() {
        const yearSelect = document.getElementById('year');
        if (!yearSelect) return;
        
        const years = [...new Set(this.allCars.map(car => car.year))].sort((a, b) => b - a);
        
        yearSelect.innerHTML = `
            <option value="">Любой год</option>
            ${years.map(year => `
                <option value="${year}">${year}</option>
            `).join('')}
        `;
    }
    
    populateTransmissionFilter() {
        const transmissionSelect = document.getElementById('transmission');
        if (!transmissionSelect) return;
        
        transmissionSelect.innerHTML = `
            <option value="">Любая коробка</option>
            <option value="automatic">Автоматическая</option>
            <option value="manual">Механическая</option>
        `;
    }
    
    populateFuelFilter() {
        const fuelSelect = document.getElementById('fuelType');
        if (!fuelSelect) return;
        
        const fuelTypes = [...new Set(this.allCars.map(car => car.fuelType))].sort();
        
        fuelSelect.innerHTML = `
            <option value="">Любой тип топлива</option>
            ${fuelTypes.map(fuel => `
                <option value="${fuel}">${fuel}</option>
            `).join('')}
        `;
    }
    
    populateSeatsFilter() {
        const seatsSelect = document.getElementById('seats');
        if (!seatsSelect) return;
        
        const seats = [...new Set(this.allCars.map(car => car.seats))].sort((a, b) => a - b);
        
        seatsSelect.innerHTML = `
            <option value="">Любое количество</option>
            ${seats.map(seat => `
                <option value="${seat}">${seat} мест</option>
            `).join('')}
        `;
    }
    
    setupPriceFilter() {
        const minPriceInput = document.getElementById('minPrice');
        const maxPriceInput = document.getElementById('maxPrice');
        
        if (!minPriceInput || !maxPriceInput) return;
        
        // Установка плейсхолдеров с минимальной и максимальной ценой
        const prices = this.allCars.map(car => car.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        
        minPriceInput.placeholder = `От ${minPrice}`;
        maxPriceInput.placeholder = `До ${maxPrice}`;
        
        // Валидация цен
        minPriceInput.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            if (value && maxPriceInput.value && value > parseInt(maxPriceInput.value)) {
                maxPriceInput.value = value;
            }
            this.applyFilters();
        });
        
        maxPriceInput.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            if (value && minPriceInput.value && value < parseInt(minPriceInput.value)) {
                minPriceInput.value = value;
            }
            this.applyFilters();
        });
    }
    
    setupDepositFilter() {
        const depositSelect = document.getElementById('deposit');
        if (!depositSelect) return;
        
        depositSelect.innerHTML = `
            <option value="">Любой залог</option>
            <option value="0-10000">до 10 000 ₽</option>
            <option value="10000-25000">10 000 - 25 000 ₽</option>
            <option value="25000-50000">25 000 - 50 000 ₽</option>
            <option value="50000-100000">50 000 - 100 000 ₽</option>
            <option value="100000+">свыше 100 000 ₽</option>
        `;
    }
    
    setupEvents() {
        // Обработчики для всех фильтров
        const filterElements = [
            'model', 'year', 'transmission', 'fuelType', 'seats', 'deposit'
        ];
        
        filterElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.applyFilters());
            }
        });
        
        // Кнопка сброса фильтров
        const resetBtn = document.querySelector('.clear-filters');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetFilters());
        }
        
        // Обработчики для ценовых диапазонов
        const priceInputs = document.querySelectorAll('input[type="number"]');
        priceInputs.forEach(input => {
            input.addEventListener('input', () => {
                clearTimeout(this.priceTimeout);
                this.priceTimeout = setTimeout(() => this.applyFilters(), 500);
            });
        });
    }
    
    getCurrentFilters() {
        const filters = {};
        
        // Текстовые фильтры
        filters.brand = document.getElementById('brand')?.value || '';
        filters.model = document.getElementById('model')?.value || '';
        filters.year = document.getElementById('year')?.value || '';
        filters.transmission = document.getElementById('transmission')?.value || '';
        filters.fuelType = document.getElementById('fuelType')?.value || '';
        filters.seats = document.getElementById('seats')?.value || '';
        filters.deposit = document.getElementById('deposit')?.value || '';
        
        // Ценовые фильтры
        const minPrice = document.getElementById('minPrice');
        const maxPrice = document.getElementById('maxPrice');
        filters.minPrice = minPrice?.value ? parseInt(minPrice.value) : 0;
        filters.maxPrice = maxPrice?.value ? parseInt(maxPrice.value) : Infinity;
        
        return filters;
    }
    
    applyFilters() {
        const filters = this.getCurrentFilters();
        this.filteredCars = this.allCars.filter(car => this.matchesFilters(car, filters));
        
        this.updateResultsCount();
        this.renderCars();
        this.updatePagination();
        
        // Сохраняем фильтры в URL
        this.updateURLFilters(filters);
    }
    
    matchesFilters(car, filters) {
        // Фильтр по марке
        if (filters.brand && car.brand !== filters.brand) return false;
        
        // Фильтр по модели
        if (filters.model && car.model !== filters.model) return false;
        
        // Фильтр по году
        if (filters.year && car.year !== parseInt(filters.year)) return false;
        
        // Фильтр по коробке передач
        if (filters.transmission && car.transmission !== filters.transmission) return false;
        
        // Фильтр по типу топлива
        if (filters.fuelType && car.fuelType !== filters.fuelType) return false;
        
        // Фильтр по количеству мест
        if (filters.seats && car.seats !== parseInt(filters.seats)) return false;
        
        // Фильтр по цене
        if (car.price < filters.minPrice || car.price > filters.maxPrice) return false;
        
        // Фильтр по залогу
        if (filters.deposit) {
            const [min, max] = this.parseDepositRange(filters.deposit);
            if (car.deposit < min || (max !== Infinity && car.deposit > max)) return false;
        }
        
        return true;
    }
    
    parseDepositRange(range) {
        switch (range) {
            case '0-10000': return [0, 10000];
            case '10000-25000': return [10000, 25000];
            case '25000-50000': return [25000, 50000];
            case '50000-100000': return [50000, 100000];
            case '100000+': return [100000, Infinity];
            default: return [0, Infinity];
        }
    }
    
    updateResultsCount() {
        const countElement = document.getElementById('carsCount');
        if (countElement) {
            const count = this.filteredCars.length;
            countElement.textContent = this.getCountText(count);
        }
    }
    
    getCountText(count) {
        if (count === 0) return 'Ничего не найдено';
        if (count === 1) return 'Найден 1 автомобиль';
        if (count < 5) return `Найдено ${count} автомобиля`;
        return `Найдено ${count} автомобилей`;
    }
    
    renderCars() {
        const grid = document.getElementById('carsGrid');
        if (!grid) return;
        
        if (this.filteredCars.length === 0) {
            grid.innerHTML = this.getNoResultsHTML();
            return;
        }
        
        const startIndex = (this.currentPage - 1) * this.carsPerPage;
        const endIndex = startIndex + this.carsPerPage;
        const carsToShow = this.filteredCars.slice(startIndex, endIndex);
        
        grid.innerHTML = carsToShow.map(car => this.createCarCardHTML(car)).join('');
    }
    
    getNoResultsHTML() {
        return `
            <div class="no-results">
                <div style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 4rem; margin-bottom: 20px;">🚗</div>
                    <h3 style="color: #E8DCC5; margin-bottom: 15px;">Ничего не найдено</h3>
                    <p style="color: #D4C4A8; margin-bottom: 25px;">
                        Попробуйте изменить параметры фильтров или сбросить их
                    </p>
                    <button class="btn btn-primary" onclick="filtersManager.resetFilters()">
                        Сбросить фильтры
                    </button>
                </div>
            </div>
        `;
    }
    
    createCarCardHTML(car) {
        return `
            <div class="car-card" onclick="window.location.href='car-detail.html?id=${car.id}'">
                <div class="car-image">
                    <img src="${car.images[0]}" alt="${car.brand} ${car.model}" 
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                    <div class="image-placeholder" style="display: none;">
                        ${car.brand} ${car.model}
                    </div>
                    ${car.isPopular ? '<div class="car-badge">Популярный</div>' : ''}
                </div>
                <div class="car-info">
                    <h3 class="car-title">${car.brand} ${car.model}</h3>
                    <p class="car-details">${car.year} год • ${car.engine} • ${window.getTransmissionLabel(car.transmission)}</p>
                    <p class="car-details">${car.seats} мест • ${car.fuelType}</p>
                    
                    <div class="car-features">
                        <span class="car-feature">${car.doors} двери</span>
                        <span class="car-feature">${car.airConditioning ? 'Кондиционер' : 'Без кондиционера'}</span>
                    </div>
                    
                    <div class="car-price">
                        ${window.formatPrice(car.price)} ₽ <span class="car-price-period">/ день</span>
                    </div>
                    <div class="car-details">Залог: ${window.formatPrice(car.deposit)} ₽</div>
                    
                    <button class="btn btn-primary book-btn" onclick="event.stopPropagation(); bookCar(${car.id})">
                        Забронировать
                    </button>
                </div>
            </div>
        `;
    }
    
    updatePagination() {
        const pagination = document.getElementById('pagination');
        if (!pagination) return;
        
        const totalPages = Math.ceil(this.filteredCars.length / this.carsPerPage);
        
        if (totalPages <= 1) {
            pagination.style.display = 'none';
            return;
        }
        
        pagination.style.display = 'flex';
        this.renderPagination(totalPages);
    }
    
    renderPagination(totalPages) {
        const pagination = document.getElementById('pagination');
        const pageNumbers = document.getElementById('pageNumbers');
        
        if (!pagination || !pageNumbers) return;
        
        // Кнопки назад/вперед
        const prevBtn = pagination.querySelector('.prev-btn');
        const nextBtn = pagination.querySelector('.next-btn');
        
        if (prevBtn) prevBtn.disabled = this.currentPage === 1;
        if (nextBtn) nextBtn.disabled = this.currentPage === totalPages;
        
        // Номера страниц
        pageNumbers.innerHTML = '';
        const pages = this.getVisiblePages(totalPages);
        
        pages.forEach(page => {
            if (page === '...') {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.style.cssText = 'padding: 8px 12px; color: #D4C4A8;';
                pageNumbers.appendChild(ellipsis);
            } else {
                const pageBtn = document.createElement('button');
                pageBtn.className = `page-number ${page === this.currentPage ? 'active' : ''}`;
                pageBtn.textContent = page;
                pageBtn.onclick = () => this.changePage(page);
                pageNumbers.appendChild(pageBtn);
            }
        });
    }
    
    getVisiblePages(totalPages) {
        const current = this.currentPage;
        const delta = 2;
        const range = [];
        const rangeWithDots = [];
        
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= current - delta && i <= current + delta)) {
                range.push(i);
            }
        }
        
        let prev = 0;
        for (let i of range) {
            if (prev) {
                if (i - prev === 2) {
                    rangeWithDots.push(prev + 1);
                } else if (i - prev !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            prev = i;
        }
        
        return rangeWithDots;
    }
    
    changePage(page) {
        if (page < 1 || page > Math.ceil(this.filteredCars.length / this.carsPerPage)) return;
        
        this.currentPage = page;
        this.renderCars();
        this.updatePagination();
        
        // Прокрутка к верху сетки
        const grid = document.getElementById('carsGrid');
        if (grid) {
            grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    resetFilters() {
        // Сброс значений фильтров
        const filterElements = [
            'brand', 'model', 'year', 'transmission', 'fuelType', 'seats', 'deposit'
        ];
        
        filterElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = '';
        });
        
        const minPrice = document.getElementById('minPrice');
        const maxPrice = document.getElementById('maxPrice');
        if (minPrice) minPrice.value = '';
        if (maxPrice) maxPrice.value = '';
        
        this.currentPage = 1;
        this.applyFilters();
        this.showNotification('Фильтры сброшены', 'success');
    }
    
    updateURLFilters(filters) {
        if (!window.history.pushState) return;
        
        const url = new URL(window.location);
        
        // Очищаем существующие параметры фильтров
        const filterParams = ['brand', 'model', 'year', 'transmission', 'fuelType', 'seats', 'deposit', 'minPrice', 'maxPrice'];
        filterParams.forEach(param => url.searchParams.delete(param));
        
        // Добавляем активные фильтры
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== '' && value !== 0 && value !== Infinity) {
                url.searchParams.set(key, value);
            }
        });
        
        window.history.replaceState({}, '', url);
    }
    
    applyURLFilters() {
        const urlParams = new URLSearchParams(window.location.search);
        
        urlParams.forEach((value, key) => {
            const element = document.getElementById(key);
            if (element) {
                element.value = value;
            }
        });
        
        // Особые случаи для цен
        const minPrice = urlParams.get('minPrice');
        const maxPrice = urlParams.get('maxPrice');
        if (minPrice) document.getElementById('minPrice').value = minPrice;
        if (maxPrice) document.getElementById('maxPrice').value = maxPrice;
    }
    
    showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            alert(message);
        }
    }
    
    showError(message) {
        this.showNotification(message, 'error');
    }
}

// Глобальная инициализация
let filtersManager;

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('carsGrid')) {
        filtersManager = new FiltersManager();
        
        // Применяем фильтры из URL если есть
        setTimeout(() => {
            filtersManager.applyURLFilters();
            filtersManager.applyFilters();
        }, 100);
    }
});

// Глобальные функции для использования в HTML
function bookCar(carId) {
    // Получаем даты из формы на главной странице или устанавливаем по умолчанию
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    let startDate = '';
    let endDate = '';
    
    if (startDateInput && endDateInput) {
        startDate = startDateInput.value || '';
        endDate = endDateInput.value || '';
    }
    
    // Если даты не выбраны, устанавливаем значения по умолчанию
    if (!startDate || !endDate) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        startDate = today.toISOString().split('T')[0];
        endDate = tomorrow.toISOString().split('T')[0];
    }
    
    window.location.href = `booking.html?carId=${carId}&startDate=${startDate}&endDate=${endDate}`;
}

function applyFilters() {
    if (filtersManager) {
        filtersManager.applyFilters();
    }
}

function resetFilters() {
    if (filtersManager) {
        filtersManager.resetFilters();
    }
}

function changePage(page) {
    if (filtersManager) {
        filtersManager.changePage(page);
    }
}

// Экспорт для использования в других файлах
window.filtersManager = filtersManager;
window.bookCar = bookCar;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.changePage = changePage;