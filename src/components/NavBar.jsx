import React, { useState } from 'react';
import { Search, Bookmark, ChevronRight } from 'lucide-react';

const Navbar = () => {
    return (
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center">
                <span className="text-white text-sm font-bold">M</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">Mindful Byte</span>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-900 hover:text-gray-600 px-3 py-2 text-sm font-medium">
                Home
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-600 px-3 py-2 text-sm font-medium">
                Browse
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-600 px-3 py-2 text-sm font-medium">
                Community
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-600 px-3 py-2 text-sm font-medium">
                Profile
              </a>
            </nav>
            
            {/* Right side icons */}
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-600">
                <Search className="w-5 h-5" />
              </button>
              <button className="text-gray-500 hover:text-gray-600">
                <Bookmark className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  };

export default Navbar;