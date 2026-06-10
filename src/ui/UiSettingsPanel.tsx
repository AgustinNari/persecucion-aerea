import { useState } from "react";

export type UiTheme = "green" | "cyan" | "amber" | "threat" | "blueprint" | "terminal";
export type UiDensity = "compact" | "normal" | "presentation";

export interface UiSettings {
  theme: UiTheme;
  scanlines: boolean;
  glow: boolean;
  reducedMotion: boolean;
  density: UiDensity;
}

interface UiSettingsPanelProps {
  settings: UiSettings;
  onChange: (settings: UiSettings) => void;
  presentationMode: boolean;
  onPresentationModeChange: (enabled: boolean) => void;
}

const themes: { value: UiTheme; label: string }[] = [
  { value: "green", label: "HUD VERDE" },
  { value: "cyan", label: "CIAN RADAR" },
  { value: "amber", label: "ÁMBAR CABINA" },
  { value: "threat", label: "ROJO AMENAZA" },
  { value: "blueprint", label: "BLUEPRINT AZUL" },
  { value: "terminal", label: "TERMINAL TÁCTICA" },
];

export default function UiSettingsPanel({
  settings,
  onChange,
  presentationMode,
  onPresentationModeChange,
}: UiSettingsPanelProps) {
  const [open, setOpen] = useState(false);
  const patch = (next: Partial<UiSettings>) => onChange({ ...settings, ...next });

  return (
    <div className="relative topbar-control">
      <button
        onClick={() => setOpen((value) => !value)}
        className="hud-mini-button"
        aria-expanded={open}
      >
        UI / VISUAL
      </button>

      {open && (
        <div className="ui-settings-popover">
          <div className="tac-label tac-label-hud mb-1">UI / VISUAL</div>
          <p className="text-[8px] text-ash tracking-wide mb-3">Apariencia local de la estación táctica.</p>
          <label>PRESET VISUAL</label>
          <select value={settings.theme} onChange={(event) => patch({ theme: event.target.value as UiTheme })}>
            {themes.map((theme) => <option key={theme.value} value={theme.value}>{theme.label}</option>)}
          </select>

          <div className="mil-divider my-3" />
          <label>DENSIDAD DE WORKSPACE</label>
          <div className="grid grid-cols-3 gap-1">
            {(["compact", "normal", "presentation"] as UiDensity[]).map((density) => (
              <button
                key={density}
                onClick={() => patch({ density })}
                className={`hud-mini-button ${settings.density === density ? "hud-mini-button-active" : ""}`}
              >
                {density === "compact" ? "COMPACTA" : density === "normal" ? "NORMAL" : "PRESENT."}
              </button>
            ))}
          </div>

          <div className="mil-divider my-3" />
          <label>EFECTOS Y PRESENTACIÓN</label>
          <div className="space-y-1">
            <Toggle label="SCANLINES" enabled={settings.scanlines} onChange={(scanlines) => patch({ scanlines })} />
            <Toggle label="EFECTOS / GLOW" enabled={settings.glow} onChange={(glow) => patch({ glow })} />
            <Toggle label="ANIMACIÓN REDUCIDA" enabled={settings.reducedMotion} onChange={(reducedMotion) => patch({ reducedMotion })} />
            <Toggle label="MODO PRESENTACIÓN" enabled={presentationMode} onChange={onPresentationModeChange} />
          </div>
        </div>
      )}
    </div>
  );
}

function Toggle({ label, enabled, onChange }: { label: string; enabled: boolean; onChange: (enabled: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className="w-full flex items-center justify-between border border-slate-steel px-2 py-1 text-[8px] tracking-[0.12em] text-mist hover:text-hud"
      aria-pressed={enabled}
    >
      {label}
      <span className={enabled ? "text-hud" : "text-ash"}>{enabled ? "ON" : "OFF"}</span>
    </button>
  );
}
