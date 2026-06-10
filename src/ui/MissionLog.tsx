import { useEffect, useState } from "react";

export interface MissionEvent {
  id: number;
  time: string;
  message: string;
  tone?: "info" | "success" | "warning";
}

interface MissionLogProps {
  events: MissionEvent[];
  onClear: () => void;
  toggleSignal?: number;
  closeSignal?: number;
  onToggle?: (open: boolean) => void;
}

export default function MissionLog({ events, onClear, toggleSignal = 0, closeSignal = 0, onToggle }: MissionLogProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (toggleSignal === 0) return;
    setOpen((value) => {
      onToggle?.(!value);
      return !value;
    });
  }, [onToggle, toggleSignal]);

  useEffect(() => {
    if (closeSignal === 0) return;
    setOpen(false);
  }, [closeSignal]);

  const toggle = () => {
    setOpen((value) => {
      onToggle?.(!value);
      return !value;
    });
  };

  return (
    <aside className={`mission-log ${open ? "mission-log-open" : ""}`}>
      <div className="mission-log-header">
        <button onClick={toggle} className="hud-mini-button" aria-expanded={open} aria-label="Abrir o cerrar bitácora">
          BITÁCORA · {events.length}
        </button>
        {open && <button onClick={onClear} className="hud-icon-button">LIMPIAR</button>}
      </div>
      {open && (
        <div className="mission-log-events" aria-live="polite">
          {events.length === 0 && <div className="text-ash">Sin eventos registrados.</div>}
          {events.map((event) => (
            <div key={event.id} className={`mission-log-event mission-log-${event.tone ?? "info"}`}>
              <span>{event.time}</span>
              <strong>&gt; {event.message}</strong>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
