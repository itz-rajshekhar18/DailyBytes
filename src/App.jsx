import React, { useState } from 'react'
import Navbar from './components/NavBar'
import LibraryHeader from './components/LibraryHeader'
import CategoryFilter from './components/CateforyFilter'
import ArticleList from './components/ArticleList'

const App = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Deep dive', 'Relationships', 'Mindfulness', 'Habits'];
  
  const articles = [
    {
      id: 1,
      title: 'The paradox of choice',
      date: 'Jul 14',
      icon: '📚',
      category: 'Deep dive'
    },
    {
      id: 2,
      title: 'The power of the present moment',
      date: 'Jul 13',
      icon: '✨',
      category: 'Mindfulness'
    },
    {
      id: 3,
      title: 'The science of gratitude',
      date: 'Jul 12',
      icon: '🌿',
      category: 'Mindfulness'
    },
    {
      id: 4,
      title: 'Why we procrastinate',
      date: 'Jul 11',
      icon: '🌳',
      category: 'Habits'
    },
    {
      id: 5,
      title: 'The meaning of life',
      date: 'Jul 10',
      icon: '📖',
      category: 'Deep dive'
    }
  ];

  const filteredArticles = activeCategory === 'All' 
    ? articles 
    : articles.filter(article => article.category === activeCategory);

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LibraryHeader />
        
        <CategoryFilter 
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
        
        <ArticleList articles={filteredArticles} />
      </main>
    </div>
  );
};

export default App