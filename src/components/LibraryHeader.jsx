import React, { useState } from 'react';
import { Search, Bookmark, ChevronRight } from 'lucide-react';

const LibraryHeader = () => {
    return (
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your library</h1>
        <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          New byte
        </button>
      </div>
    );
  };

export default LibraryHeader;