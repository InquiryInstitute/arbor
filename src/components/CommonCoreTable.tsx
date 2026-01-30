import React, { useState, useMemo } from 'react';
import type { CommonCoreNode } from '../data/commoncore';
import { allCommonCoreNodes } from '../data/commoncore';

type SortField = 'grade' | 'subject' | 'domain' | 'name' | 'type';
type SortDirection = 'asc' | 'desc';

interface CommonCoreTableProps {
  nodes?: CommonCoreNode[];
}

export default function CommonCoreTable({ nodes = allCommonCoreNodes }: CommonCoreTableProps) {
  const [sortField, setSortField] = useState<SortField>('grade');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');

  // Filter nodes
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      if (filterType !== 'all' && node.type !== filterType) return false;
      if (filterSubject !== 'all' && node.subject !== filterSubject) return false;
      return true;
    });
  }, [nodes, filterType, filterSubject]);

  // Sort nodes
  const sortedNodes = useMemo(() => {
    return [...filteredNodes].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'grade':
          aValue = a.grade ?? -1;
          bValue = b.grade ?? -1;
          break;
        case 'subject':
          aValue = a.subject || '';
          bValue = b.subject || '';
          break;
        case 'domain':
          aValue = a.domain || '';
          bValue = b.domain || '';
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredNodes, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const getGradeLabel = (grade: number | undefined) => {
    if (grade === undefined) return '-';
    return grade === 0 ? 'K' : `G${grade}`;
  };

  const getSubjectLabel = (subject: string | undefined) => {
    if (!subject) return '-';
    return subject === 'math' ? 'Math' : 'ELA';
  };

  return (
    <div style={{ 
      width: '100%', 
      marginTop: '2rem',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      overflow: 'hidden',
    }}>
      {/* Filters */}
      <div style={{ 
        padding: '1rem', 
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <strong>Type:</strong>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="all">All</option>
            <option value="grade">Grade</option>
            <option value="subject">Subject</option>
            <option value="domain">Domain</option>
            <option value="cluster">Cluster</option>
          </select>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <strong>Subject:</strong>
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="all">All</option>
            <option value="math">Math</option>
            <option value="ela">ELA</option>
          </select>
        </label>
        <div style={{ marginLeft: 'auto', color: '#666', fontSize: '0.9rem' }}>
          Showing {sortedNodes.length} of {nodes.length} topics
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          fontSize: '0.9rem',
        }}>
          <thead>
            <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
              <th
                style={{ 
                  padding: '0.75rem', 
                  textAlign: 'left', 
                  cursor: 'pointer',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                }}
                onClick={() => handleSort('type')}
              >
                Type {getSortIcon('type')}
              </th>
              <th
                style={{ 
                  padding: '0.75rem', 
                  textAlign: 'left', 
                  cursor: 'pointer',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                }}
                onClick={() => handleSort('grade')}
              >
                Grade {getSortIcon('grade')}
              </th>
              <th
                style={{ 
                  padding: '0.75rem', 
                  textAlign: 'left', 
                  cursor: 'pointer',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                }}
                onClick={() => handleSort('subject')}
              >
                Subject {getSortIcon('subject')}
              </th>
              <th
                style={{ 
                  padding: '0.75rem', 
                  textAlign: 'left', 
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
                onClick={() => handleSort('name')}
              >
                Name {getSortIcon('name')}
              </th>
              <th
                style={{ 
                  padding: '0.75rem', 
                  textAlign: 'left', 
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
                onClick={() => handleSort('domain')}
              >
                Domain {getSortIcon('domain')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedNodes.map((node, index) => (
              <tr
                key={node.id}
                style={{
                  borderBottom: '1px solid #e0e0e0',
                  background: index % 2 === 0 ? '#fff' : '#fafafa',
                }}
              >
                <td style={{ padding: '0.75rem' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    background: node.type === 'grade' ? '#e3f2fd' :
                               node.type === 'subject' ? '#e8f5e9' :
                               node.type === 'domain' ? '#f1f8e9' :
                               node.type === 'cluster' ? '#fff3e0' : '#f5f5f5',
                    color: node.type === 'grade' ? '#1976d2' :
                          node.type === 'subject' ? '#388e3c' :
                          node.type === 'domain' ? '#689f38' :
                          node.type === 'cluster' ? '#f57c00' : '#666',
                  }}>
                    {node.type}
                  </span>
                </td>
                <td style={{ padding: '0.75rem' }}>
                  {getGradeLabel(node.grade)}
                </td>
                <td style={{ padding: '0.75rem' }}>
                  {getSubjectLabel(node.subject)}
                </td>
                <td style={{ padding: '0.75rem', fontWeight: node.type === 'grade' ? '600' : 'normal' }}>
                  {node.name}
                </td>
                <td style={{ padding: '0.75rem', color: '#666' }}>
                  {node.domain || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
