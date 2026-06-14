import { createSlice } from '@reduxjs/toolkit';

const quizSlice = createSlice({
  name: 'quiz',
  initialState: {
    activeAttempt: null,
    activeQuiz: null,
    currentQuestion: 0,
    answers: {},
    timeRemaining: null,
    isFullscreen: false,
    status: 'idle'
  },
  reducers: {
    startAttempt: (state, action) => {
      state.activeAttempt = action.payload.attempt;
      state.activeQuiz = action.payload.quiz;
      state.currentQuestion = 0;
      state.answers = {};
      state.timeRemaining = action.payload.quiz.duration * 60;
      state.status = 'in_progress';
    },
    setAnswer: (state, action) => {
      const { questionId, selectedOption, textAnswer } = action.payload;
      state.answers[questionId] = { selectedOption, textAnswer };
    },
    markForReview: (state, action) => {
      const qId = action.payload;
      if (state.answers[qId]) state.answers[qId].isMarkedForReview = !state.answers[qId].isMarkedForReview;
      else state.answers[qId] = { isMarkedForReview: true };
    },
    setQuestion: (state, action) => { state.currentQuestion = action.payload; },
    decrementTimer: (state) => {
      if (state.timeRemaining > 0) state.timeRemaining--;
    },
    toggleFullscreen: (state) => { state.isFullscreen = !state.isFullscreen; },
    endQuiz: (state) => {
      state.activeAttempt = null;
      state.activeQuiz = null;
      state.answers = {};
      state.timeRemaining = null;
      state.status = 'completed';
    }
  }
});

export const { startAttempt, setAnswer, markForReview, setQuestion, decrementTimer, toggleFullscreen, endQuiz } = quizSlice.actions;
export default quizSlice.reducer;
