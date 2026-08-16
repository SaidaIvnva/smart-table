import { compare, rules } from "../lib/compare.js";

export function initFiltering(elements, indexes) {
    // @todo: #4.1 — заполнить выпадающие списки опциями
    const fieldMapping = {
        sellers: 'searchBySeller',
        customers: 'searchByCustomer'
    };
    
    Object.keys(indexes).forEach((key) => {
        const elementKey = fieldMapping[key] || key;
        
        if (elements[elementKey] && indexes[key]) {
            // Очищаем select перед добавлением опций
            elements[elementKey].innerHTML = '<option value="" selected>—</option>';
            Object.values(indexes[key]).forEach(name => {
                elements[elementKey].append(new Option(name, name));
            });
        }
    });

    return (data, state, action) => {
        // @todo: #4.2 — обработать очистку поля
        if (action && action.name === 'clear') {
            const parent = action.closest('.filter-wrapper, .dropdown-select, .range-inputs');
            
            if (parent) {
                const inputs = parent.querySelectorAll('input, select');
                inputs.forEach(input => {
                    if (input.tagName === 'SELECT') {
                        input.selectedIndex = 0;
                    } else {
                        input.value = '';
                    }
                });
            }

            const fieldName = action.dataset.field;
            if (fieldName) {
                // Если очищаем total, нужно очистить оба поля totalFrom и totalTo
                if (fieldName === 'total') {
                    state.totalFrom = '';
                    state.totalTo = '';
                    // Очищаем соответствующие поля ввода
                    if (elements.totalFrom) elements.totalFrom.value = '';
                    if (elements.totalTo) elements.totalTo.value = '';
                } else {
                    state[fieldName] = '';
                }
            }
            
            // Возвращаем исходные данные после очистки
            return [...data];
        }

        // @todo: #4.5 — отфильтровать данные используя компаратор
        let filteredData = [...data];
        
        // Сначала применяем фильтрацию по текстовым полям (date, customer, seller)
        const textFields = ['date', 'customer', 'seller'];
        
        textFields.forEach(key => {
            const value = state[key];
            const elementKey = `searchBy${key.charAt(0).toUpperCase() + key.slice(1)}`;
            
            if (value && value !== '' && elements[elementKey]) {
                let rulesList;
                
                if (key === 'date' || key === 'customer') {
                    // Для даты и покупателя используем поиск по подстроке без учета регистра
                    rulesList = [
                        rules.caseInsensitiveStringIncludes()
                    ];
                } else if (key === 'seller') {
                    // Для продавца используем точное совпадение
                    rulesList = [
                        rules.exactEquality()
                    ];
                }
                
                if (rulesList) {
                    filteredData = filteredData.filter(item => {
                        if (item[key] !== undefined && item[key] !== null) {
                            const target = { [key]: value };
                            return compare(item, target, rulesList);
                        }
                        return true;
                    });
                }
            }
        });
        
        // Применяем фильтрацию по диапазону сумм (totalFrom и totalTo)
        const totalFrom = state.totalFrom;
        const totalTo = state.totalTo;
        
        // Проверяем, есть ли значения в полях totalFrom и totalTo
        const hasTotalFrom = totalFrom && totalFrom !== '' && !isNaN(parseFloat(totalFrom));
        const hasTotalTo = totalTo && totalTo !== '' && !isNaN(parseFloat(totalTo));
        
        if (hasTotalFrom || hasTotalTo) {
            const fromNum = hasTotalFrom ? parseFloat(totalFrom) : -Infinity;
            const toNum = hasTotalTo ? parseFloat(totalTo) : Infinity;
            
            filteredData = filteredData.filter(item => {
                const total = parseFloat(item.total);
                if (isNaN(total)) return false;
                return total >= fromNum && total <= toNum;
            });
        }
        
        return filteredData;
    };
}