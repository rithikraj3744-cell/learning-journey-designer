// Example React Component - Using Competency Data
// Copy this code into any of your components to use the data

import React, { useState, useEffect } from 'react';
import {
  competencyList,
  categories,
  getCompetenciesByCategory,
  getResourcesForCompetency,
  searchCompetencies
} from '../data';

function CompetencyExample() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredCompetencies, setFilteredCompetencies] = useState(competencyList);
  const [searchQuery, setSearchQuery] = useState('');

  // Example 1: Display all categories
  console.log('Total Categories:', categories.length);
  console.log('Total Competencies:', competencyList.length);

  // Example 2: Filter by category
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId === '') {
      setFilteredCompetencies(competencyList);
    } else {
      const filtered = getCompetenciesByCategory(categoryId);
      setFilteredCompetencies(filtered);
    }
  };

  // Example 3: Search competencies
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query === '') {
      setFilteredCompetencies(competencyList);
    } else {
      const results = searchCompetencies(query);
      setFilteredCompetencies(results);
    }
  };

  // Example 4: Get resources for a competency
  const showResources = (competencyId) => {
    const resources = getResourcesForCompetency(competencyId);
    console.log(`Resources for ${competencyId}:`, resources);
  };

  return (
    <div className="competency-container">
      <h1>Competencies ({filteredCompetencies.length})</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search competencies..."
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        style={{ padding: '10px', width: '300px', marginBottom: '20px' }}
      />

      {/* Category Filter */}
      <select
        value={selectedCategory}
        onChange={(e) => handleCategoryChange(e.target.value)}
        style={{ padding: '10px', marginBottom: '20px', marginLeft: '10px' }}
      >
        <option value="">All Categories</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      {/* Competency List */}
      <div className="competency-grid">
        {filteredCompetencies.map(comp => (
          <div
            key={comp.id}
            className="competency-card"
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '15px'
            }}
          >
            <h3>{comp.name}</h3>
            <p style={{ color: '#666' }}>{comp.description}</p>

            <div style={{ marginTop: '10px' }}>
              <span style={{
                background: '#e3f2fd',
                padding: '5px 10px',
                borderRadius: '5px',
                marginRight: '10px'
              }}>
                Level {comp.difficulty}
              </span>
              <span style={{
                background: '#f3e5f5',
                padding: '5px 10px',
                borderRadius: '5px'
              }}>
                {comp.estimatedHours} hours
              </span>
            </div>

            {comp.prerequisites.length > 0 && (
              <p style={{ marginTop: '10px', fontSize: '14px' }}>
                <strong>Prerequisites:</strong> {comp.prerequisites.length}
              </p>
            )}

            <div style={{ marginTop: '10px' }}>
              <button
                onClick={() => showResources(comp.id)}
                style={{
                  padding: '8px 15px',
                  background: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                View Resources
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CompetencyExample;
