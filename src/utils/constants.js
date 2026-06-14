export const QUIZ_TYPES = {
  exam:       { label: 'Exam',       color: '#6366f1' },
  practice:   { label: 'Practice',   color: '#22c55e' },
  assignment: { label: 'Assignment', color: '#f59e0b' }
};

export const QUESTION_TYPES = [
  { value: 'single_choice',   label: 'Single Choice' },
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'true_false',      label: 'True / False' },
  { value: 'fill_blank',      label: 'Fill in the Blank' },
  { value: 'short_answer',    label: 'Short Answer' }
];

export const DIFFICULTY_LEVELS = [
  { value: 'easy',   label: 'Easy',   color: '#22c55e' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'hard',   label: 'Hard',   color: '#f43f5e' }
];

export const ROLES = { SUPER_ADMIN: 'super_admin', ADMIN: 'admin', STUDENT: 'student' };

export const NOTIFICATION_TYPES = {
  quiz_assigned:    { icon: '📝', label: 'Quiz Assigned' },
  result_published: { icon: '📊', label: 'Result Published' },
  announcement:     { icon: '📢', label: 'Announcement' },
  course_update:    { icon: '📚', label: 'Course Update' },
  message:          { icon: '💬', label: 'Message' },
  system:           { icon: '⚙️', label: 'System' }
};
