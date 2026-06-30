import { useEffect, useLayoutEffect, useState } from 'react';
import { useJarvis } from './useJarvis';
import { Settings } from './components/Settings';
import { CommandCard } from './components/CommandCard';
import { ConfirmDialog } from './components/ConfirmDialog';
import { strings, type Lang, type Strings } from './i18n';
import { DEFAULT_ACCENT, DEFAULT_CUSTOM } from './theme';

const W = 1200;
const H = 800;

export default function App() {
  const [lang, setLang] = useState<Lang>('nb');
  const [accent, setAccent] = useState(DEFAULT_ACCENT);
  const [custom, setCustom] = useState(DEFAULT_CUSTOM);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [pressSignal, setPressSignal] = useState(0);

  const t: Strings = strings[lang];
  const { state, submitText, respondConfirm, dismissError, setServerUrl } = useJarvis({ lang });

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accent);
  }, [accent]);

  useLayoutEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / W, window.innerHeight / H));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  const onActivate = () => {
    setPressSignal((n) => n + 1);
    // In desktop mode, activation triggers thinking state for text input
    // Voice input would be handled differently in Electron
  };

  const statusLabel =
    state.assistantState === 'listening'
      ? t.listening
      : state.assistantState === 'thinking'
        ? t.thinking
        : state.assistantState === 'speaking'
          ? t.speaking
          : state.assistantState === 'command'
            ? t.command
            : t.idle;

  const subline =
    state.assistantState === 'idle'
      ? t.idleHint
      : state.response || state.transcript || '…';

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#05080d', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
      <div
        style={{
          width: W,
          height: H,
          transform: `scale(${scale})`,
          position: 'relative',
          background: '#05080d',
          border: '1px solid #1b2c36',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        {/* Title bar for frameless window */}
        <TitleBar t={t} lang={lang} setLang={setLang} setSettingsOpen={setSettingsOpen} setLogOpen={setLogOpen} />

        {/* Background layers */}
        <Bg />
        <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />

        {/* Center core visualization */}
        <div style={{ position: 'absolute', left: '50%', top: '45%', transform: 'translate(-50%,-50%)', width: 400, height: 400, display: 'grid', placeItems: 'center' }}>
          <CoreOrb
            accent={accent}
            state={state.assistantState}
            pressSignal={pressSignal}
            onActivate={onActivate}
          />
        </div>

        {/* Status + subline */}
        <div style={{ position: 'absolute', left: '50%', top: '74%', transform: 'translateX(-50%)', textAlign: 'center', width: 600 }}>
          <div style={{ fontSize: 14, letterSpacing: '.42em', textTransform: 'uppercase', color: '#9fe0f6', textShadow: '0 0 14px color-mix(in srgb, var(--accent), transparent 55%)' }}>{statusLabel}</div>
          <div style={{ marginTop: 12, fontFamily: "'JetBrains Mono',monospace", fontSize: 12, letterSpacing: '.04em', color: '#5d7d8d', minHeight: 18, padding: '0 20px' }}>{subline}</div>
        </div>

        {/* Command card overlay */}
        {state.command && (
          <div style={{ position: 'absolute', left: '50%', top: '58%', transform: 'translateX(-50%)' }}>
            <CommandCard command={state.command} />
          </div>
        )}

        {/* Input bar */}
        <InputBar placeholder={t.inputPlaceholder} onSubmit={submitText} />

        {/* Edge telemetry */}
        <Telemetry lang={lang} t={t} connected={state.connected} memory={state.memory} serverUrl={state.serverUrl} />

        {/* Connection / error toast */}
        {(state.error || !state.connected) && (
          <div
            onClick={dismissError}
            style={{ position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)', padding: '8px 16px', borderRadius: 3, background: 'rgba(8,14,20,.9)', border: '1px solid color-mix(in srgb, var(--accent), transparent 70%)', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: '.1em', color: '#9fc8d8', cursor: 'pointer' }}
          >
            {state.error === 'mic'
              ? t.micDenied
              : !state.connected
                ? '○ KOBLER TIL …'
                : state.error}
          </div>
        )}

        {/* Log panel */}
        {logOpen && (
          <div onClick={() => setLogOpen(false)} style={{ position: 'absolute', inset: 36, top: 72, background: 'rgba(2,4,8,.6)', zIndex: 50, display: 'flex', justifyContent: 'flex-end', borderRadius: 4 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: 380, height: '100%', background: 'rgba(6,10,16,.97)', borderLeft: '1px solid color-mix(in srgb, var(--accent), transparent 60%)', padding: '24px 20px', display: 'flex', flexDirection: 'column', borderRadius: '0 4px 4px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, letterSpacing: '.22em', color: '#9fe0f6' }}>SAMTALELOGG</div>
                <button onClick={() => setLogOpen(false)} style={{ background: 'none', border: 'none', color: '#5d7d8d', fontSize: 18, cursor: 'pointer' }}>×</button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {state.log.length === 0 && (
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: '#3b5360', textAlign: 'center', marginTop: 40 }}>Ingen samtaler ennå.</div>
                )}
                {state.log.map((entry, i) => (
                  <div key={i} style={{ padding: '8px 10px', borderRadius: 2, background: entry.role === 'user' ? 'rgba(20,40,55,.5)' : 'rgba(10,30,45,.5)', borderLeft: `2px solid ${entry.role === 'user' ? '#5d7d8d' : 'var(--accent)'}` }}>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: '.14em', color: '#3b5360', marginBottom: 3 }}>
                      {entry.role === 'user' ? 'DU' : 'JARVIS'} · {new Date(entry.ts).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: entry.role === 'user' ? '#8fc4d8' : '#bfe8fa', lineHeight: 1.45, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {entry.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings overlay */}
        {settingsOpen && (
          <Settings
            t={t}
            lang={lang}
            accent={accent}
            onAccent={setAccent}
            custom={custom}
            onCustom={setCustom}
            serverUrl={state.serverUrl}
            onServerUrl={setServerUrl}
            connected={state.connected}
            memory={state.memory}
            onClose={() => setSettingsOpen(false)}
          />
        )}

        {/* Confirm dialog */}
        {state.confirm && (
          <ConfirmDialog confirm={state.confirm} t={t} onApprove={() => respondConfirm(true)} onDeny={() => respondConfirm(false)} />
        )}
      </div>
    </div>
  );
}

// ── Title Bar (for frameless Electron window) ─────────────────────────────────
function TitleBar({ t, lang, setLang, setSettingsOpen, setLogOpen }: { t: Strings; lang: Lang; setLang: (l: Lang) => void; setSettingsOpen: (v: boolean) => void; setLogOpen: (v: boolean) => void; }) {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', zIndex: 100, WebkitAppRegion: 'drag' as any }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, WebkitAppRegion: 'no-drag' as any }}>
        <div style={{ width: 7, height: 7, background: 'var(--accent)', transform: 'rotate(45deg)', boxShadow: '0 0 10px var(--accent)' }} />
        <div style={{ fontSize: 13, letterSpacing: '.4em', color: '#d6f3fd', fontWeight: 600, textShadow: '0 0 12px color-mix(in srgb, var(--accent), transparent 50%)' }}>{t.wordmark}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, WebkitAppRegion: 'no-drag' as any }}>
        <button onClick={() => setLogOpen(true)} style={{ background: 'none', border: '1px solid color-mix(in srgb, var(--accent), transparent 70%)', borderRadius: 2, color: '#8fd4ec', fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '.1em', padding: '4px 8px', cursor: 'pointer' }}>
          LOGG
        </button>
        <button onClick={() => setLang(lang === 'nb' ? 'en' : 'nb')} style={{ background: 'none', border: '1px solid color-mix(in srgb, var(--accent), transparent 70%)', borderRadius: 2, color: '#8fd4ec', fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '.1em', padding: '4px 8px', cursor: 'pointer' }}>
          {lang.toUpperCase()}
        </button>
        <button onClick={() => setSettingsOpen(true)} style={{ background: 'none', border: 'none', color: '#8fd4ec', fontSize: 16, cursor: 'pointer', width: 28, height: 28, display: 'grid', placeItems: 'center' }}>
          ⚙
        </button>
        <div style={{ width: 1, height: 16, background: 'color-mix(in srgb, var(--accent), transparent 80%)', margin: '0 4px' }} />
        <button onClick={() => window.electronAPI?.minimizeWindow?.()} style={{ background: 'none', border: 'none', color: '#8fd4ec', fontSize: 12, cursor: 'pointer', width: 24, height: 24, display: 'grid', placeItems: 'center' }}>━</button>
        <button onClick={() => window.electronAPI?.maximizeWindow?.()} style={{ background: 'none', border: 'none', color: '#8fd4ec', fontSize: 12, cursor: 'pointer', width: 24, height: 24, display: 'grid', placeItems: 'center' }}>□</button>
        <button onClick={() => window.electronAPI?.closeWindow?.()} style={{ background: 'none', border: 'none', color: '#ff6b6b', fontSize: 14, cursor: 'pointer', width: 24, height: 24, display: 'grid', placeItems: 'center' }}>×</button>
      </div>
    </div>
  );
}

// ── Core Orb (simplified animated core, keeping the spirit) ──────────────────
function CoreOrb({ accent, state, pressSignal, onActivate }: { accent: string; state: string; pressSignal: number; onActivate: () => void; }) {
  const isActive = state === 'thinking' || state === 'speaking' || state === 'listening';
  return (
    <button
      onClick={onActivate}
      style={{
        position: 'relative',
        width: 200,
        height: 200,
        borderRadius: '50%',
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      {/* Outer ring */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        border: `2px solid ${isActive ? accent : 'rgba(56,224,255,0.15)'}`,
        boxShadow: isActive ? `0 0 40px ${accent}40, inset 0 0 40px ${accent}20` : 'none',
        animation: isActive ? 'spinslow 8s linear infinite' : 'none',
        transition: 'all 0.4s ease',
      }} />
      {/* Inner core */}
      <div style={{
        width: 120,
        height: 120,
        borderRadius: '50%',
        background: `radial-gradient(circle at 40% 40%, ${accent}40, ${accent}15 60%, transparent 100%)`,
        boxShadow: isActive ? `0 0 60px ${accent}, 0 0 120px ${accent}40` : `0 0 20px ${accent}30`,
        animation: isActive ? 'dotpulse 2s ease-in-out infinite' : 'none',
        transition: 'all 0.4s ease',
      }} />
      {/* Center dot */}
      <div style={{
        position: 'absolute',
        width: 16,
        height: 16,
        borderRadius: '50%',
        background: accent,
        boxShadow: `0 0 20px ${accent}, 0 0 40px ${accent}60`,
        animation: isActive ? 'dotpulse 1.5s ease-in-out infinite' : 'none',
      }} />
    </button>
  );
}

// ── Background layers ────────────────────────────────────────────────────────
function Bg() {
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 70% at 50% 47%, #0a121b 0%, #06090f 60%, #03050a 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(color-mix(in srgb, var(--accent), transparent 94%) 1px, transparent 1px),linear-gradient(90deg, color-mix(in srgb, var(--accent), transparent 94%) 1px, transparent 1px)', backgroundSize: '48px 48px', opacity: 0.5 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, color-mix(in srgb, var(--accent), transparent 92%) 0px, color-mix(in srgb, var(--accent), transparent 92%) 1px, transparent 1px, transparent 4px)', pointerEvents: 'none', opacity: 0.3 }} />
      <div style={{ position: 'absolute', left: '50%', top: '47%', width: 500, height: 500, margin: '-250px 0 0 -250px', borderRadius: '50%', border: '1px solid color-mix(in srgb, var(--accent), transparent 92%)' }} />
      <div style={{ position: 'absolute', left: '50%', top: '47%', width: 700, height: 700, margin: '-350px 0 0 -350px', borderRadius: '50%', border: '1px dashed color-mix(in srgb, var(--accent), transparent 94%)', animation: 'spinslow 140s linear infinite' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 54%, rgba(2,4,9,.72) 100%)', pointerEvents: 'none' }} />
    </>
  );
}

function Corner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const c = 'color-mix(in srgb, var(--accent), transparent 45%)';
  const base: React.CSSProperties = { position: 'absolute', width: 24, height: 24 };
  const map: Record<string, React.CSSProperties> = {
    tl: { top: 56, left: 16, borderLeft: `1px solid ${c}`, borderTop: `1px solid ${c}` },
    tr: { top: 56, right: 16, borderRight: `1px solid ${c}`, borderTop: `1px solid ${c}` },
    bl: { bottom: 16, left: 16, borderLeft: `1px solid ${c}`, borderBottom: `1px solid ${c}` },
    br: { bottom: 16, right: 16, borderRight: `1px solid ${c}`, borderBottom: `1px solid ${c}` },
  };
  return <div style={{ ...base, ...map[pos] }} />;
}

// ── Input Bar ──────────────────────────────────────────────────────────────────
function InputBar({ placeholder, onSubmit }: { placeholder: string; onSubmit: (t: string) => void }) {
  const [value, setValue] = useState('');
  const submit = () => {
    if (value.trim()) {
      onSubmit(value.trim());
      setValue('');
    }
  };
  return (
    <div style={{ position: 'absolute', left: '50%', bottom: 36, transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 10, width: 480, height: 42, padding: '0 8px 0 14px', border: '1px solid color-mix(in srgb, var(--accent), transparent 78%)', borderRadius: 3, background: 'rgba(10,18,26,.6)' }}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder={placeholder}
        style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, letterSpacing: '.03em', color: '#cfeaf6' }}
      />
      <button onClick={submit} style={{ width: 28, height: 28, borderRadius: 2, display: 'grid', placeItems: 'center', background: 'color-mix(in srgb, var(--accent), transparent 88%)', border: '1px solid color-mix(in srgb, var(--accent), transparent 72%)', cursor: 'pointer' }}>
        <div style={{ width: 6, height: 6, borderTop: '1.4px solid #8fd4ec', borderRight: '1.4px solid #8fd4ec', transform: 'rotate(45deg)', marginLeft: -2 }} />
      </button>
    </div>
  );
}

// ── Telemetry / Edge info ────────────────────────────────────────────────────
function Telemetry({ lang, t, connected, memory, serverUrl }: { lang: Lang; t: Strings; connected: boolean; memory: boolean; serverUrl: string }) {
  const [clock, setClock] = useState('');
  const [date, setDate] = useState('');
  useEffect(() => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const tick = () => {
      const d = new Date();
      setClock(`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`);
      setDate(d.toLocaleDateString(lang === 'en' ? 'en-GB' : 'nb-NO', { day: '2-digit', month: 'short' }).toUpperCase().replace(/\./g, ''));
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [lang]);

  const mono: React.CSSProperties = { fontFamily: "'JetBrains Mono',monospace" };
  return (
    <>
      <div style={{ position: 'absolute', top: 60, left: 16, ...mono, color: '#5d8090' }}>
        <div style={{ fontSize: 24, letterSpacing: '.05em', color: '#bfe8fa' }}>{clock}</div>
        <div style={{ fontSize: 10, letterSpacing: '.2em', color: '#557383', marginTop: 2 }}>UTC+02 · {date}</div>
      </div>
      <div style={{ position: 'absolute', top: 60, right: 16, textAlign: 'right', ...mono }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: connected ? 'var(--accent)' : '#3b5360', boxShadow: connected ? '0 0 6px var(--accent)' : 'none' }} />
          <span style={{ fontSize: 10, letterSpacing: '.14em', color: connected ? '#9fe0f6' : '#5d7d8d' }}>
            {connected ? t.memoryConnected : t.memoryDisconnected}
          </span>
        </div>
        <div style={{ fontSize: 9, letterSpacing: '.12em', color: '#496573', marginTop: 4, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}>{serverUrl.replace(/^https?:\/\//, '')}</div>
      </div>
      <div style={{ position: 'absolute', bottom: 16, left: 16, ...mono, fontSize: 9, letterSpacing: '.18em', color: '#496573' }}>59.9139°N   10.7522°Ø</div>
      <div style={{ position: 'absolute', bottom: 16, right: 16, ...mono, fontSize: 9, letterSpacing: '.18em', color: '#496573' }}>{t.copyright}</div>
    </>
  );
}
