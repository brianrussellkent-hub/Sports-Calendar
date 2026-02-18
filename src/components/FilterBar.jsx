import React from 'react';
export default function FilterBar({ categories, selected, onToggle }) {
  return (
    <div className="filter-bar">
      {categories.map((category) => {
        const active = selected.includes(category.id);
        return (
          <button
            key={category.id}
            type="button"
            className={`chip ${active ? 'active' : ''}`}
            onClick={() => onToggle(category.id)}
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );
}
