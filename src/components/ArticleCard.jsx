import React, { useState } from 'react';
import { Search, Bookmark, ChevronRight } from 'lucide-react';

const ArticleCard = ({ article }) => {
    return (
      <div className="bg-white rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer group">
        <div className="flex items-center space-x-4">
          {/* Article Icon */}
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
            {article.icon}
          </div>
          
          {/* Article Info */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 group-hover:text-gray-700">
              {article.title}
            </h3>
            <p className="text-sm text-gray-500">{article.date}</p>
          </div>
        </div>
        
        {/* Arrow Icon */}
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
      </div>
    );
  };

export default ArticleCard;
