import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { adminApi as api } from '@/services/api';

const QUESTION_TYPES = [
  { value: 'single_choice',   label: 'Single Choice' },
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'true_false',      label: 'True / False' },
  { value: 'fill_blank',      label: 'Fill in the Blank' },
  { value: 'short_answer',    label: 'Short Answer' }
];

function QuestionEditor({ question, onSave, onDelete, index }) {
  const [q, setQ] = useState(question);
  const [imgUploading, setImgUploading] = useState(false);
  const imgRef = useRef(null);

  const saveMut = useMutation({
    mutationFn: (data) => question._id
      ? api.put(`/questions/${question._id}`, data)
      : api.post(`/questions/quiz/${question.quizId}`, data),
    onSuccess: ({ data }) => { onSave(data.data); toast.success('Question saved'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Save failed')
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImgUploading(true);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const { data } = await api.post('/upload/question-image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setQ(p => ({ ...p, image: data.data.url }));
      toast.success('Image uploaded!');
    } catch { toast.error('Image upload failed'); }
    finally { setImgUploading(false); }
  };

  const addOption = () => setQ(p => ({ ...p, options: [...(p.options || []), { text: '', isCorrect: false }] }));
  const updateOption = (i, key, val) => setQ(p => {
    const opts = [...p.options];
    if (key === 'isCorrect' && val && p.type === 'single_choice') {
      opts.forEach((o, j) => { opts[j] = { ...o, isCorrect: j === i }; });
    } else {
      opts[i] = { ...opts[i], [key]: val };
    }
    return { ...p, options: opts };
  });
  const removeOption = (i) => setQ(p => ({ ...p, options: p.options.filter((_, j) => j !== i) }));

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="card border-l-4" style={{ borderLeftColor: 'var(--color-primary)' }}>
      <div className="flex items-start justify-between mb-4">
        <span className="badge badge-primary">Question {index + 1}</span>
        <button onClick={onDelete} className="text-sm p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400">🗑️ Remove</button>
      </div>

      <div className="space-y-4">
        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Question Text *</label>
          <textarea className="input-field resize-none h-24" value={q.text || ''}
            onChange={e => setQ(p => ({ ...p, text: e.target.value }))} placeholder="Enter your question here..." />
        </div>

        {/* Image upload */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Question Image (optional)</label>
          <div className="flex items-center gap-3">
            {q.image && <img src={q.image} alt="question" className="w-20 h-20 object-cover rounded-lg border" />}
            <button type="button" onClick={() => imgRef.current?.click()}
              className="btn-secondary text-sm py-2 px-3" disabled={imgUploading}>
              {imgUploading ? '⏳ Uploading...' : '📷 Upload Image'}
            </button>
            {q.image && <button type="button" onClick={() => setQ(p => ({ ...p, image: null }))}
              className="text-xs text-red-400 hover:text-red-600">Remove</button>}
            <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>
        </div>

        {/* Metadata row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Type</label>
            <select className="input-field text-sm" value={q.type || 'single_choice'}
              onChange={e => setQ(p => ({ ...p, type: e.target.value, options: [], correctAnswer: '' }))}>
              {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Marks</label>
            <input type="number" className="input-field text-sm" min="1" value={q.marks || 1}
              onChange={e => setQ(p => ({ ...p, marks: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Difficulty</label>
            <select className="input-field text-sm" value={q.difficulty || 'medium'}
              onChange={e => setQ(p => ({ ...p, difficulty: e.target.value }))}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Subject</label>
            <input className="input-field text-sm" value={q.subject || ''}
              onChange={e => setQ(p => ({ ...p, subject: e.target.value }))} placeholder="e.g. Math" />
          </div>
        </div>

        {/* Options for MCQ types */}
        {['single_choice','multiple_choice','true_false'].includes(q.type) && (
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Answer Options
              <span className="ml-2 text-xs font-normal" style={{ color: 'var(--color-text-muted)' }}>
                ({q.type === 'multiple_choice' ? 'check all correct' : 'select one correct'})
              </span>
            </label>
            <div className="space-y-2">
              {q.type === 'true_false' ? (
                ['True', 'False'].map((opt, i) => (
                  <label key={opt} className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors"
                    style={{ borderColor: (q.options?.[i]?.isCorrect) ? 'var(--color-success)' : 'rgba(226,232,240,0.8)', background: (q.options?.[i]?.isCorrect) ? 'rgba(34,197,94,0.05)' : 'transparent' }}>
                    <input type="radio" name={`tf_${index}`} checked={q.options?.[i]?.isCorrect || false}
                      onChange={() => setQ(p => ({ ...p, options: [{ text: 'True', isCorrect: i === 0 }, { text: 'False', isCorrect: i === 1 }] }))} />
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{opt}</span>
                  </label>
                ))
              ) : (
                <>
                  {(q.options || []).map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type={q.type === 'multiple_choice' ? 'checkbox' : 'radio'}
                        name={`opt_${index}`}
                        checked={opt.isCorrect}
                        onChange={e => updateOption(i, 'isCorrect', q.type === 'multiple_choice' ? e.target.checked : true)}
                        className="w-4 h-4 cursor-pointer"
                        title="Mark as correct"
                      />
                      <input className="input-field text-sm flex-1" value={opt.text}
                        onChange={e => updateOption(i, 'text', e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + i)}`} />
                      <button onClick={() => removeOption(i)} className="p-1.5 rounded hover:bg-red-50 text-red-400 text-xs">✕</button>
                    </div>
                  ))}
                  {(q.options || []).length < 6 && (
                    <button onClick={addOption} className="text-xs font-medium mt-1 flex items-center gap-1"
                      style={{ color: 'var(--color-primary)' }}>+ Add Option</button>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Text answer */}
        {['fill_blank','short_answer'].includes(q.type) && (
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Correct Answer</label>
            <input className="input-field" value={q.correctAnswer || ''}
              onChange={e => setQ(p => ({ ...p, correctAnswer: e.target.value }))} placeholder="Expected correct answer..." />
          </div>
        )}

        {/* Explanation */}
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Explanation (shown after submission)</label>
          <input className="input-field text-sm" value={q.explanation || ''}
            onChange={e => setQ(p => ({ ...p, explanation: e.target.value }))} placeholder="Explain why this answer is correct..." />
        </div>

        <button className="btn-primary text-sm" onClick={() => saveMut.mutate(q)} disabled={saveMut.isPending}>
          {saveMut.isPending ? '⏳ Saving...' : '💾 Save Question'}
        </button>
      </div>
    </motion.div>
  );
}

// AI Question Generator panel
function AIQuestionGenerator({ quizId, onAdd }) {
  const [form, setForm] = useState({ topic: '', subject: '', count: 5, difficulty: 'medium', type: 'single_choice' });
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState([]);

  const generate = async () => {
    if (!form.topic) { toast.error('Enter a topic'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/ai/generate-questions', form);
      setGenerated(data.data);
      toast.success(`${data.count} questions generated!`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'AI generation failed');
    } finally { setLoading(false); }
  };

  const addAll = async () => {
    try {
      await api.post(`/questions/quiz/${quizId}/bulk`, { questions: generated.map(q => ({ ...q, quizId })) });
      onAdd(generated);
      setGenerated([]);
      toast.success(`${generated.length} questions added!`);
    } catch { toast.error('Failed to add questions'); }
  };

  return (
    <div className="card border-2" style={{ borderColor: 'rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.02)' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: 'rgba(99,102,241,0.1)' }}>🤖</div>
        <div>
          <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>AI Question Generator</h3>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Powered by Google Gemini</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Topic *</label>
          <input className="input-field text-sm" value={form.topic}
            onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} placeholder="e.g. Photosynthesis, World War II..." />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Subject</label>
          <input className="input-field text-sm" value={form.subject}
            onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="e.g. Biology" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Count (max 20)</label>
          <input type="number" className="input-field text-sm" min="1" max="20" value={form.count}
            onChange={e => setForm(f => ({ ...f, count: Number(e.target.value) }))} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Difficulty</label>
          <select className="input-field text-sm" value={form.difficulty}
            onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Type</label>
          <select className="input-field text-sm" value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
            {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>
      <button className="btn-primary text-sm mb-4" onClick={generate} disabled={loading}>
        {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</> : '🤖 Generate Questions'}
      </button>

      {generated.length > 0 && (
        <div className="mt-4 border-t pt-4" style={{ borderColor: 'rgba(226,232,240,0.6)' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{generated.length} Questions Generated</p>
            <button className="btn-primary text-xs py-1.5 px-3" onClick={addAll}>
              + Add All to Quiz
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {generated.map((q, i) => (
              <div key={i} className="p-3 rounded-xl text-sm"
                style={{ background: 'rgba(248,250,252,0.8)' }}>
                <p className="font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  {i + 1}. {q.text}
                </p>
                {q.options?.map((opt, j) => (
                  <p key={j} className="text-xs ml-3"
                    style={{ color: opt.isCorrect ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                    {opt.isCorrect ? '✓' : '○'} {opt.text}
                  </p>
                ))}
                {q.correctAnswer && <p className="text-xs ml-3" style={{ color: 'var(--color-success)' }}>✓ {q.correctAnswer}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// File Upload Question Importer
function FileQuestionImporter({ quizId, onAdd }) {
  const [uploading, setUploading] = useState(false);
  const [parsed, setParsed] = useState([]);
  const fileRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const { data } = await api.post('/upload/quiz-file', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setParsed(data.data.questions);
      toast.success(`${data.data.questions.length} questions extracted from file`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'File parsing failed');
    } finally { setUploading(false); }
  };

  const addAll = async () => {
    if (!quizId) { toast.error('Save quiz first'); return; }
    try {
      await api.post(`/questions/quiz/${quizId}/bulk`, { questions: parsed });
      onAdd(parsed);
      setParsed([]);
      toast.success(`${parsed.length} questions imported!`);
    } catch { toast.error('Import failed'); }
  };

  return (
    <div className="card border-2 border-dashed" style={{ borderColor: 'rgba(14,165,233,0.4)', background: 'rgba(14,165,233,0.02)' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: 'rgba(14,165,233,0.1)' }}>📂</div>
        <div>
          <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Import from File</h3>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>CSV, Excel, TXT</p>
        </div>
      </div>
      <div className="text-xs mb-3 p-3 rounded-lg" style={{ background: 'rgba(248,250,252,0.8)', color: 'var(--color-text-secondary)' }}>
        <p className="font-medium mb-1">CSV/Excel columns:</p>
        <p>text, type, option_a, option_b, option_c, option_d, correct_option, marks, difficulty, subject, explanation</p>
        <p className="mt-1 font-medium">TXT format: Q1. Question? / A. Option / B. Option / Answer: A</p>
      </div>
      <button className="btn-secondary text-sm mb-3" onClick={() => fileRef.current?.click()} disabled={uploading}>
        {uploading ? '⏳ Parsing...' : '📁 Choose File (CSV/Excel/TXT)'}
      </button>
      <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.txt" className="hidden" onChange={handleFile} />

      {parsed.length > 0 && (
        <div className="mt-3 border-t pt-3" style={{ borderColor: 'rgba(226,232,240,0.6)' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{parsed.length} questions ready</p>
            <button className="btn-primary text-xs py-1.5 px-3" onClick={addAll}>+ Add All</button>
          </div>
          {parsed.slice(0, 3).map((q, i) => (
            <p key={i} className="text-xs py-1" style={{ color: 'var(--color-text-secondary)' }}>
              {i + 1}. {q.text?.slice(0, 60)}...
            </p>
          ))}
          {parsed.length > 3 && <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>...and {parsed.length - 3} more</p>}
        </div>
      )}
    </div>
  );
}

export default function QuizBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isEdit = !!id;
  const [activeTab, setActiveTab] = useState('details');
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const thumbnailRef = useRef(null);
  const [quizForm, setQuizForm] = useState({
    title: '', description: '', type: 'exam', duration: 60,
    attemptsAllowed: 1, passingMarks: 0, totalMarks: 0,
    shuffleQuestions: false, shuffleOptions: false,
    showResult: true, showAnswers: false, status: 'draft', instructions: ''
  });
  const [questions, setQuestions] = useState([]);

  useQuery({
    queryKey: ['quiz-detail', id],
    queryFn: () => api.get(`/quizzes/admin/${id}`).then(r => r.data.data),
    enabled: isEdit,
    onSuccess: (data) => {
      setQuizForm({
        title: data.title, description: data.description || '',
        type: data.type, duration: data.duration,
        attemptsAllowed: data.attemptsAllowed, passingMarks: data.passingMarks,
        totalMarks: data.totalMarks, shuffleQuestions: data.shuffleQuestions,
        shuffleOptions: data.shuffleOptions || false,
        showResult: data.showResult, showAnswers: data.showAnswers,
        status: data.status, instructions: data.instructions || ''
      });
      setQuestions(data.questions || []);
    }
  });

  const saveMut = useMutation({
    mutationFn: (data) => isEdit ? api.put(`/quizzes/${id}`, data) : api.post('/quizzes', data),
    onSuccess: ({ data }) => {
      toast.success(isEdit ? 'Quiz updated!' : 'Quiz created!');
      if (!isEdit) navigate(`/admin/quizzes/builder/${data.data._id}`);
      qc.invalidateQueries(['admin-quizzes']);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Save failed')
  });

  const publishMut = useMutation({
    mutationFn: () => api.put(`/quizzes/${id}/publish`),
    onSuccess: () => { toast.success('🚀 Quiz published!'); qc.invalidateQueries(['quiz-detail', id]); }
  });

  const handleThumbnail = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnailUploading(true);
    const fd = new FormData();
    fd.append('thumbnail', file);
    try {
      const { data } = await api.post('/upload/thumbnail', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setQuizForm(f => ({ ...f, thumbnail: data.data.url }));
      toast.success('Thumbnail uploaded!');
    } catch { toast.error('Upload failed'); }
    finally { setThumbnailUploading(false); }
  };

  const addBlankQuestion = () => setQuestions(p => [...p, {
    text: '', type: 'single_choice', marks: 1, options: [], difficulty: 'medium', quizId: id
  }]);
  const removeQuestion = (i) => setQuestions(p => p.filter((_, j) => j !== i));
  const updateQuestion = (i, updated) => setQuestions(p => p.map((q, j) => j === i ? updated : q));
  const addBulkQuestions = (qs) => setQuestions(p => [...p, ...qs.map(q => ({ ...q, quizId: id }))]);

  const TABS = [
    { key: 'details',   label: '📋 Details' },
    { key: 'questions', label: `❓ Questions (${questions.length})` },
    { key: 'ai',        label: '🤖 AI Tools' },
    { key: 'import',    label: '📂 Import File' },
    { key: 'settings',  label: '⚙️ Settings' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {isEdit ? 'Edit Quiz' : 'Create Quiz'}
          </h1>
        </div>
        <div className="flex gap-2">
          {isEdit && (
            <button className="btn-primary text-sm" style={{ background: 'var(--color-success)' }}
              onClick={() => publishMut.mutate()} disabled={publishMut.isPending}>
              🚀 Publish
            </button>
          )}
          <button className="btn-primary text-sm" onClick={() => saveMut.mutate(quizForm)} disabled={saveMut.isPending}>
            {saveMut.isPending ? 'Saving...' : '💾 Save'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 p-1 rounded-xl" style={{ background: 'rgba(226,232,240,0.4)' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t.key ? 'bg-white shadow-sm dark:bg-slate-700' : ''}`}
            style={{ color: activeTab === t.key ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="card space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Quiz Title *</label>
            <input className="input-field" value={quizForm.title}
              onChange={e => setQuizForm(f => ({ ...f, title: e.target.value }))} placeholder="Enter quiz title" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Description</label>
            <textarea className="input-field resize-none h-24" value={quizForm.description}
              onChange={e => setQuizForm(f => ({ ...f, description: e.target.value }))} placeholder="Quiz description..." />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[['type','Type','select',['exam','practice','assignment']],
              ['duration','Duration (min)','number'],
              ['attemptsAllowed','Max Attempts','number'],
              ['passingMarks','Passing Marks','number']].map(([key, label, type, opts]) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>{label}</label>
                {type === 'select'
                  ? <select className="input-field" value={quizForm[key]}
                      onChange={e => setQuizForm(f => ({ ...f, [key]: e.target.value }))}>
                      {opts.map(o => <option key={o} value={o} className="capitalize">{o}</option>)}
                    </select>
                  : <input type={type} className="input-field" min="0" value={quizForm[key]}
                      onChange={e => setQuizForm(f => ({ ...f, [key]: Number(e.target.value) }))} />}
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Instructions</label>
            <textarea className="input-field resize-none h-20" value={quizForm.instructions}
              onChange={e => setQuizForm(f => ({ ...f, instructions: e.target.value }))} placeholder="Instructions for students..." />
          </div>
        </div>
      )}

      {/* Questions Tab */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          {!isEdit ? (
            <div className="card border-dashed border-2 text-center py-10" style={{ borderColor: 'rgba(99,102,241,0.3)' }}>
              <p style={{ color: 'var(--color-text-muted)' }}>💾 Save the quiz details first, then add questions</p>
            </div>
          ) : (
            <>
              {questions.map((q, i) => (
                <QuestionEditor key={i} question={q} index={i}
                  onSave={(updated) => updateQuestion(i, updated)}
                  onDelete={() => removeQuestion(i)} />
              ))}
              <button onClick={addBlankQuestion}
                className="btn-secondary w-full justify-center py-4 border-dashed border-2 text-sm"
                style={{ borderColor: 'rgba(99,102,241,0.3)' }}>
                + Add Blank Question
              </button>
            </>
          )}
        </div>
      )}

      {/* AI Tools Tab */}
      {activeTab === 'ai' && (
        <div>
          {!isEdit ? (
            <div className="card text-center py-10">
              <p style={{ color: 'var(--color-text-muted)' }}>Save quiz first to use AI tools</p>
            </div>
          ) : (
            <AIQuestionGenerator quizId={id} onAdd={addBulkQuestions} />
          )}
        </div>
      )}

      {/* Import File Tab */}
      {activeTab === 'import' && (
        <div>
          {!isEdit ? (
            <div className="card text-center py-10">
              <p style={{ color: 'var(--color-text-muted)' }}>Save quiz first to import questions</p>
            </div>
          ) : (
            <FileQuestionImporter quizId={id} onAdd={addBulkQuestions} />
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="card space-y-4">
          {[
            ['shuffleQuestions', 'Shuffle Questions Order'],
            ['shuffleOptions',   'Shuffle Answer Options'],
            ['showResult',       'Show Result After Submission'],
            ['showAnswers',      'Show Correct Answers After Submission']
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={!!quizForm[key]}
                  onChange={e => setQuizForm(f => ({ ...f, [key]: e.target.checked }))} />
                <div className="w-11 h-6 rounded-full transition-colors"
                  style={{ background: quizForm[key] ? 'var(--color-primary)' : 'rgba(226,232,240,0.8)' }} />
                <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform shadow"
                  style={{ transform: quizForm[key] ? 'translateX(20px)' : 'none' }} />
              </div>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
