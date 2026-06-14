import { useState } from 'react';

export default function DataTable({ columns, data, loading, pagination, onPageChange, onSearch, searchPlaceholder = 'Search...' }) {
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    setSearch(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <div className="card p-0 overflow-hidden">
      {onSearch && (
        <div className="p-4 border-b" style={{ borderColor: 'rgba(226,232,240,0.6)' }}>
          <input className="input-field max-w-sm" placeholder={searchPlaceholder} value={search} onChange={handleSearch} />
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ background: 'rgba(248,250,252,0.8)' }} className="dark:bg-slate-800/50">
              {columns.map(col => (
                <th key={col.key} className={`px-4 py-3 text-left table-header ${col.className || ''}`}>{col.title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="table-row">
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td>
                  ))}
                </tr>
              ))
            ) : data?.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-4 py-12 text-center" style={{ color: 'var(--color-text-secondary)' }}>No data found</td></tr>
            ) : (
              data?.map((row, i) => (
                <tr key={row._id || i} className="table-row">
                  {columns.map(col => (
                    <td key={col.key} className={`px-4 py-3 text-sm ${col.cellClassName || ''}`} style={{ color: 'var(--color-text-primary)' }}>
                      {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination && (
        <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'rgba(226,232,240,0.6)' }}>
          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Page {pagination.page} of {pagination.pages} ({pagination.total} total)
          </span>
          <div className="flex gap-2">
            <button className="btn-secondary py-1.5 px-3 text-xs" disabled={pagination.page <= 1} onClick={() => onPageChange(pagination.page - 1)}>Previous</button>
            <button className="btn-secondary py-1.5 px-3 text-xs" disabled={pagination.page >= pagination.pages} onClick={() => onPageChange(pagination.page + 1)}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
