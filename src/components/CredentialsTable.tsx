import { useState, useMemo } from 'react';
import type { Credential, College, LevelBand, Cadence } from '../types/credential';

interface CredentialsTableProps {
  credentials: Credential[];
}

type SortField = 'title' | 'college' | 'level' | 'cadence' | 'duration';
type SortDirection = 'asc' | 'desc';

export default function CredentialsTable({ credentials }: CredentialsTableProps) {
  const [sortField, setSortField] = useState<SortField>('level');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filterCollege, setFilterCollege] = useState<College | 'all'>('all');
  const [filterLevel, setFilterLevel] = useState<LevelBand | 'all'>('all');

  // Level band order for sorting
  const levelOrder: LevelBand[] = ['K-1', 'G2-3', 'G4-6', 'G7-8', 'G9-10', 'G11-12', 'UG', 'MS', 'PhD', 'Faculty'];
  const collegeOrder: College[] = ['HUM', 'MATH', 'NAT', 'AINS', 'SOC', 'ELA', 'ARTS', 'HEAL', 'CEF', 'META'];

  const sortedCredentials = useMemo(() => {
    let filtered = [...credentials];

    // Apply filters
    if (filterCollege !== 'all') {
      filtered = filtered.filter(c => c.college_primary === filterCollege);
    }
    if (filterLevel !== 'all') {
      filtered = filtered.filter(c => c.level_band === filterLevel);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortField) {
        case 'title':
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case 'college':
          aVal = collegeOrder.indexOf(a.college_primary);
          bVal = collegeOrder.indexOf(b.college_primary);
          break;
        case 'level':
          aVal = levelOrder.indexOf(a.level_band);
          bVal = levelOrder.indexOf(b.level_band);
          break;
        case 'cadence':
          aVal = a.cadence;
          bVal = b.cadence;
          break;
        case 'duration':
          aVal = a.duration_weeks;
          bVal = b.duration_weeks;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [credentials, sortField, sortDirection, filterCollege, filterLevel]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span style={{ opacity: 0.3 }}>↕</span>;
    return sortDirection === 'asc' ? <span>↑</span> : <span>↓</span>;
  };

  return (
    <div style={{ marginTop: '2rem', padding: '1rem', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2 style={{ marginTop: 0, color: '#2d5a27' }}>All Credentials</h2>
      
      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div>
          <label style={{ marginRight: '0.5rem', fontSize: '0.9rem' }}>College:</label>
          <select
            value={filterCollege}
            onChange={(e) => setFilterCollege(e.target.value as College | 'all')}
            style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="all">All</option>
            {collegeOrder.map(college => (
              <option key={college} value={college}>{college}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ marginRight: '0.5rem', fontSize: '0.9rem' }}>Level:</label>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value as LevelBand | 'all')}
            style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="all">All</option>
            {levelOrder.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '0.9rem', color: '#666' }}>
          Showing {sortedCredentials.length} of {credentials.length} credentials
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #2d5a27' }}>
              <th
                style={{ padding: '0.75rem', textAlign: 'left', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('title')}
              >
                Title <SortIcon field="title" />
              </th>
              <th
                style={{ padding: '0.75rem', textAlign: 'left', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('college')}
              >
                College <SortIcon field="college" />
              </th>
              <th
                style={{ padding: '0.75rem', textAlign: 'left', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('level')}
              >
                Level <SortIcon field="level" />
              </th>
              <th
                style={{ padding: '0.75rem', textAlign: 'left', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('cadence')}
              >
                Cadence <SortIcon field="cadence" />
              </th>
              <th
                style={{ padding: '0.75rem', textAlign: 'left', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('duration')}
              >
                Duration <SortIcon field="duration" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedCredentials.map((cred, idx) => (
              <tr
                key={cred.id}
                style={{
                  borderBottom: '1px solid #e0e0e0',
                  background: idx % 2 === 0 ? 'white' : '#fafafa',
                }}
              >
                <td style={{ padding: '0.75rem' }}>
                  {cred.cadence === 'seasonal' ? '🌱' : '🌙'} {cred.title}
                </td>
                <td style={{ padding: '0.75rem', fontWeight: '500' }}>{cred.college_primary}</td>
                <td style={{ padding: '0.75rem' }}>{cred.level_band}</td>
                <td style={{ padding: '0.75rem' }}>
                  {cred.cadence === 'seasonal' ? '🌱 Seasonal' : '🌙 Monthly'}
                </td>
                <td style={{ padding: '0.75rem' }}>{cred.duration_weeks} weeks</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
