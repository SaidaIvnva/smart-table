import { compare, rules } from "../lib/compare.js";

export function initFiltering(elements, indexes) {
    // @todo: #4.1 — заполнить выпадающие списки опциями
    Object.keys(indexes)
        .forEach((elementName) => {
            if (elements[elementName]) {
                elements[elementName].append(
                    ...Object.values(indexes[elementName])
                        .map(name => new Option(name, name))
                );
            }
        });

    return (data, state, action) => {
        // @todo: #4.2 — обработать очистку поля
        if (action && action.name === 'clear') {
            const parent = action.closest('.filter-wrapper');
            
            if (parent) {
                const input = parent.querySelector('input, select');
                
                if (input) {
                    if (input.tagName === 'SELECT') {
                        input.selectedIndex = 0;
                    } else {
                        input.value = '';
                    }
                }
            }

            const fieldName = action.dataset.field;
            if (fieldName) {
                state[fieldName] = '';
            }
        }

        // @todo: #4.5 — отфильтровать данные используя компаратор
        let filteredData = [...data];
        
        // Список правил для сравнения
        const rulesList = [
            rules.stringIncludes(),
            rules.exactEquality()
        ];
        
        Object.keys(state).forEach(key => {
            const value = state[key];
            
            if (value && elements[key]) {
                filteredData = filteredData.filter(item => {
                    if (item[key] !== undefined && item[key] !== null) {
                        const target = { [key]: value };
                        return compare(item, target, rulesList);
                    }
                    return true;
                });
            }
        });
        
        return filteredData;
    };
}