import './fonts/ys-display/fonts.css'
import './style.css'
import {data as sourceData} from "./data/dataset_1.js";
import {initData} from "./data.js";
import {processFormData} from "./lib/utils.js";
import {initTable} from "./components/table.js";
import {initPagination} from "./components/pagination.js";
import {initSorting} from "./components/sorting.js";
import {initFiltering} from "./components/filtering.js";
import {initSearching} from "./components/searching.js";

// Исходные данные используемые в render()
const {data, ...indexes} = initData(sourceData);

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
    const state = processFormData(new FormData(sampleTable.container));
    const rowsPerPage = parseInt(state.rowsPerPage) || 10;
    const page = parseInt(state.page) || 1;

    return {
        ...state,
        rowsPerPage,
        page
    };
}

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
function render(action) {
    console.log('🔄 render вызван');
    
    let state = collectState();
    console.log('📋 state:', state);
    
    let result = [...data];
    
    // Применяем все модули в правильном порядке: сначала поиск, затем фильтрация, сортировка и пагинация
    if (typeof applySearching === 'function') {
        result = applySearching(result, state, action);
    }
    if (typeof applyFiltering === 'function') {
        result = applyFiltering(result, state, action);
    }
    if (typeof applySorting === 'function') {
        result = applySorting(result, state, action);
    }
    if (typeof applyPagination === 'function') {
        result = applyPagination(result, state, action);
    }
    
    console.log('📊 Результат:', result.length, 'строк');
    sampleTable.render(result);
}

const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'],
    after: ['pagination']
}, render);

// @todo: инициализация
const applyPagination = initPagination(
    sampleTable.pagination.elements,
    (el, page, isCurrent) => {
        const input = el.querySelector('input');
        const label = el.querySelector('span');
        input.value = page;
        input.checked = isCurrent;
        label.textContent = page;
        return el;
    }
);

const applySorting = initSorting([
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal
]);

const applyFiltering = initFiltering(
    sampleTable.filter.elements,
    {
        searchBySeller: indexes.sellers,
        searchByCustomer: indexes.customers
    }
);

const applySearching = initSearching('search');

const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

render();