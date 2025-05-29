import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as BiIcons from 'react-icons/bi';
import { useBookmark } from '../context/BookmarkContext';
import './Bytes.css';

const BytesBrowser = () => {
  const navigate = useNavigate();
  const { addBookmark, removeBookmark, isBookmarked: checkBookmarkStatus } = useBookmark();
  const [bookmarkStates, setBookmarkStates] = useState({});
  const [allBytes, setAllBytes] = useState([]);
  const [filteredBytes, setFilteredBytes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categorySearch, setCategorySearch] = useState('');
  const [tagSearch, setTagSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 6
  });

  const categoryRef = useRef(null);
  const tagRef = useRef(null);

  // Filter suggestions with highlighting
  const filteredCategories = useMemo(() => {
    if (!categorySearch) return [];
    const searchTerm = categorySearch.toLowerCase();
    return categories
      .filter(cat => cat.toLowerCase().includes(searchTerm))
      .sort((a, b) => {
        // Sort exact matches first, then by starting with search term, then alphabetically
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        if (aLower === searchTerm && bLower !== searchTerm) return -1;
        if (bLower === searchTerm && aLower !== searchTerm) return 1;
        if (aLower.startsWith(searchTerm) && !bLower.startsWith(searchTerm)) return -1;
        if (bLower.startsWith(searchTerm) && !aLower.startsWith(searchTerm)) return 1;
        return a.localeCompare(b);
      });
  }, [categories, categorySearch]);

  const filteredTags = useMemo(() => {
    if (!tagSearch) return [];
    const searchTerm = tagSearch.toLowerCase();
    return tags
      .filter(tag => tag.toLowerCase().includes(searchTerm))
      .sort((a, b) => {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        if (aLower === searchTerm && bLower !== searchTerm) return -1;
        if (bLower === searchTerm && aLower !== searchTerm) return 1;
        if (aLower.startsWith(searchTerm) && !bLower.startsWith(searchTerm)) return -1;
        if (bLower.startsWith(searchTerm) && !aLower.startsWith(searchTerm)) return 1;
        return a.localeCompare(b);
      });
  }, [tags, tagSearch]);

  // Enhanced highlighting function
  const highlightMatch = (text, searchTerm) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="highlight">{part}</span>
      ) : (
        part
      )
    );
  };

  // Fetch bytes with filters
  const fetchBytes = useCallback((category = '', tag = '', page = 1) => {
    setLoading(true);
    let url = 'https://dailybytes-1.onrender.com/byte?';
    const params = new URLSearchParams();
    
    if (category) params.append('category', category);
    if (tag) params.append('tag', tag);
    params.append('chunkCount', page);
    url += params.toString();
    
    axios.get(url)
      .then(response => {
        const { data, pagination, metadata } = response.data;
        setAllBytes(data);
        setFilteredBytes(data);
        setPagination(pagination);
        
        if (metadata?.categories) setCategories(metadata.categories);
        if (metadata?.tags) setTags(metadata.tags);

        // Check bookmark status for all bytes
        checkBookmarkStatuses(data);
      })
      .catch(error => {
        console.error('Error fetching bytes:', error);
        setError('Failed to load bytes');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [checkBookmarkStatus]);

  // Check bookmark status for each byte
  const checkBookmarkStatuses = async (bytes) => {
    const states = {};
    for (const byte of bytes) {
      try {
        const isMarked = await checkBookmarkStatus(byte._id);
        states[byte._id] = isMarked;
      } catch (error) {
        console.error('Error checking bookmark status:', error);
        states[byte._id] = false;
      }
    }
    setBookmarkStates(states);
  };

  // Debounce function
  const debounce = (func, delay) => {
    let timeoutId;
    return function (...args) {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  };

  // Debounced fetch
  const debouncedFetch = useCallback(
    debounce((category, tag) => {
      fetchBytes(category, tag, 1);
    }, 300),
    []
  );

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCategorySearch(category);
    setShowCategorySuggestions(false);
    debouncedFetch(category, selectedTag);
  };

  // Handle tag selection
  const handleTagSelect = (tag) => {
    setSelectedTag(tag);
    setTagSearch(tag);
    setShowTagSuggestions(false);
    debouncedFetch(selectedCategory, tag);
  };

  // Handle byte card click
  const handleByteClick = (byteId) => {
    navigate(`/byte/${byteId}`);
  };

  const handleBookmarkClick = async (e, byteId) => {
    e.stopPropagation();
    try {
      if (bookmarkStates[byteId]) {
        await removeBookmark(byteId);
        setBookmarkStates(prev => ({ ...prev, [byteId]: false }));
      } else {
        await addBookmark(byteId);
        setBookmarkStates(prev => ({ ...prev, [byteId]: true }));
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchBytes();
  }, [fetchBytes]);

  // Reset filters
  const handleResetFilters = () => {
    setSelectedCategory('');
    setSelectedTag('');
    setCategorySearch('');
    setTagSearch('');
    fetchBytes('', '', 1);
  };

  // Handle clicks outside of suggestion lists
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setShowCategorySuggestions(false);
      }
      if (tagRef.current && !tagRef.current.contains(event.target)) {
        setShowTagSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle category input change with better debouncing
  const handleCategoryInputChange = (e) => {
    const value = e.target.value;
    setCategorySearch(value);
    setShowCategorySuggestions(true);
    
    if (value === '') {
      setSelectedCategory('');
      debouncedFetch('', selectedTag);
    } else {
      // If exact match exists, use it immediately
      const exactMatch = categories.find(cat => 
        cat.toLowerCase() === value.toLowerCase()
      );
      if (exactMatch) {
        setSelectedCategory(exactMatch);
        debouncedFetch(exactMatch, selectedTag);
      } else {
        // Otherwise search with partial match
        debouncedFetch(value, selectedTag);
      }
    }
  };

  // Handle tag input change with better debouncing
  const handleTagInputChange = (e) => {
    const value = e.target.value;
    setTagSearch(value);
    setShowTagSuggestions(true);
    
    if (value === '') {
      setSelectedTag('');
      debouncedFetch(selectedCategory, '');
    } else {
      // If exact match exists, use it immediately
      const exactMatch = tags.find(tag => 
        tag.toLowerCase() === value.toLowerCase()
      );
      if (exactMatch) {
        setSelectedTag(exactMatch);
        debouncedFetch(selectedCategory, exactMatch);
      } else {
        // Otherwise search with partial match
        debouncedFetch(selectedCategory, value);
      }
    }
  };

  // Enhanced keyboard navigation
  const handleCategoryKeyDown = (e) => {
    if (e.key === 'Enter' && filteredCategories.length > 0) {
      e.preventDefault();
      handleCategorySelect(filteredCategories[0]);
    } else if (e.key === 'Escape') {
      setShowCategorySuggestions(false);
      setCategorySearch(selectedCategory);
    } else if (e.key === 'ArrowDown' && filteredCategories.length > 0) {
      e.preventDefault();
      // Focus first suggestion (could be enhanced further)
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && filteredTags.length > 0) {
      e.preventDefault();
      handleTagSelect(filteredTags[0]);
    } else if (e.key === 'Escape') {
      setShowTagSuggestions(false);
      setTagSearch(selectedTag);
    } else if (e.key === 'ArrowDown' && filteredTags.length > 0) {
      e.preventDefault();
      // Focus first suggestion (could be enhanced further)
    }
  };

  return (
    <section className="bytes-browser">
      <h2>Browse Psychology Bytes</h2>
      
      <div className="filters">
        <div className="filter-group">
          <div className="filter-item">
            <label>Category:</label>
            <div className="search-container" ref={categoryRef}>
              <input
                type="text"
                placeholder="Search categories..."
                value={categorySearch}
                onChange={handleCategoryInputChange}
                onKeyDown={handleCategoryKeyDown}
                onFocus={() => setShowCategorySuggestions(true)}
              />
              {showCategorySuggestions && filteredCategories.length > 0 && (
                <div className="suggestions-list">
                  {filteredCategories.map((category, index) => (
                    <div
                      key={index}
                      className={`suggestion-item ${selectedCategory === category ? 'selected' : ''}`}
                      onClick={() => handleCategorySelect(category)}
                    >
                      {highlightMatch(category, categorySearch)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="filter-item">
            <label>Tag:</label>
            <div className="search-container" ref={tagRef}>
              <input
                type="text"
                placeholder="Search tags..."
                value={tagSearch}
                onChange={handleTagInputChange}
                onKeyDown={handleTagKeyDown}
                onFocus={() => setShowTagSuggestions(true)}
              />
              {showTagSuggestions && filteredTags.length > 0 && (
                <div className="suggestions-list">
                  {filteredTags.map((tag, index) => (
                    <div
                      key={index}
                      className={`suggestion-item ${selectedTag === tag ? 'selected' : ''}`}
                      onClick={() => handleTagSelect(tag)}
                    >
                      {highlightMatch(tag, tagSearch)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={handleResetFilters}
            className="reset-button"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="bytes-grid">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : filteredBytes.length === 0 ? (
          <div className="no-results">No bytes found matching the selected filters.</div>
        ) : (
          <>
            {filteredBytes.map((byte) => (
              <div 
                key={byte._id} 
                className="byte-card"
                onClick={() => navigate(`/byte/${byte._id}`)}
              >
                <div className="byte-header">
                  <h3>{byte.title}</h3>
                  <div className="byte-actions">
                    <span className="byte-tag">{byte.category}</span>
                    <button 
                      className={`bookmark-btn ${bookmarkStates[byte._id] ? 'bookmarked' : ''}`}
                      onClick={(e) => handleBookmarkClick(e, byte._id)}
                    >
                      {bookmarkStates[byte._id] ? <BiIcons.BiBookmarkAlt /> : <BiIcons.BiBookmark />}
                    </button>
                  </div>
                </div>
                <p className="byte-summary">{byte.summary}</p>
                {byte.tags && byte.tags.length > 0 && (
                  <div className="byte-tags">
                    {byte.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {!loading && !error && pagination.currentPage < pagination.totalPages && (
        <button 
          onClick={() => fetchBytes(selectedCategory, selectedTag, pagination.currentPage + 1)}
          className="load-more-button"
        >
          Load More
        </button>
      )}
    </section>
  );
};

export default BytesBrowser;
