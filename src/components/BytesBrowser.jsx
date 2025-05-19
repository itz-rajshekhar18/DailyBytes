import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BytesBrowser = () => {
  const [allBytes, setAllBytes] = useState([]);
  const [filteredBytes, setFilteredBytes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('');
  const [tag, setTag] = useState('');
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 6
  });

  // Fetch bytes with filters
  const fetchBytes = (selectedCategory = '', selectedTag = '', page = 1) => {
    setLoading(true);
    
    // Build query parameters
    let url = 'http://localhost:5001/api/byte?';
    const params = new URLSearchParams();
    
    if (selectedCategory) {
      params.append('category', selectedCategory);
    }
    
    if (selectedTag) {
      params.append('tag', selectedTag);
    }
    
    params.append('chunkCount', page);
    url += params.toString();
    
    axios.get(url)
      .then(response => {
        const { data, pagination, metadata } = response.data;
        
        // Set bytes data
        setAllBytes(data);
        setFilteredBytes(data);
        
        // Set pagination information
        setPagination(pagination);
        
        // Set categories and tags from metadata
        if (metadata?.categories) {
          setCategories(metadata.categories);
        }
        
        if (metadata?.tags) {
          setTags(metadata.tags);
        }
      })
      .catch(error => {
        console.error('Error fetching bytes:', error);
        setError('Failed to load bytes');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Initial data fetch
  useEffect(() => {
    fetchBytes();
  }, []);

  // Apply filters
  const handleApplyFilters = () => {
    fetchBytes(category, tag, 1);
  };

  // Load more bytes
  const handleLoadMore = () => {
    if (pagination.currentPage < pagination.totalPages) {
      fetchBytes(category, tag, pagination.currentPage + 1);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setCategory('');
    setTag('');
    fetchBytes('', '', 1);
  };

  return (
    <section className="bytes-browser">
      <h2>Browse Psychology Bytes</h2>
      
      <div className="filters">
        <div className="filter-group">
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
            <select
              id="tag"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            >
              <option value="">All Tags</option>
              {tags.map((tagItem, index) => (
                <option key={index} value={tagItem}>{tagItem}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="filter-actions">
          <button onClick={handleApplyFilters} className="apply-btn">Apply Filters</button>
          <button onClick={handleResetFilters} className="reset-btn">Reset</button>
        </div>
      </div>
      
      {error && <p className="error">{error}</p>}
      
      <div className="bytes-list">
        {filteredBytes.length > 0 ? (
          filteredBytes.map((byte, index) => (
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
      
      {pagination.currentPage < pagination.totalPages && !loading && (
        <button 
          className="load-more" 
          onClick={handleLoadMore}
        >
          Load More ({pagination.currentPage} of {pagination.totalPages})
        </button>
      )}
    </section>
  );
};

export default BytesBrowser; 