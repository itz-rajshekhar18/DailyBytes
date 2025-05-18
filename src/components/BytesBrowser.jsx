import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BytesBrowser = () => {
  const [allBytes, setAllBytes] = useState([]);
  const [filteredBytes, setFilteredBytes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('');
  const [tag, setTag] = useState('');
  const [visibleCount, setVisibleCount] = useState(5);
  const [categories, setCategories] = useState([]);

  // Fetch all bytes
  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:5001/api/byte')
      .then(response => {
        const bytes = response.data.data;
        setAllBytes(bytes);
        setFilteredBytes(bytes);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(bytes.map(byte => byte.category))];
        setCategories(uniqueCategories);
      })
      .catch(error => {
        console.error('Error fetching bytes:', error);
        setError('Failed to load bytes');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Apply filters
  useEffect(() => {
    // Filter bytes based on selected category and tag
    let filtered = [...allBytes];
    
    if (category) {
      filtered = filtered.filter(byte => byte.category === category);
    }
    
    if (tag) {
      filtered = filtered.filter(byte => byte.tags && byte.tags.includes(tag));
    }
    
    setFilteredBytes(filtered);
    setVisibleCount(5); // Reset visible count when filter changes
  }, [category, tag, allBytes]);

  // Apply filters
  const handleApplyFilters = () => {
    // No need to call API - filters are applied in the useEffect
  };

  // Load more bytes
  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 5);
  };

  // Reset filters
  const handleResetFilters = () => {
    setCategory('');
    setTag('');
    // Filters will be cleared by the useEffect
  };

  // Check if more bytes are available
  const hasMore = filteredBytes.length > visibleCount;

  // Display only the visible number of bytes
  const visibleBytes = filteredBytes.slice(0, visibleCount);

  return (
    <section className="bytes-browser">
      <h2>Browse Psychology Bytes</h2>
      
      <div className="filters">
        <div className="filter-item">
          <label htmlFor="category">Category:</label>
          <select 
            id="category" 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-item">
          <label htmlFor="tag">Tag:</label>
          <input 
            type="text" 
            id="tag" 
            value={tag} 
            onChange={(e) => setTag(e.target.value)} 
            placeholder="Enter a tag"
          />
        </div>
        
        <div className="filter-actions">
          <button onClick={handleApplyFilters}>Apply Filters</button>
          <button onClick={handleResetFilters}>Reset</button>
        </div>
      </div>
      
      {error && <p className="error">{error}</p>}
      
      <div className="bytes-list">
        {visibleBytes.length > 0 ? (
          visibleBytes.map((byte, index) => (
            <div key={byte._id} className="byte-card">
              <h3>{byte.title}</h3>
              <p>{byte.summary}</p>
              <div className="byte-meta">
                <span className="category">{byte.category}</span>
                <span className="date">
                  {new Date(byte.datePublished).toLocaleDateString()}
                </span>
              </div>
              <div className="tags">
                {byte.tags && byte.tags.map((tag, idx) => (
                  <span key={idx} className="tag">{tag}</span>
                ))}
              </div>
              <a href={`/byte/${byte._id}`} className="view-details">
                View Details
              </a>
            </div>
          ))
        ) : (
          <p>No bytes found matching your criteria.</p>
        )}
      </div>
      
      {loading && <p>Loading...</p>}
      
      {hasMore && !loading && (
        <button 
          className="load-more" 
          onClick={handleLoadMore}
        >
          Load More
        </button>
      )}
    </section>
  );
};

export default BytesBrowser; 