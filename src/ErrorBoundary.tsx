import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  declare state: State;
  declare props: Props & { children: React.ReactNode };

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[Blueprint AI] Uncaught render error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            background: '#0A0E17',
            color: '#F8FAFC',
            fontFamily: 'system-ui, sans-serif',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
          }}
        >
          {/* Blueprint grid background */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              pointerEvents: 'none',
              opacity: 0.15,
              backgroundImage: 'radial-gradient(#1E293B 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <div
            style={{
              maxWidth: '480px',
              width: '100%',
              background: '#111827',
              border: '1px solid #1E293B',
              borderRadius: '16px',
              padding: '2.5rem',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
              textAlign: 'center',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* Logo mark */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '2rem',
              }}
            >
              <div
                style={{
                  background: '#3B82F6',
                  padding: '8px',
                  borderRadius: '8px',
                  boxShadow: '0 0 15px rgba(59,130,246,0.5)',
                  display: 'flex',
                }}
              >
                {/* Inline blueprint icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
              </div>
              <span style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
                BLUEPRINT<span style={{ color: '#3B82F6' }}>AI</span>
              </span>
            </div>

            {/* Error icon */}
            <div
              style={{
                width: '64px',
                height: '64px',
                background: '#7F1D1D20',
                border: '1px solid #DC262640',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FCA5A5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <h1
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: '#FCA5A5',
                marginBottom: '0.75rem',
              }}
            >
              Application Error
            </h1>

            <p
              style={{
                fontSize: '0.8rem',
                color: '#94A3B8',
                lineHeight: 1.6,
                marginBottom: '0.5rem',
              }}
            >
              An unexpected error occurred. Your work may be recoverable by reloading.
            </p>

            {this.state.error?.message && (
              <div
                style={{
                  background: '#0A0E17',
                  border: '1px solid #1E293B',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  marginBottom: '1.5rem',
                  textAlign: 'left',
                }}
              >
                <p
                  style={{
                    fontSize: '0.7rem',
                    fontFamily: 'monospace',
                    color: '#64748B',
                    wordBreak: 'break-word',
                    margin: 0,
                  }}
                >
                  {this.state.error.message}
                </p>
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#3B82F6',
                color: '#fff',
                border: '1px solid rgba(96,165,250,0.3)',
                borderRadius: '8px',
                padding: '0.75rem 2rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(59,130,246,0.4)',
                transition: 'background 0.2s',
                width: '100%',
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = '#2563EB')}
              onMouseOut={(e) => (e.currentTarget.style.background = '#3B82F6')}
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
