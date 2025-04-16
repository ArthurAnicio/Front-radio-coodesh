import styles from './SearchableInput.module.css';
import React, { useState, useEffect, useRef } from 'react';

interface SearchableInputProps {
  label: string; // Texto exibido como placeholder do input
  options: string[]; // Lista de opções para sugerir ao digitar
  value: string; // Valor atual do input
  onChange: (value: string) => void; // Função chamada sempre que o valor muda
}

const SearchableInput: React.FC<SearchableInputProps> = ({ label, options, value, onChange }) => {
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]); // Armazena as sugestões filtradas
  const [showSuggestions, setShowSuggestions] = useState(false); // Define se as sugestões estão visíveis
  const inputRef = useRef<HTMLInputElement>(null); // Referência pro container do input

  // Filtra as opções sempre que o valor ou a lista mudar
  useEffect(() => {
    if (value === '') {
      setFilteredOptions([]); // Se o campo estiver vazio, não mostra sugestões
    } else {
      const filtered = options.filter(option =>
        option.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredOptions(filtered.slice(0, 10)); // Mostra no máximo 10 sugestões
    }
  }, [value, options]);

  // Ao clicar em uma sugestão, define o valor e fecha as sugestões
  const handleSelect = (selected: string) => {
    onChange(selected);
    setShowSuggestions(false);
  };

  // Fecha o menu de sugestões ao clicar fora do input
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.filter} ref={inputRef}>
      <input
        type="text"
        className={styles.searchBar}
        placeholder={label} // Placeholder que vem da prop `label`
        value={value} // Valor atual do input
        onChange={e => onChange(e.target.value)} // Atualiza conforme o usuário digita
        onFocus={() => setShowSuggestions(true)} // Exibe sugestões ao focar
      />
      {showSuggestions && filteredOptions.length > 0 && (
        <div className={styles.suggestions}>
          {filteredOptions.map(option => (
            <div
              key={option}
              onClick={() => handleSelect(option)} // Define a opção clicada
              onMouseDown={e => e.preventDefault()} // Impede que o input perca foco antes de selecionar
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchableInput;