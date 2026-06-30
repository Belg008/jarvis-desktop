import { useEffect, useState } from 'react';
import { ACCENT_PRESETS } from '../theme';
import type { Strings, Lang } from '../i18n';

interface Props {
  t: Strings;
  lang: Lang;
  accent: string;
  onAccent: (hex: string) => void;
  custom: string;
  onCustom: (hex: string) => void;
  serverUrl: string;
  onServerUrl: (url: string) => void;
  connected: boolean;
  memory: boolean;
  onClose: () => void;
}

const cardStyle: React.CSSProperties = {
  border: '1px solid color-mix(in srgb, var(--accent), transparent 85%)',
  borderRadius: 4,
  background: 'rgba(9,16,23,.5)',
  padding: 20,
};

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      style={{
        position: 'relative',
        width: 40,
        height: 20,
        borderRadius: 10,
        border: 'none',
        padding: 0,
        background: on ? 'color-mix(in srgb, var(--accent), transparent 55%)' : 'rgba(40,55,64,.6)',
        boxShadow: on ? '0 0 10px color-mix(in srgb, var(--accent), transparent 70%)' : 'none',
        transition: 'background .2s',
        cursor: 'pointer',
      }}
    >
      <span style={{
        position: 'absolute',
        top: 2.5,
        left: on ? 21 : 2.5,
        width: 15,
        height: 15,
        borderRadius: '50%',
        background: '#eafaff',
        boxShadow: on ? '0 0 8px var(--accent)' : 'none',
        transition: 'left .2s',
      }} />
    </button>
  );
}

function CardHead({ title }: { title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <div style={{ width: 5, height: 5, background: 'var(--accent)', transform: 'rotate(45deg)', boxShadow: '0 0 8px var(--accent)' }} />
      <div style={{ fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase', color: '#bfe8fa', fontWeight: 600 }}>{title}</div>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,color-mix(in srgb, var(--accent), transparent 78%),transparent)' }} />
    </div>
  );
}

function Row({ text, children, hint }: { text: string; children: React.ReactNode; hint?: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: '#cfeaf6', letterSpacing: '.02em' }}>{text}</span>
        {children}
      </div>
      {hint && <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#5d7d8d', marginTop: 4, display: 'block' }}>{hint}</span>}
    </div>
  );
}

const label: React.CSSProperties = {
  fontFamily: "'JetBrains Mono',monospace",
  fontSize: 9,
  letterSpacing: '.16em',
  color: '#6b8c9c',
};

const inputStyle: React.CSSProperties = {
  height: 34,
  padding: '0 12px',
  border: '1px solid color-mix(in srgb, var(--accent), transparent 78%)',
  borderRadius: 3,
  background: 'rgba(8,14,20,.6)',
  color: '#cfeaf6',
  fontSize: 12,
  fontFamily: "'JetBrains Mono',monospace",
  width: '100%',
  outline: 'none',
};

const btnStyle: React.CSSProperties = {
  height: 32,
  padding: '0 14px',
  border: '1px solid color-mix(in srgb, var(--accent), transparent 60%)',
  borderRadius: 3,
  background: 'color-mix(in srgb, var(--accent), transparent 90%)',
  color: '#bfe8fa',
  fontSize: 11,
  fontFamily: "'JetBrains Mono',monospace",
  letterSpacing: '.1em',
  cursor: 'pointer',
  transition: 'all .15s',
};

export function Settings(props: Props) {
  const { t, serverUrl, onServerUrl, connected, memory, onClose } = props;
  const [urlInput, setUrlInput] = useState(serverUrl);
  const [autoStart, setAutoStart] = useState(false);
  const [minTray, setMinTray] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [hotkey, setHotkey] = useState('Ctrl+Shift+J');
  const [version] = useState('1.0.0');

  useEffect(() => {
    setUrlInput(serverUrl);
  }, [serverUrl]);

  const applyServerUrl = () => {
    const url = urlInput.trim();
    if (url && url !== serverUrl) {
      onServerUrl(url);
    }
  };

  const testConnection = () => {
    applyServerUrl();
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 40,
        background: 'radial-gradient(ellipse 90% 90% at 50% 24%, #0a121b 0%, #06090f 66%, #03050a 100%)',
        animation: 'fadein .2s ease',
        overflow: 'auto',
      }}
      className="no-scrollbar"
    >
      {/* Header */}
      <div
        style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          borderBottom: '1px solid color-mix(in srgb, var(--accent), transparent 88%)',
          WebkitAppRegion: 'drag' as any,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, WebkitAppRegion: 'no-drag' as any }}>
          <div style={{ width: 7, height: 7, background: 'var(--accent)', transform: 'rotate(45deg)', boxShadow: '0 0 12px var(--accent)', alignSelf: 'center' }} />
          <div style={{ fontSize: 16, letterSpacing: '.4em', textTransform: 'uppercase', color: '#d6f3fd', fontWeight: 600 }}>{t.settings}</div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '.16em', color: '#557383' }}>{t.settingsSub}</div>
        </div>
        <button
          onClick={onClose}
          style={{ position: 'relative', width: 30, height: 30, border: '1px solid color-mix(in srgb, var(--accent), transparent 60%)', borderRadius: '50%', background: 'transparent', display: 'grid', placeItems: 'center', cursor: 'pointer', WebkitAppRegion: 'no-drag' as any }}
          aria-label="Lukk"
        >
          <div style={{ position: 'absolute', width: 12, height: 1.4, background: '#8fd4ec', transform: 'rotate(45deg)' }} />
          <div style={{ position: 'absolute', width: 12, height: 1.4, background: '#8fd4ec', transform: 'rotate(-45deg)' }} />
        </button>
      </div>

      {/* Grid */}
      <div
        style={{
          padding: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 16,
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        {/* SERVER */}
        <div style={cardStyle}>
          <CardHead title={t.secServer} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
            <span style={label}>{t.serverUrl}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyServerUrl()}
                placeholder="https://jarvis.sindbelg.me"
                style={inputStyle}
              />
              <button onClick={testConnection} style={btnStyle}>
                {connected ? 'OK' : t.connect}
              </button>
            </div>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: connected ? '#4ade80' : '#5d7d8d' }}>
              {connected ? `${t.serverConnect} ${serverUrl}` : t.serverDisconnected}
            </span>
          </div>
          <Row text={t.minimizeTray}>
            <Toggle on={minTray} onClick={() => setMinTray(!minTray)} />
          </Row>
          <Row text={t.autoStart}>
            <Toggle on={autoStart} onClick={() => setAutoStart(!autoStart)} />
          </Row>
        </div>

        {/* TEMA */}
        <div style={cardStyle}>
          <CardHead title={t.secTheme} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
            {ACCENT_PRESETS.map((p) => {
              const active = props.accent.toLowerCase() === p.hex.toLowerCase();
              return (
                <button
                  key={p.key}
                  onClick={() => props.onAccent(p.hex)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    border: active ? `2px solid ${p.hex}` : '2px solid rgba(60,80,92,.5)',
                    boxShadow: active ? `0 0 10px ${p.hex}aa` : 'none',
                    background: active ? `${p.hex}22` : 'transparent',
                    display: 'grid',
                    placeItems: 'center',
                  }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: p.hex }} />
                  </div>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8.5, letterSpacing: '.12em', color: active ? '#9fe0f6' : '#7d97a4' }}>{p.label}</span>
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={label}>{t.customColor}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="color"
                value={props.custom}
                onChange={(e) => {
                  props.onCustom(e.target.value);
                  props.onAccent(e.target.value);
                }}
                style={{ width: 36, height: 30, border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}
              />
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: 30,
                padding: '0 10px',
                border: '1px solid color-mix(in srgb, var(--accent), transparent 78%)',
                borderRadius: 3,
                background: 'rgba(8,14,20,.6)',
              }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: '.1em', color: '#cfeaf6' }}>
                  {props.accent.toUpperCase()}
                </span>
                <div style={{ width: 14, height: 14, borderRadius: 3, background: 'var(--accent)', boxShadow: '0 0 6px var(--accent)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* MODELL & FART */}
        <div style={cardStyle}>
          <CardHead title={t.secModel} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 12 }}>
            <span style={label}>{t.agentModel}</span>
            <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 6px var(--accent)' }} />
              <span>OpenCode · go</span>
            </div>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#5d7d8d' }}>{t.modelNote}</span>
          </div>
          <Row text={t.lowLatency}>
            <Toggle on={true} onClick={() => {}} />
          </Row>
          <Row text={t.notifications}>
            <Toggle on={notifications} onClick={() => setNotifications(!notifications)} />
          </Row>
        </div>

        {/* VEKKEORD */}
        <div style={cardStyle}>
          <CardHead title={t.secWake} />
          <Row text={t.wakeOn}>
            <Toggle on={false} onClick={() => {}} />
          </Row>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            <span style={label}>{t.wakePhrase}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 36, padding: '0 12px', border: '1px solid color-mix(in srgb, var(--accent), transparent 70%)', borderRadius: 3, background: 'rgba(8,14,20,.6)' }}>
              <div style={{ width: 0, height: 0, borderLeft: '6px solid var(--accent)', borderTop: '4px solid transparent', borderBottom: '4px solid transparent' }} />
              <span style={{ fontSize: 13, color: '#dff4fb', letterSpacing: '.04em' }}>«Hey JARVIS»</span>
            </div>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#5d7d8d' }}>{t.wakeNote}</span>
          </div>
        </div>

        {/* SMARTHjem */}
        <div style={cardStyle}>
          <CardHead title={t.secSmartHome} />
          <Row text={t.integrationsOn}>
            <Toggle on={true} onClick={() => {}} />
          </Row>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <DeviceRow name="Google Home" connected={true} t={t} />
            <DeviceRow name="Home Assistant" connected={false} t={t} />
            <DeviceRow name="Philips Hue" connected={memory} t={t} />
          </div>
        </div>

        {/* AVANSERT / INFO */}
        <div style={cardStyle}>
          <CardHead title={t.secAdvanced} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Row text={t.hotkey} hint={t.hotkeyHint}>
              <input
                type="text"
                value={hotkey}
                onChange={(e) => setHotkey(e.target.value)}
                style={{ ...inputStyle, width: 120, textAlign: 'center' }}
              />
            </Row>
            <div style={{ marginTop: 8, padding: '10px', border: '1px solid color-mix(in srgb, var(--accent), transparent 88%)', borderRadius: 3, background: 'rgba(4,8,12,.4)' }}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: '.14em', color: '#557383', marginBottom: 6 }}>{t.buildInfo}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#6b8c9c' }}>{t.version}</span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#9fe0f6' }}>v{version}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#6b8c9c' }}>BUILD</span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#9fe0f6' }}>2026.06.30</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#6b8c9c' }}>CHANNEL</span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#9fe0f6' }}>stable</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeviceRow({ name, connected, t }: { name: string; connected: boolean; t: Strings }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 36,
        padding: '0 12px',
        border: '1px solid color-mix(in srgb, var(--accent), transparent 86%)',
        borderRadius: 3,
        background: 'rgba(8,14,20,.4)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: connected ? 'var(--accent)' : '#3b5360', boxShadow: connected ? '0 0 6px var(--accent)' : 'none' }} />
        <span style={{ fontSize: 12, color: connected ? '#cfeaf6' : '#83a1b0' }}>{name}</span>
      </div>
      {connected ? (
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: '.12em', color: '#4ade80' }}>{t.connected}</span>
      ) : (
        <button style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: '.1em', color: '#bfe8fa', border: '1px solid color-mix(in srgb, var(--accent), transparent 60%)', borderRadius: 2, padding: '3px 8px', background: 'transparent', cursor: 'pointer' }}>
          {t.connect}
        </button>
      )}
    </div>
  );
}
