// Elementos do DOM
const carouselContainer = document.getElementById('carouselContainer');
const carouselIndicators = document.getElementById('carouselIndicators');
const prevCounterBtn = document.getElementById('prevCounterBtn');
const nextCounterBtn = document.getElementById('nextCounterBtn');
const newCounterBtn = document.getElementById('newCounterBtn');
const counterList = document.getElementById('counterList');

// Estado da aplicação
let counters = [];
let currentCounterIndex = 0;
let isDragging = false;
let startX = 0;
let currentX = 0;

// Classe Counter
class Counter {
    constructor(id, title = "Novo Contador", value = 0, style = "1") {
        this.id = id;
        this.title = title;
        this.value = value;
        this.style = style;
    }
}

// Inicialização
function init() {
    console.log('🚀 Inicializando aplicação...');
    loadCounters();
    renderCarousel();
    updateCarouselControls();
    
    // Event listeners
    newCounterBtn.addEventListener('click', createNewCounter);
    prevCounterBtn.addEventListener('click', showPreviousCounter);
    nextCounterBtn.addEventListener('click', showNextCounter);
    
    // Event listeners para arraste
    setupDragEvents();
    
    console.log('✅ Aplicação inicializada com', counters.length, 'contadores');
}

// Configurar eventos de arraste
function setupDragEvents() {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    const startDrag = (clientX) => {
        if (counters.length <= 1) return;
        isDragging = true;
        startX = clientX;
        currentX = clientX;
        carouselContainer.style.cursor = 'grabbing';
    };
    
    const handleDrag = (clientX) => {
        if (!isDragging) return;
        currentX = clientX;
    };
    
    const endDrag = () => {
        if (!isDragging) return;
        
        const diff = currentX - startX;
        const threshold = 50;
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0 && currentCounterIndex > 0) {
                showCounter(currentCounterIndex - 1);
            } else if (diff < 0 && currentCounterIndex < counters.length - 1) {
                showCounter(currentCounterIndex + 1);
            }
        }
        
        isDragging = false;
        carouselContainer.style.cursor = 'grab';
    };
    
    // Mouse events
    carouselContainer.addEventListener('mousedown', (e) => {
        if (e.target.closest('button') || e.target.tagName === 'INPUT') return;
        startDrag(e.clientX);
        e.preventDefault();
    });
    
    carouselContainer.addEventListener('mousemove', (e) => {
        handleDrag(e.clientX);
    });
    
    carouselContainer.addEventListener('mouseup', endDrag);
    carouselContainer.addEventListener('mouseleave', endDrag);
    
    // Touch events
    carouselContainer.addEventListener('touchstart', (e) => {
        if (e.target.closest('button') || e.target.tagName === 'INPUT') return;
        startDrag(e.touches[0].clientX);
    });
    
    carouselContainer.addEventListener('touchmove', (e) => {
        handleDrag(e.touches[0].clientX);
    });
    
    carouselContainer.addEventListener('touchend', endDrag);
}

// Carregar contadores do localStorage
function loadCounters() {
    const savedCounters = localStorage.getItem('counters');
    if (savedCounters) {
        counters = JSON.parse(savedCounters);
    } else {
        counters = [new Counter(generateId())];
        saveCounters();
    }
}

// Gerar ID único
function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Salvar contadores no localStorage
function saveCounters() {
    localStorage.setItem('counters', JSON.stringify(counters));
}

// Obter nome do estilo
function getStyleName(styleNumber) {
    const styles = {
        1: 'Azul',
        2: 'Verde',
        3: 'Roxo',
        4: 'Vermelho',
        5: 'Laranja'
    };
    return styles[styleNumber] || 'Estilo';
}

// Renderizar carrossel completo
function renderCarousel() {
    carouselContainer.innerHTML = '';
    carouselIndicators.innerHTML = '';
    
    if (counters.length === 0) return;
    
    counters.forEach((counter, index) => {
        const counterWrapper = document.createElement('div');
        counterWrapper.className = 'counter-wrapper';
        counterWrapper.dataset.index = index;
        
        counterWrapper.innerHTML = `
            <div class="counter-container style-${counter.style}" data-counter-id="${counter.id}">
                <div class="counter-title-section">
                    <input type="text" class="counter-title-input" 
                           value="${counter.title}" 
                           placeholder="Digite um título para o contador">
                    <button class="save-title-btn" data-index="${index}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M5 12H12H19.5M5 12L7.5 9.5M5 12L7.5 14.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Salvar
                    </button>
                </div>
                
                <div class="counter-display">
                    <div class="counter-value">${counter.value}</div>
                    <div class="counter-title-display">${counter.title}</div>
                </div>
                
                <div class="counter-controls">
                    <button class="control-btn decrement-btn" data-index="${index}">-</button>
                    <button class="control-btn reset-btn" data-index="${index}">Reset</button>
                    <button class="control-btn increment-btn" data-index="${index}">+</button>
                </div>

                <div class="style-selector">
                    ${[1, 2, 3, 4, 5].map(style => `
                        <button class="style-btn ${counter.style === style.toString() ? 'active' : ''}" 
                                data-index="${index}" 
                                data-style="${style}">
                            ${getStyleName(style)}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        carouselContainer.appendChild(counterWrapper);
        
        const indicator = document.createElement('div');
        indicator.className = `carousel-indicator ${index === currentCounterIndex ? 'active' : ''}`;
        indicator.dataset.index = index;
        carouselIndicators.appendChild(indicator);
    });
    
    setupEventListeners();
    scrollToCurrentCounter();
    updateCarouselControls();
    updateActiveIndicator();
    renderCounterList();
}

// Configurar event listeners após renderizar
function setupEventListeners() {
    // Remove event listeners antigos para evitar duplicação
    document.querySelectorAll('.carousel-indicator').forEach(indicator => {
        indicator.replaceWith(indicator.cloneNode(true));
    });
    
    document.querySelectorAll('.save-title-btn, .control-btn, .style-btn, .delete-counter-btn').forEach(btn => {
        btn.replaceWith(btn.cloneNode(true));
    });
    
    // Event listeners para os indicadores
    document.querySelectorAll('.carousel-indicator').forEach(indicator => {
        indicator.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            showCounter(index);
        });
    });
    
    // Event listeners para botões de salvar título
    document.querySelectorAll('.save-title-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            saveCounterTitle(index);
        });
    });
    
    // Event listeners para botões de controle - CORREÇÃO AQUI
    document.querySelectorAll('.decrement-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const index = parseInt(e.target.dataset.index);
            console.log('Decrementando contador:', index);
            changeCounterValue(index, -1);
        }, { once: false });
    });
    
    document.querySelectorAll('.increment-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const index = parseInt(e.target.dataset.index);
            console.log('Incrementando contador:', index);
            changeCounterValue(index, 1);
        }, { once: false });
    });
    
    document.querySelectorAll('.reset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const index = parseInt(e.target.dataset.index);
            resetCounterValue(index);
        }, { once: false });
    });
    
    // Event listeners para botões de estilo
    document.querySelectorAll('.style-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            const style = e.target.dataset.style;
            changeCounterStyle(index, style);
        });
    });
    
    // Event listeners para botões de deletar
    document.querySelectorAll('.delete-counter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(e.target.dataset.index);
            deleteCounter(index);
        });
    });
}

// Scroll para o contador atual
function scrollToCurrentCounter() {
    const currentWrapper = document.querySelector(`.counter-wrapper[data-index="${currentCounterIndex}"]`);
    if (currentWrapper) {
        currentWrapper.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
        });
    }
}

// Mostrar contador específico
function showCounter(index) {
    if (index < 0 || index >= counters.length) return;
    
    currentCounterIndex = index;
    scrollToCurrentCounter();
    updateCarouselControls();
    updateActiveIndicator();
    renderCounterList();
}

// Mostrar contador anterior
function showPreviousCounter() {
    if (counters.length <= 1) return;
    const newIndex = Math.max(0, currentCounterIndex - 1);
    showCounter(newIndex);
}

// Mostrar próximo contador
function showNextCounter() {
    if (counters.length <= 1) return;
    const newIndex = Math.min(counters.length - 1, currentCounterIndex + 1);
    showCounter(newIndex);
}

// Atualizar controles do carrossel
function updateCarouselControls() {
    prevCounterBtn.disabled = currentCounterIndex === 0 || counters.length <= 1;
    nextCounterBtn.disabled = currentCounterIndex === counters.length - 1 || counters.length <= 1;
}

// Atualizar indicador ativo
function updateActiveIndicator() {
    const indicators = document.querySelectorAll('.carousel-indicator');
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentCounterIndex);
    });
}

// Criar novo contador
function createNewCounter() {
    const randomStyle = Math.floor(Math.random() * 5) + 1;
    const newCounter = new Counter(generateId(), "Novo Contador", 0, randomStyle.toString());
    
    counters.push(newCounter);
    saveCounters();
    renderCarousel();
    showCounter(counters.length - 1);
}

// Salvar título do contador
function saveCounterTitle(index) {
    const input = document.querySelector(`.counter-wrapper[data-index="${index}"] .counter-title-input`);
    if (!input) return;
    
    const newTitle = input.value.trim();
    
    if (newTitle) {
        counters[index].title = newTitle;
        saveCounters();
        
        const displayTitle = document.querySelector(`.counter-wrapper[data-index="${index}"] .counter-title-display`);
        if (displayTitle) {
            displayTitle.textContent = newTitle;
        }
        
        renderCounterList();
        
        const saveBtn = document.querySelector(`.counter-wrapper[data-index="${index}"] .save-title-btn`);
        if (saveBtn) {
            const originalText = saveBtn.innerHTML;
            saveBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Salvo!
            `;
            setTimeout(() => {
                saveBtn.innerHTML = originalText;
            }, 1000);
        }
    }
}

// Alterar valor do contador - CORREÇÃO DEFINITIVA
function changeCounterValue(index, change) {
    console.log('Alterando valor:', { index, change, currentValue: counters[index].value });
    
    // SEMPRE muda de 1 em 1, independente do parâmetro
    const newValue = counters[index].value + (change > 0 ? 1 : -1);
    
    if (newValue >= 0) {
        counters[index].value = newValue;
        saveCounters();
        
        const valueElement = document.querySelector(`.counter-wrapper[data-index="${index}"] .counter-value`);
        if (valueElement) {
            valueElement.textContent = newValue;
            valueElement.classList.add('pulse');
            setTimeout(() => valueElement.classList.remove('pulse'), 300);
        }
        
        renderCounterList();
    }
}

// Resetar valor do contador
function resetCounterValue(index) {
    if (counters[index].value !== 0) {
        counters[index].value = 0;
        saveCounters();
        
        const valueElement = document.querySelector(`.counter-wrapper[data-index="${index}"] .counter-value`);
        if (valueElement) {
            valueElement.textContent = 0;
            valueElement.classList.add('pulse');
            setTimeout(() => valueElement.classList.remove('pulse'), 300);
        }
        
        renderCounterList();
    }
}

// Alterar estilo do contador
function changeCounterStyle(index, style) {
    counters[index].style = style;
    saveCounters();
    
    const container = document.querySelector(`.counter-wrapper[data-index="${index}"] .counter-container`);
    if (container) {
        container.classList.remove('style-1', 'style-2', 'style-3', 'style-4', 'style-5');
        container.classList.add(`style-${style}`);
        
        const styleBtns = container.querySelectorAll('.style-btn');
        styleBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.style === style);
        });
    }
}

// Renderizar lista de contadores
function renderCounterList() {
    counterList.innerHTML = '';
    
    counters.forEach((counter, index) => {
        const listItem = document.createElement('div');
        listItem.className = `counter-list-item ${index === currentCounterIndex ? 'active' : ''}`;
        listItem.dataset.index = index;
        listItem.innerHTML = `
            <span>${counter.title} (${counter.value})</span>
            ${counters.length > 1 ? `<button class="delete-counter-btn" data-index="${index}">×</button>` : ''}
        `;
        
        listItem.addEventListener('click', (e) => {
            if (!e.target.classList.contains('delete-counter-btn')) {
                showCounter(index);
            }
        });
        
        counterList.appendChild(listItem);
    });
    
    setupEventListeners();
}

// Deletar contador
function deleteCounter(index) {
    if (counters.length <= 1) {
        alert("Você precisa ter pelo menos um contador!");
        return;
    }
    
    if (confirm(`Tem certeza que deseja excluir o contador "${counters[index].title}"?`)) {
        counters.splice(index, 1);
        
        if (currentCounterIndex >= index) {
            currentCounterIndex = Math.max(0, currentCounterIndex - 1);
        }
        
        saveCounters();
        renderCarousel();
        showCounter(currentCounterIndex);
    }
}

// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', init);