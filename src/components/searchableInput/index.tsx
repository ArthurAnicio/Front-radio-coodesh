import styles from './SearchableInput.module.css'
import React, { useState, useEffect, useRef } from 'react';

interface SearchableInputProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

const SearchableInput: React.FC<SearchableInputProps> = ({ label, options, value, onChange }) => {
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value === '') {
      setFilteredOptions([]);
    } else {
      const filtered = options.filter(option =>
        option.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredOptions(filtered.slice(0, 10));
    }
  }, [value, options]);

  const handleSelect = (selected: string) => {
    onChange(selected);
    setShowSuggestions(false);
  };

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
        placeholder={label}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
      />
      {showSuggestions && filteredOptions.length > 0 && (
        <div className={styles.suggestions}>
          {filteredOptions.map(option => (
            <div
              key={option}
              onClick={() => handleSelect(option)}
              onMouseDown={e => e.preventDefault()} 
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