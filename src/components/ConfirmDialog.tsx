import type { ConfirmRequest } from '../useJarvis';
import type { Strings } from '../i18n';

export function ConfirmDialog({ confirm, t, onApprove, onDeny }: {
  confirm: ConfirmRequest;
  t: Strings;
  onApprove: () => void;
  onDeny: () => void;
}) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'rgba(2,4,8,.75)',
      zIndex: 60,
      display: 'grid',
      placeItems: 'center',
      animation: 'fadein .2s ease',
    }}>
      <div style={{
        width: 420,
        padding: '28px 24px',
        borderRadius: 6,
        background: 'rgba(8,14,20,.97)',
        border: '1px solid color-mix(in srgb, var(--accent), transparent 60%)',
        boxShadow: '0 0 40px rgba(0,0,0,.5)',
      }}>
        <div style={{
          fontFamily: "'JetBrains Mono',monospace",
          fontSize: 12,
          letterSpacing: '.22em',
          color: '#9fe0f6',
          marginBottom: 12,
        }}>{t.confirmTitle}</div>
        <div style={{ fontSize: 12, color: '#bfe8fa', lineHeight: 1.5, marginBottom: 16 }}>
          {t.confirmBody}
        </div>
        <div style={{
          padding: '12px 14px',
          borderRadius: 3,
          background: 'rgba(4,8,12,.6)',
          border: '1px solid color-mix(in srgb, var(--accent), transparent 70%)',
          marginBottom: 20,
          fontFamily: "'JetBrains Mono',monospace",
          fontSize: 11,
          color: '#8fc4d8',
          lineHeight: 1.5,
        }}>
          <div style={{ color: '#9fe0f6', marginBottom: 6, letterSpacing: '.1em' }}>{confirm.command.toUpperCase()}</div>
          {confirm.description}
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            onClick={onDeny}
            style={{
              padding: '8px 18px',
              borderRadius: 3,
              border: '1px solid color-mix(in srgb, var(--accent), transparent 60%)',
              background: 'transparent',
              color: '#8fd4ec',
              fontSize: 12,
              fontFamily: "'JetBrains Mono',monospace",
              letterSpacing: '.1em',
              cursor: 'pointer',
            }}
          >
            {t.deny}
          </button>
          <button
            onClick={onApprove}
            style={{
              padding: '8px 18px',
              borderRadius: 3,
              border: 'none',
              background: 'color-mix(in srgb, var(--accent), transparent 40%)',
              color: '#05080d',
              fontSize: 12,
              fontFamily: "'JetBrains Mono',monospace",
              fontWeight: 600,
              letterSpacing: '.1em',
              cursor: 'pointer',
              boxShadow: '0 0 12px color-mix(in srgb, var(--accent), transparent 60%)',
            }}
          >
            {t.approve}
          </button>
        </div>
      </div>
    </div>
  );
}
