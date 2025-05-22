import React, { useState } from 'react';
import { Search, Bookmark, ChevronRight } from 'lucide-react';

const ArticleList = ({ articles }) => {
    if (articles.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">No articles found in this category.</p>
        </div>
      );
    }
  
    return (
      <div className="space-y-4">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    );
  };

export default ArticleList;