import { useEffect, useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { studentApi as api } from '@/services/api';
import { startAttempt, setAnswer, markForReview, setQuestion, decrementTimer, toggleFullscreen, endQuiz } from '@/store/slices/quizSlice';

const formatTime = (secs) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export default function QuizInterfacePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { activeAttempt, activeQuiz, currentQuestion, answers, timeRemaining, isFullscreen } = useSelector(s => s.quiz);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  // Start quiz
  const { isLoading: starting } = useQuery({
    queryKey: ['start-quiz', id],
    queryFn: async () => {
      const { data } = await api.post(`/quizzes/${id}/start`);
      dispatch(startAttempt(data.data));
      return data.data;
    },
    enabled: !!id && !activeAttempt
  });

  // Timer countdown
  useEffect(() => {
    if (!activeAttempt || timeRemaining === null) return;
    const interval = setInterval(() => {
      dispatch(decrementTimer());
    }, 1000);
    return () => clearInterval(interval);
  }, [activeAttempt, dispatch]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeRemaining === 0) handleSubmit();
  }, [timeRemaining]);

  // Save answer mutation
  const saveAnswerMutation = useMutation({
    mutationFn: ({ questionId, selectedOption, textAnswer, isMarkedForReview }) =>
      api.put(`/quizzes/attempt/${activeAttempt._id}/answer`, { questionId, selectedOption, textAnswer, isMarkedForReview })
  });

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: () => api.post(`/quizzes/attempt/${activeAttempt._id}/submit`),
    onSuccess: ({ data }) => {
      dispatch(endQuiz());
      navigate(`/student/results/${data.data._id}`);
      toast.success('Quiz submitted successfully!');
    },
    onError: () => toast.error('Submission failed. Please try again.')
  });

  const handleSelectOption = (question, optionId) => {
    dispatch(setAnswer({ questionId: question._id, selectedOption: optionId }));
    saveAnswerMutation.mutate({ questionId: question._id, selectedOption: optionId });
  };

  const handleTextAnswer = (question, text) => {
    dispatch(setAnswer({ questionId: question._id, textAnswer: text }));
  };

  const handleMarkReview = (questionId) => {
    dispatch(markForReview(questionId));
    const ans = answers[questionId] || {};
    saveAnswerMutation.mutate({ questionId, selectedOption: ans.selectedOption, textAnswer: ans.textAnswer, isMarkedForReview: !ans.isMarkedForReview });
  };

  const handleSubmit = useCallback(() => {
    if (!activeAttempt) return;
    setConfirmSubmit(false);
    submitMutation.mutate();
  }, [activeAttempt]);

  if (starting) return (
    <div className="flex items-center justify-center h-[60vh] gap-4 flex-col">
      <div className="w-12 h-12 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      <p style={{ color: 'var(--color-text-secondary)' }}>Loading quiz...</p>
    </div>
  );

  if (!activeQuiz) return null;

  const questions = activeQuiz.questions || [];
  const question = questions[currentQuestion];
  const totalQ = questions.length;
  const answeredCount = Object.keys(answers).filter(id => {
    const a = answers[id];
    return a.selectedOption || a.textAnswer;
  }).length;

  const isLowTime = timeRemaining !== null && timeRemaining < 120;

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 overflow-y-auto' : ''}`}
      style={{ background: 'var(--color-bg)' }}>

      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 border-b shadow-sm"
        style={{ background: 'var(--color-card)', borderColor: 'rgba(226,232,240,0.6)' }}>
        <div>
          <h2 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{activeQuiz.title}</h2>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{answeredCount}/{totalQ} answered</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Timer */}
          {timeRemaining !== null && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-sm ${isLowTime ? 'animate-pulse' : ''}`}
              style={{
                background: isLowTime ? 'rgba(244,63,94,0.1)' : 'rgba(99,102,241,0.1)',
                color: isLowTime ? 'var(--color-danger)' : 'var(--color-primary)'
              }}>
              ⏱ {formatTime(timeRemaining)}
            </div>
          )}
          <button onClick={() => dispatch(toggleFullscreen())} className="btn-secondary py-2 px-3 text-xs">
            {isFullscreen ? '⊡ Exit' : '⊞ Full'}
          </button>
          <button onClick={() => setConfirmSubmit(true)} className="btn-primary py-2 px-4 text-sm">
            Submit Quiz
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full" style={{ background: 'rgba(226,232,240,0.4)' }}>
        <motion.div className="h-full" style={{ background: 'var(--color-primary)', width: `${(answeredCount / totalQ) * 100}%` }}
          transition={{ duration: 0.3 }} />
      </div>

      <div className="flex gap-4 p-6 max-w-6xl mx-auto">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {question && (
            <AnimatePresence mode="wait">
              <motion.div key={currentQuestion}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}>
                <div className="card mb-4">
                  <div className="flex items-start justify-between mb-4">
                    <span className="badge badge-primary">Q{currentQuestion + 1} of {totalQ}</span>
                    <div className="flex items-center gap-2">
                      <span className="badge" style={{ background: 'rgba(245,158,11,0.1)', color: '#d97706' }}>
                        {question.marks} mark{question.marks !== 1 ? 's' : ''}
                      </span>
                      {question.difficulty && (
                        <span className={`badge ${question.difficulty === 'easy' ? 'badge-success' : question.difficulty === 'hard' ? 'badge-danger' : 'badge-warning'}`}>
                          {question.difficulty}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-base font-medium mb-6" style={{ color: 'var(--color-text-primary)' }}>
                    {question.text}
                  </p>

                  {/* Options */}
                  {(question.type === 'single_choice' || question.type === 'multiple_choice' || question.type === 'true_false') && (
                    <div className="space-y-3">
                      {question.options.map((opt, i) => {
                        const isSelected = answers[question._id]?.selectedOption === opt._id;
                        return (
                          <button key={opt._id} onClick={() => handleSelectOption(question, opt._id)}
                            className={`question-option w-full ${isSelected ? 'selected' : ''}`}>
                            <span className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0"
                              style={{
                                borderColor: isSelected ? 'var(--color-primary)' : 'rgba(226,232,240,0.8)',
                                background: isSelected ? 'var(--color-primary)' : 'transparent',
                                color: isSelected ? 'white' : 'var(--color-text-secondary)'
                              }}>
                              {String.fromCharCode(65 + i)}
                            </span>
                            <span className="text-sm text-left" style={{ color: 'var(--color-text-primary)' }}>{opt.text}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {(question.type === 'fill_blank' || question.type === 'short_answer') && (
                    <textarea
                      className="input-field resize-none h-32"
                      placeholder={question.type === 'fill_blank' ? 'Type your answer...' : 'Write your response...'}
                      value={answers[question._id]?.textAnswer || ''}
                      onChange={e => handleTextAnswer(question, e.target.value)}
                      onBlur={e => saveAnswerMutation.mutate({ questionId: question._id, textAnswer: e.target.value })}
                    />
                  )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <button onClick={() => dispatch(setQuestion(Math.max(0, currentQuestion - 1)))}
                      className="btn-secondary" disabled={currentQuestion === 0}>
                      ← Previous
                    </button>
                    <button onClick={() => handleMarkReview(question._id)}
                      className="btn-secondary"
                      style={{ color: answers[question._id]?.isMarkedForReview ? '#f59e0b' : undefined }}>
                      {answers[question._id]?.isMarkedForReview ? '🚩 Marked' : '🏳 Mark for Review'}
                    </button>
                  </div>
                  <button onClick={() => dispatch(setQuestion(Math.min(totalQ - 1, currentQuestion + 1)))}
                    className="btn-primary" disabled={currentQuestion === totalQ - 1}>
                    Next →
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Question Navigation Panel */}
        <div className="w-56 flex-shrink-0">
          <div className="card sticky top-24">
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-secondary)' }}>Questions</h4>
            <div className="grid grid-cols-5 gap-1.5 mb-4">
              {questions.map((q, i) => {
                const ans = answers[q._id];
                const isAnswered = ans?.selectedOption || ans?.textAnswer;
                const isReview = ans?.isMarkedForReview;
                const isCurrent = i === currentQuestion;
                return (
                  <button key={q._id} onClick={() => dispatch(setQuestion(i))}
                    className="w-8 h-8 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: isCurrent ? 'var(--color-primary)' :
                        isReview ? '#f59e0b' : isAnswered ? '#22c55e' : 'rgba(226,232,240,0.5)',
                      color: isCurrent || isAnswered || isReview ? 'white' : 'var(--color-text-secondary)'
                    }}>
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div className="space-y-1.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-green-500" /><span>Answered</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-yellow-500" /><span>Marked for review</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ background: 'var(--color-primary)' }} /><span>Current</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ background: 'rgba(226,232,240,0.5)' }} /><span>Not attempted</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Submit Modal */}
      {confirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="card max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Submit Quiz?</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              You have answered {answeredCount} of {totalQ} questions.
              {answeredCount < totalQ && ` ${totalQ - answeredCount} questions are unanswered.`}
            </p>
            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setConfirmSubmit(false)}>Cancel</button>
              <button className="btn-primary flex-1" onClick={handleSubmit} disabled={submitMutation.isPending}>
                {submitMutation.isPending ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
