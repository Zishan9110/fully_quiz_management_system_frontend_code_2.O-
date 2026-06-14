import { useState, useRef, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminApi as api } from '@/services/api';
import Modal from '@/components/common/Modal';
import DataTable from '@/components/common/DataTable';

// 🔥 UPDATED - Add payment fields
const defaultForm = { 
  name: '', 
  description: '', 
  category: '', 
  instructor: '', 
  level: 'beginner', 
  thumbnail: '',
  isPaid: false,
  price: 0,
  currency: 'INR',
  discountPrice: null
};

export default function AdminCoursesPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [thumbUploading, setThumbUploading] = useState(false);
  const thumbRef = useRef(null);
  
  const [assignModal, setAssignModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-courses', page, search],
    queryFn: () => api.get(`/courses/admin?page=${page}&limit=10${search ? `&search=${search}` : ''}`).then(r => r.data)
  });

  const { data: studentsData } = useQuery({
    queryKey: ['students-list'],
    queryFn: () => api.get('/users?role=student').then(r => r.data.data || [])
  });

  const createMut = useMutation({
    mutationFn: (d) => api.post('/courses', d),
    onSuccess: () => { 
      qc.invalidateQueries(['admin-courses']); 
      setModal(null); 
      setForm(defaultForm); 
      toast.success('Course created!'); 
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed')
  });

  const updateMut = useMutation({
    mutationFn: ({ id, ...d }) => api.put(`/courses/${id}`, d),
    onSuccess: () => { 
      qc.invalidateQueries(['admin-courses']); 
      setModal(null); 
      toast.success('Course updated!'); 
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed')
  });

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/courses/${id}`),
    onSuccess: () => { 
      qc.invalidateQueries(['admin-courses']); 
      toast.success('Course deleted'); 
    }
  });

  const publishMut = useMutation({
    mutationFn: (id) => api.put(`/courses/${id}/publish`),
    onSuccess: () => { 
      qc.invalidateQueries(['admin-courses']); 
      toast.success('Course published!'); 
    }
  });

  const assignStudentsMut = useMutation({
    mutationFn: ({ courseId, studentIds }) => api.put(`/courses/${courseId}/assign-students`, { studentIds }),
    onSuccess: () => { 
      qc.invalidateQueries(['admin-courses']); 
      setAssignModal(false); 
      setSelectedStudents([]);
      toast.success('Students enrolled successfully!'); 
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to assign students')
  });

  const handleThumb = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbUploading(true);
    const fd = new FormData();
    fd.append('thumbnail', file);
    try {
      const { data } = await api.post('/upload/thumbnail', fd, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      setForm(f => ({ ...f, thumbnail: data.data.url }));
      toast.success('Thumbnail uploaded!');
    } catch { 
      toast.error('Upload failed'); 
    } finally { 
      setThumbUploading(false); 
    }
  };

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  }, []);

  // 🔥 NEW - Handle price/discount changes
  const handlePriceChange = useCallback((e) => {
    const { name, value } = e.target;
    const numValue = value === '' ? null : parseFloat(value);
    setForm(prev => ({ ...prev, [name]: numValue }));
  }, []);

  // Columns with price display
  const columns = [
    { key: 'name', title: 'Course', render: (v, row) => (
      <div className="flex items-center gap-3">
        {row.thumbnail
          ? <img src={row.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover" />
          : <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
              style={{ background: 'rgba(99,102,241,0.1)' }}>📚</div>}
        <div>
          <p className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>{v}</p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{row.instructor}</p>
        </div>
      </div>
    )},
    { key: 'category', title: 'Category' },
    { key: 'level', title: 'Level', render: (v) => <span className="badge badge-primary capitalize">{v}</span> },
    // 🔥 NEW - Price column
    { key: 'price', title: 'Price', render: (v, row) => (
      <span className="text-sm font-medium">
        {row.isPaid ? `${row.currency || '₹'} ${row.discountPrice || row.price}` : 'Free'}
        {row.discountPrice && row.discountPrice < row.price && (
          <span className="text-xs line-through text-gray-400 ml-1">₹{row.price}</span>
        )}
      </span>
    )},
    { key: 'studentCount', title: 'Students', render: (v, row) => (
      <button 
        onClick={() => { setSelectedCourse(row); setAssignModal(true); }}
        className="text-primary-600 hover:underline"
      >
        {v} Students
      </button>
    )},
    { key: 'isPublished', title: 'Status', render: (v) => (
      <span className={`badge ${v ? 'badge-success' : 'badge-warning'}`}>
        {v ? 'Published' : 'Draft'}
      </span>
    )},
    { key: 'actions', title: 'Actions', render: (_, row) => (
      <div className="flex items-center gap-1">
        <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-sm"
          onClick={() => { 
            setSelected(row); 
            setForm({ 
              name: row.name, 
              description: row.description, 
              category: row.category, 
              instructor: row.instructor, 
              level: row.level, 
              thumbnail: row.thumbnail || '',
              isPaid: row.isPaid || false,
              price: row.price || 0,
              currency: row.currency || 'INR',
              discountPrice: row.discountPrice || null
            }); 
            setModal('edit'); 
          }}>✏️</button>
        {!row.isPublished && (
          <button className="p-1.5 rounded-lg hover:bg-green-50 text-sm" 
            onClick={() => publishMut.mutate(row._id)}>🚀</button>
        )}
        <button className="p-1.5 rounded-lg hover:bg-red-50 text-sm"
          onClick={() => { if (confirm('Delete this course?')) deleteMut.mutate(row._id); }}>🗑️</button>
      </div>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Courses</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Manage course catalog</p>
        </div>
        <button className="btn-primary" onClick={() => { setForm(defaultForm); setModal('add'); }}>+ Create Course</button>
      </div>

      <DataTable columns={columns} data={data?.data} loading={isLoading}
        pagination={{ page, pages: data?.pages, total: data?.total }}
        onPageChange={setPage} onSearch={setSearch} searchPlaceholder="Search courses..." />

      {/* Create/Edit Course Modal - WITH PAYMENT FIELDS */}
      <Modal isOpen={modal === 'add' || modal === 'edit'} onClose={() => setModal(null)}
        title={modal === 'add' ? 'Create Course' : 'Edit Course'} size="lg"
        footer={
          <div className="flex gap-3 justify-end">
            <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn-primary" disabled={createMut.isPending || updateMut.isPending}
              onClick={() => modal === 'add' ? createMut.mutate(form) : updateMut.mutate({ id: selected._id, ...form })}>
              {createMut.isPending || updateMut.isPending ? 'Saving...' : modal === 'add' ? 'Create' : 'Update'}
            </button>
          </div>
        }>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Basic Info Section */}
          <div className="border-b pb-3">
            <h3 className="font-semibold mb-3">Basic Information</h3>
            <div>
              <label className="block text-sm font-medium mb-1.5">Thumbnail</label>
              <div className="flex items-center gap-3">
                {form.thumbnail && <img src={form.thumbnail} alt="" className="w-16 h-16 rounded-xl object-cover" />}
                <button type="button" onClick={() => thumbRef.current?.click()}
                  className="btn-secondary text-sm py-2 px-3" disabled={thumbUploading}>
                  {thumbUploading ? '⏳ Uploading...' : '📷 Upload Image'}
                </button>
                <input ref={thumbRef} type="file" accept="image/*" className="hidden" onChange={handleThumb} />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1.5">Course Name *</label>
              <input name="name" className="input-field" value={form.name} onChange={handleChange} autoComplete="off" />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1.5">Instructor *</label>
              <input name="instructor" className="input-field" value={form.instructor} onChange={handleChange} autoComplete="off" />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1.5">Category *</label>
              <input name="category" className="input-field" value={form.category} onChange={handleChange} autoComplete="off" />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1.5">Level</label>
              <select name="level" className="input-field" value={form.level} onChange={handleChange}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <textarea name="description" className="input-field resize-none h-24" 
                value={form.description} onChange={handleChange} placeholder="Course description..." />
            </div>
          </div>

          {/* 🔥 NEW - Payment Settings Section */}
          <div className="border-b pb-3">
            <h3 className="font-semibold mb-3">💰 Payment Settings</h3>
            
            <label className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                name="isPaid"
                checked={form.isPaid}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">This is a paid course</span>
            </label>
            
            {form.isPaid && (
              <div className="grid grid-cols-2 gap-3 ml-6">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Price *</label>
                  <input
                    type="number"
                    name="price"
                    className="input-field"
                    value={form.price}
                    onChange={handlePriceChange}
                    min="1"
                    step="0.01"
                    placeholder="e.g., 499"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Currency</label>
                  <select name="currency" className="input-field" value={form.currency} onChange={handleChange}>
                    <option value="INR">₹ Indian Rupee (INR)</option>
                    <option value="USD">$ US Dollar (USD)</option>
                    <option value="EUR">€ Euro (EUR)</option>
                    <option value="GBP">£ British Pound (GBP)</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1.5">
                    Discount Price (Optional)
                    <span className="text-xs text-gray-500 ml-2">Leave empty for no discount</span>
                  </label>
                  <input
                    type="number"
                    name="discountPrice"
                    className="input-field"
                    value={form.discountPrice || ''}
                    onChange={handlePriceChange}
                    min="0"
                    step="0.01"
                    placeholder="Discounted price"
                  />
                  {form.discountPrice && form.price && form.discountPrice >= form.price && (
                    <p className="text-xs text-red-500 mt-1">Discount price must be less than original price</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Assign Students Modal */}
      <Modal isOpen={assignModal} onClose={() => setAssignModal(false)} 
        title={`Enroll Students in ${selectedCourse?.name}`} size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Select Students to Enroll
            </label>
            <div className="max-h-96 overflow-y-auto border rounded-lg p-2">
              {studentsData?.map(student => (
                <label key={student._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStudents([...selectedStudents, student._id]);
                      } else {
                        setSelectedStudents(selectedStudents.filter(id => id !== student._id));
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-medium text-sm">{student.name}</p>
                    <p className="text-xs text-gray-500">{student.email}</p>
                  </div>
                </label>
              ))}
              {(!studentsData || studentsData.length === 0) && (
                <p className="text-center py-4 text-gray-500">No students found. Create some student accounts first.</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6 pt-4 border-t">
          <button className="btn-secondary" onClick={() => setAssignModal(false)}>Cancel</button>
          <button 
            className="btn-primary" 
            disabled={selectedStudents.length === 0 || assignStudentsMut.isPending}
            onClick={() => assignStudentsMut.mutate({ courseId: selectedCourse._id, studentIds: selectedStudents })}
          >
            {assignStudentsMut.isPending ? 'Enrolling...' : `Enroll ${selectedStudents.length} Student(s)`}
          </button>
        </div>
      </Modal>
    </div>
  );
}