import { createComparison, rules, defaultRules } from "../lib/compare.js";

export function initSearching(searchField) {
    // Создаем компаратор с правилами:
    // 1. skipEmptyTargetValues — игнорируем пустые значения
    // 2. searchMultipleFields — ищем в нескольких полях
    const compare = createComparison(
        ['skipEmptyTargetValues'],  // ← правила по умолчанию
        [rules.searchMultipleFields(searchField, ['date', 'customer', 'seller'], false)]  // ← кастомные правила
    );
    
    return (data, state, action) => {
        // Получаем значение поиска из state
        const searchValue = state[searchField];
        
        // Если значение пустое, возвращаем все данные
        if (!searchValue) {
            return data;
        }
        
        // Фильтруем данные с помощью компаратора
        return data.filter(item => {
            // Создаем целевой объект с полем search
            const target = { [searchField]: searchValue };
            return compare(item, target);
        });
    };
}