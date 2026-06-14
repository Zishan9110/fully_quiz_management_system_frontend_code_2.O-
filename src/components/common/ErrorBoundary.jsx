import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('ErrorBoundary caught:', error, info); }
  render() {
    if (this.state.hasError) return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="text-6xl">⚠️</div>
        <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Something went wrong</h2>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{this.state.error?.message}</p>
        <button className="btn-primary" onClick={() => window.location.reload()}>Reload Page</button>
      </div>
    );
    return this.props.children;
  }
}
