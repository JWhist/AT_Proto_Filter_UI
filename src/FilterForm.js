import React, { useState, useEffect } from 'react';

const FilterForm = ({ onApplyFilter, onClearFilter, initialValues }) => {
  const [repository, setRepository] = useState(initialValues.repository || '');
  const [pathPrefix, setPathPrefix] = useState(initialValues.pathPrefix || 'app.bsky.feed.post');
  const [keyword, setKeyword] = useState(initialValues.keyword || '');

  useEffect(() => {
    setRepository(initialValues.repository || '');
    setPathPrefix(initialValues.pathPrefix || 'app.bsky.feed.post');
    setKeyword(initialValues.keyword || '');
  }, [initialValues]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onApplyFilter({
      repository: repository.trim(),
      pathPrefix: pathPrefix.trim(),
      keyword: keyword.trim()
    });
  };

  const handleClear = () => {
    setRepository('');
    setPathPrefix('app.bsky.feed.post'); // Reset to default value
    setKeyword('');
    onClearFilter();
  };

  return (
    <div className="filter-form">
      <h2>Filter Configuration</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="repository">Repository DID</label>
          <input
            type="text"
            id="repository"
            value={repository}
            onChange={(e) => setRepository(e.target.value)}
            placeholder="did:plc:abc123xyz (optional)"
          />
          <small>Filter by specific user/account</small>
        </div>

        <div className="input-group">
          <label htmlFor="pathPrefix">Path Prefix</label>
          <input
            type="text"
            id="pathPrefix"
            value={pathPrefix}
            onChange={(e) => setPathPrefix(e.target.value)}
            placeholder="app.bsky.feed.post"
          />
          <small>Filter by operation type (e.g., posts, follows, likes)</small>
        </div>

        <div className="input-group">
          <label htmlFor="keyword">Keyword</label>
          <input
            type="text"
            id="keyword"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Enter keywords to filter content"
          />
          <small>⚠️ Note: Keyword filtering may not work as expected since firehose events contain only metadata, not full content</small>
        </div>

        <div className="button-group">
          <button type="submit" className="btn btn-primary">
            Apply Filter
          </button>
          <button type="button" onClick={handleClear} className="btn btn-secondary">
            Clear
          </button>
        </div>
      </form>
    </div>
  );
};

export default FilterForm;