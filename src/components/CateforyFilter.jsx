import React, { useState } from 'react';
import { Search, Bookmark, ChevronRight } from 'lucide-react';

const CategoryFilter = ({ categories, activeCategory, onCategoryChange }) => {
    return (
      <div className="flex space-x-6 mb-8 border-b border-gray-200">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeCategory === category
                ? 'text-gray-900 border-gray-900'
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    );
  };

export default CategoryFilter;