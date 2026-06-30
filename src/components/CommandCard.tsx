import type { ActiveCommand } from '../lib/protocol';

export function CommandCard({ command }: { command: ActiveCommand }) {
  return (
    <div style={{
      padding: '10px 16px',
      borderRadius: 4,
      background: 'rgba(8,14,20,.9)',
      border: '1px solid color-mix(in srgb, var(--accent), transparent 60%)',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)', animation: 'dotpulse 1.5s ease-in-out infinite' }} />
      <div>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '.14em', color: '#9fe0f6' }}>{command.type.toUpperCase()}</div>
        <div style={{ fontSize: 11, color: '#bfe8fa', marginTop: 2 }}>{command.description}</div>
      </div>
    </div>
  );
}
