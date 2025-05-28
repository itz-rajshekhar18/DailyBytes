import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as BiIcons from 'react-icons/bi';
import { useBookmark } from '../context/BookmarkContext';
import './Bytes.css';

const BookmarkedBytes = () => {
  const navigate = useNavigate();
  const { bookmarks, loading, error, fetchBookmarks, removeBookmark } = useBookmark();

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const handleByteClick = (byteId) => {
    navigate(`/byte/${byteId}`);
  };

  const handleRemoveBookmark = async (e, byteId) => {
    e.stopPropagation();
    try {
      await removeBookmark(byteId);
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  if (loading) return <div className="bytes-loading">Loading bookmarks...</div>;
  if (error) return <div className="bytes-error">{error}</div>;

  return (
    <section className="bytes-section">
      <h2 className="bytes-title">Bookmarked Bytes</h2>
      
      {bookmarks.length === 0 ? (
        <div className="no-bookmarks">
          <BiIcons.BiBookmarkAlt className="no-bookmarks-icon" />
          <p>No bookmarked bytes yet</p>
          <button onClick={() => navigate('/all-bytes')} className="browse-bytes-btn">
            Browse Bytes
          </button>
        </div>
      ) : (
        <div className="bytes-grid">
          {bookmarks.map(({ byte }) => (
            <div 
              key={byte._id} 
              className="byte-card"
              onClick={() => handleByteClick(byte._id)}
            >
              <div className="byte-header">
                <h3>{byte.title}</h3>
                <div className="byte-actions">
                  <span className="byte-tag">{byte.category}</span>
                  <button 
                    className="bookmark-btn bookmarked"
                    onClick={(e) => handleRemoveBookmark(e, byte._id)}
                  >
                    <BiIcons.BiBookmarkAlt />
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
        </div>
      )}
    </section>
  );
};

export default BookmarkedBytes;