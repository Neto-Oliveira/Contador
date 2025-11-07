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
let startPos = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let animationID;

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
    loadCounters();
    renderCarousel();
    updateCarouselControls();
    
    // Event listeners
    newCounterBtn.addEventListener('click', createNewCounter);
    prevCounterBtn.addEventListener('click', showPreviousCounter);
    nextCounterBtn.addEventListener('click', showNextCounter);
    
    // Event listeners para arraste
    carouselContainer.addEventListener('mousedown', dragStart);
    carouselContainer.addEventListener('touchstart', dragStart);
    carouselContainer.addEventListener('mouseup', dragEnd);
    carouselContainer.addEventListener('touchend', dragEnd);
    carouselContainer.addEventListener('mousemove', drag);
    carouselContainer.addEventListener('touchmove', drag);
    
    // Prevenir comportamento padrão de arraste
    carouselContainer.addEventListener('dragstart', (e) => e.preventDefault());
    
    window.addEventListener('resize', updateCarouselPosition);
}

// Carregar contadores do localStorage
function loadCounters() {
    const savedCounters = localStorage.getItem('counters');
    if (savedCounters) {
        counters = JSON.parse(savedCounters);
    } else {
        // Criar contador padrão se não existir nenhum
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

// Renderizar carrossel
function renderCarousel() {
    carouselContainer.innerHTML = '';
    carouselIndicators.innerHTML = '';
    
    counters.forEach((counter, index) => {
        // Criar wrapper do contador
        const counterWrapper = document.createElement('div');
        counterWrapper.className = 'counter-wrapper';
        counterWrapper.dataset.index = index;
        
        // Criar contador
        counterWrapper.innerHTML = `
            <div class="counter-container style-${counter.style} ${index === currentCounterIndex ? 'active' : ''}" 
                 data-counter-id="${counter.id}">
                <div class="counter-title-section">
                    <input type="text" class="counter-title-input" 
                           value="${counter.title}" 
                           placeholder="Digite um título para o contador">
                    <button class="save-title-btn" onclick="saveCounterTitle(${index})">
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
                    <button class="control-btn decrement-btn" onclick="changeCounterValue(${index}, -1)">-</button>
                    <button class="control-btn reset-btn" onclick="resetCounterValue(${index})">Reset</button>
                    <button class="control-btn increment-btn" onclick="changeCounterValue(${index}, 1)">+</button>
                </div>

                <div class="style-selector">
                    ${[1, 2, 3, 4, 5].map(style => `
                        <button class="style-btn ${counter.style === style.toString() ? 'active' : ''}" 
                                data-style="${style}" 
                                onclick="changeCounterStyle(${index}, '${style}')">
                            ${getStyleName(style)}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        carouselContainer.appendChild(counterWrapper);
        
        // Criar indicador
        const indicator = document.createElement('div');
        indicator.className = `carousel-indicator ${index === currentCounterIndex ? 'active' : ''}`;
        indicator.dataset.index = index;
        indicator.addEventListener('click', () => showCounter(index));
        carouselIndicators.appendChild(indicator);
    });
    
    updateCarouselPosition();
    renderCounterList();
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

// Atualizar posição do carrossel
function updateCarouselPosition() {
    const counterWrappers = document.querySelectorAll('.counter-wrapper');
    counterWrappers.forEach((wrapper, index) => {
        wrapper.style.transform = `translateX(${(index - currentCounterIndex) * 100}%)`;
    });
}

// Mostrar contador específico
function showCounter(index) {
    if (index < 0 || index >= counters.length) return;
    
    currentCounterIndex = index;
    updateCarouselPosition();
    updateCarouselControls();
    updateActiveIndicator();
    renderCounterList();
    
    // Adicionar animação
    const activeCounter = document.querySelector(`.counter-wrapper[data-index="${index}"] .counter-container`);
    activeCounter.classList.add('slide-in');
    setTimeout(() => activeCounter.classList.remove('slide-in'), 300);
}

// Mostrar contador anterior
function showPreviousCounter() {
    if (counters.length <= 1) return;
    const newIndex = (currentCounterIndex - 1 + counters.length) % counters.length;
    showCounter(newIndex);
}

// Mostrar próximo contador
function showNextCounter() {
    if (counters.length <= 1) return;
    const newIndex = (currentCounterIndex + 1) % counters.length;
    showCounter(newIndex);
}

// Atualizar controles do carrossel
function updateCarouselControls() {
    prevCounterBtn.disabled = counters.length <= 1;
    nextCounterBtn.disabled = counters.length <= 1;
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
    const newCounter = new Counter(generateId());
    counters.push(newCounter);
    saveCounters();
    renderCarousel();
    showCounter(counters.length - 1);
}

// Salvar título do contador
function saveCounterTitle(index) {
    const input = document.querySelector(`.counter-wrapper[data-index="${index}"] .counter-title-input`);
    const newTitle = input.value.trim();
    
    if (newTitle) {
        counters[index].title = newTitle;
        saveCounters();
        renderCarousel();
        showCounter(currentCounterIndex);
        
        // Feedback visual
        const saveBtn = document.querySelector(`.counter-wrapper[data-index="${index}"] .save-title-btn`);
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

// Alterar valor do contador
function changeCounterValue(index, change) {
    const newValue = counters[index].value + change;
    if (newValue >= 0) {
        counters[index].value = newValue;
        saveCounters();
        
        // Atualizar visualização
        const valueElement = document.querySelector(`.counter-wrapper[data-index="${index}"] .counter-value`);
        valueElement.textContent = newValue;
        valueElement.classList.add('pulse');
        setTimeout(() => valueElement.classList.remove('pulse'), 300);
        
        renderCounterList();
    }
}

// Resetar valor do contador
function resetCounterValue(index) {
    if (counters[index].value !== 0) {
        counters[index].value = 0;
        saveCounters();
        
        // Atualizar visualização
        const valueElement = document.querySelector(`.counter-wrapper[data-index="${index}"] .counter-value`);
        valueElement.textContent = 0;
        valueElement.classList.add('pulse');
        setTimeout(() => valueElement.classList.remove('pulse'), 300);
        
        renderCounterList();
    }
}

// Alterar estilo do contador
function changeCounterStyle(index, style) {
    counters[index].style = style;
    saveCounters();
    renderCarousel();
    showCounter(currentCounterIndex);
}

// Renderizar lista de contadores
function renderCounterList() {
    counterList.innerHTML = '';
    
    counters.forEach((counter, index) => {
        const listItem = document.createElement('div');
        listItem.className = `counter-list-item ${index === currentCounterIndex ? 'active' : ''}`;
        listItem.innerHTML = `
            <span>${counter.title} (${counter.value})</span>
            ${counters.length > 1 ? `<button class="delete-counter-btn" onclick="deleteCounter(${index})">×</button>` : ''}
        `;
        
        listItem.addEventListener('click', () => showCounter(index));
        counterList.appendChild(listItem);
    });
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

// Funções de arraste
function dragStart(event) {
    if (counters.length <= 1) return;
    
    if (event.type === 'touchstart') {
        startPos = event.touches[0].clientX;
    } else {
        startPos = event.clientX;
        event.preventDefault();
    }
    
    isDragging = true;
    carouselContainer.classList.add('dragging');
    
    animationID = requestAnimationFrame(animation);
}

function drag(event) {
    if (!isDragging) return;
    
    const currentPosition = event.type === 'touchmove' ? event.touches[0].clientX : event.clientX;
    const diff = currentPosition - startPos;
    
    if (Math.abs(diff) > 50) {
        carouselContainer.style.cursor = 'grabbing';
        
        if (diff > 0 && currentCounterIndex > 0) {
            // Arrastando para a direita (anterior)
            showCounter(currentCounterIndex - 1);
            isDragging = false;
        } else if (diff < 0 && currentCounterIndex < counters.length - 1) {
            // Arrastando para a esquerda (próximo)
            showCounter(currentCounterIndex + 1);
            isDragging = false;
        }
    }
}

function dragEnd() {
    if (!isDragging) return;
    
    isDragging = false;
    carouselContainer.classList.remove('dragging');
    carouselContainer.style.cursor = 'grab';
    cancelAnimationFrame(animationID);
}

function animation() {
    if (isDragging) {
        requestAnimationFrame(animation);
    }
}

// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', init);