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
            const parent = action.closest('.filter-wrapper, .dropdown-select');
            
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
                // Принудительно обновляем state для поля
                if (fieldName === 'date' || fieldName === 'customer' || fieldName === 'total') {
                    state[fieldName] = '';
                }
            }
        }

        // @todo: #4.5 — отфильтровать данные используя компаратор
        let filteredData = [...data];
        
        // Проверяем каждое поле фильтрации
        const filterKeys = ['date', 'customer', 'seller', 'totalFrom', 'totalTo'];
        
        filterKeys.forEach(key => {
            const value = state[key];
            
            // Проверяем наличие значения и соответствующий элемент
            if (value && value !== '' && elements[`searchBy${key.charAt(0).toUpperCase() + key.slice(1)}`]) {
                // Для каждого поля применяем свои правила
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
                } else if (key === 'totalFrom' || key === 'totalTo') {
                    // Для диапазона сумм используем числовое сравнение
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue)) {
                        if (key === 'totalFrom') {
                            filteredData = filteredData.filter(item => {
                                const total = parseFloat(item.total);
                                return !isNaN(total) && total >= numValue;
                            });
                        } else {
                            filteredData = filteredData.filter(item => {
                                const total = parseFloat(item.total);
                                return !isNaN(total) && total <= numValue;
                            });
                        }
                    }
                    return; // Пропускаем остальную логику для диапазона
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
        
        return filteredData;
    };
}