import { useMemo, useState } from "react";
import type { SimulationResult } from "../shared/types";
import GraphPlaceholder from "./GraphPlaceholder";

type DisplayId = "grid" | "trajectory" | "distance";
type LayoutPreset = "balanced" | "threeLarge" | "distanceLarge";

interface GraphWorkspaceProps {
  result: SimulationResult;
  currentFrame: number;
}

const displayInfo: Record<DisplayId, {
  code: string;
  title: string;
  name: string;
  description: string;
  accent: "amber" | "cyan" | "hud";
  panelClass: string;
  dotClass: string;
}> = {
  grid: {
    code: "DISPLAY 01",
    title: "CENITAL 2D",
    name: "GridView2D",
    description: "Vista cenital | Grilla táctica",
    accent: "amber",
    panelClass: "mil-panel-amber",
    dotClass: "bg-amber-glow",
  },
  trajectory: {
    code: "DISPLAY 02",
    title: "TRAYECTORIA 3D",
    name: "Trajectory3D",
    description: "Espacio de misión | Three.js",
    accent: "cyan",
    panelClass: "mil-panel-cyan",
    dotClass: "bg-cyan-glow",
  },
  distance: {
    code: "DISPLAY 03",
    title: "RANGO vs TIEMPO",
    name: "DistancePlot",
    description: "Distancia R(t) | Análisis de intercepción",
    accent: "hud",
    panelClass: "",
    dotClass: "bg-hud",
  },
};

export default function GraphWorkspace({ result, currentFrame }: GraphWorkspaceProps) {
  const [order, setOrder] = useState<DisplayId[]>(["grid", "trajectory", "distance"]);
  const [visible, setVisible] = useState<Record<DisplayId, boolean>>({ grid: true, trajectory: true, distance: true });
  const [focused, setFocused] = useState<DisplayId | null>(null);
  const [layout, setLayout] = useState<LayoutPreset>("balanced");
  const [showInspector, setShowInspector] = useState(false);

  const visibleDisplays = order.filter((id) => visible[id]);
  const primaryLengths = [
    result.time.length,
    result.aircraft.position.length,
    result.aircraft.velocity.length,
    result.missile.position.length,
    result.missile.velocity.length,
    result.distance.length,
    result.closingVelocity.length,
    result.losAngle.length,
  ];
  const arraysAligned = primaryLengths.every((length) => length === result.time.length);

  const workspaceClass = useMemo(() => {
    if (focused || visibleDisplays.length === 1) return "grid-cols-1 grid-rows-1";
    if (visibleDisplays.length === 2) return "grid-cols-2 grid-rows-1";
    if (layout === "threeLarge") return "grid-cols-[2fr_1fr] grid-rows-2";
    if (layout === "distanceLarge") return "grid-cols-2 grid-rows-[0.75fr_1.25fr]";
    return "grid-cols-2 grid-rows-[1fr_0.8fr]";
  }, [focused, layout, visibleDisplays.length]);

  const toggleVisible = (id: DisplayId) => {
    if (visible[id] && visibleDisplays.length === 1) return;
    setVisible((current) => ({ ...current, [id]: !current[id] }));
    if (focused === id) setFocused(null);
  };

  const move = (id: DisplayId, direction: -1 | 1) => {
    setOrder((current) => {
      const from = current.indexOf(id);
      const to = Math.min(Math.max(0, from + direction), current.length - 1);
      if (from === to) return current;
      const next = [...current];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  };

  return (
    <div className="flex-1 min-w-0 flex flex-col overflow-hidden tactical-grid">
      <div className="workspace-toolbar">
        <span className="tac-label tac-label-hud">GRAPH WORKSPACE</span>
        <div className="flex items-center gap-1">
          {order.map((id) => (
            <button
              key={id}
              onClick={() => toggleVisible(id)}
              className={`hud-mini-button ${visible[id] ? "hud-mini-button-active" : ""}`}
              title={visible[id] && visibleDisplays.length === 1 ? "Debe quedar al menos un display visible" : undefined}
            >
              {displayInfo[id].code.replace("DISPLAY ", "D")}
            </button>
          ))}
        </div>
        <span className="h-3 w-px bg-slate-steel" />
        {(["balanced", "threeLarge", "distanceLarge"] as LayoutPreset[]).map((preset) => (
          <button
            key={preset}
            onClick={() => {
              setFocused(null);
              setLayout(preset);
            }}
            className={`hud-mini-button ${layout === preset && !focused ? "hud-mini-button-active" : ""}`}
          >
            {preset === "balanced" ? "BALANCE" : preset === "threeLarge" ? "3D LARGE" : "RANGE LARGE"}
          </button>
        ))}
        <button onClick={() => setShowInspector((value) => !value)} className={`hud-mini-button ml-auto ${showInspector ? "hud-mini-button-active" : ""}`}>
          RESULT INSPECTOR
        </button>
      </div>

      {showInspector && (
        <div className="result-inspector">
          <InspectorCell label="FUENTE" value="MOCK" />
          <InspectorCell label="FRAMES" value={String(result.time.length)} />
          <InspectorCell label="FRAME ACTUAL" value={String(currentFrame)} />
          <InspectorCell label="TIEMPO TOTAL" value={`${(result.time.at(-1) ?? 0).toFixed(2)}s`} />
          <InspectorCell label="INTEGRADOR" value={result.metadata.integrator.toUpperCase()} />
          <InspectorCell label="ARRAYS" value={arraysAligned ? "ALINEADOS" : "REVISAR"} warning={!arraysAligned} />
          <InspectorCell label="R MIN" value={`${result.outcome.minDistance.toFixed(1)}m`} />
          <InspectorCell label="INTERCEPCIÓN" value={result.outcome.intercepted ? "SÍ" : "NO"} />
        </div>
      )}

      <div className={`flex-1 min-h-0 p-3 grid gap-2 overflow-hidden ${workspaceClass}`}>
        {visibleDisplays.map((id) => {
          if (focused && focused !== id) return null;
          const info = displayInfo[id];
          const spanClass = getSpanClass(id, visibleDisplays.length, layout, focused);

          return (
            <section key={id} className={`mil-panel ${info.panelClass} p-0 flex flex-col min-h-0 relative ${spanClass}`}>
              <div className="mil-corners flex flex-col min-h-0 h-full">
                <div className="display-toolbar">
                  <div className={`w-1.5 h-1.5 pulse-dot ${info.dotClass}`} />
                  <span className="tac-label">{info.code}</span>
                  <span className="text-[8px] text-mist tracking-widest">{info.title}</span>
                  <div className="ml-auto flex gap-1">
                    <button onClick={() => move(id, -1)} className="hud-icon-button" title="Mover antes">◂</button>
                    <button onClick={() => move(id, 1)} className="hud-icon-button" title="Mover después">▸</button>
                    <button onClick={() => setFocused(focused === id ? null : id)} className="hud-icon-button" title={focused === id ? "Restaurar" : "Enfocar"}>
                      {focused === id ? "RESTORE" : "FOCUS"}
                    </button>
                    <button onClick={() => toggleVisible(id)} className="hud-icon-button" title="Ocultar">HIDE</button>
                  </div>
                </div>
                <div className="flex-1 min-h-0 p-2 graph-container">
                  {/*Reemplazar este placeholder con el componente real del gráfico cuando los Grupos 4/5 lo tengan listo.*/}
                  <GraphPlaceholder
                    name={info.name}
                    description={info.description}
                    accent={info.accent}
                    result={result}
                    currentFrame={currentFrame}
                  />
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function getSpanClass(id: DisplayId, visibleCount: number, layout: LayoutPreset, focused: DisplayId | null) {
  if (focused || visibleCount < 3) return "";
  if (layout === "balanced" && id === "distance") return "col-span-2";
  if (layout === "threeLarge" && id === "trajectory") return "row-span-2";
  if (layout === "distanceLarge" && id === "distance") return "col-span-2";
  return "";
}

function InspectorCell({ label, value, warning = false }: { label: string; value: string; warning?: boolean }) {
  return (
    <div>
      <span className="text-ash">{label}: </span>
      <span className={warning ? "text-danger" : "text-hud"}>{value}</span>
    </div>
  );
}
