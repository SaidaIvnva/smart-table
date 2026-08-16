import { createComparison, rules } from "../lib/compare.js";

export function initSearching(searchField) {
    // Для поиска используем caseInsensitiveStringIncludes для всех полей
    const compare = createComparison(
        ['skipEmptyTargetValues'],
        [rules.searchMultipleFields(searchField, ['date', 'customer', 'seller'], false)]
    );
    
    return (data, state, action) => {
        // Получаем значение поиска из state
        const searchValue = state[searchField];
        
        // Если значение пустое, возвращаем все данные
        if (!searchValue || searchValue === '') {
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