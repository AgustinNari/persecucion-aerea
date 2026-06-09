/**
 * Grupo 3 — UI / orquestador.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SimulationConfig, SimulationResult } from "../shared/types";
import { mockResult, mockConfig } from "../shared/mockResult";
import Controls from "./Controls";
import PlaybackBar from "./PlaybackBar";
import StatusPanel from "./StatusPanel";
import GraphPlaceholder from "./GraphPlaceholder";

type TabId = "simulation" | "theory";

const tabContentVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("simulation");
  const [config, setConfig] = useState<SimulationConfig>(mockConfig);
  const [result, setResult] = useState<SimulationResult>(mockResult);

  const [currentFrame, setCurrentFrame] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const totalFrames = result.metadata.steps;

  const currentTime = result.time[currentFrame] ?? 0;
  const currentDistance = result.distance[currentFrame] ?? 0;
  const closingVel = result.closingVelocity[currentFrame] ?? 0;
  return (
    <div className="min-h-screen bg-void flex flex-col scanlines relative">
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between px-4 py-2 border-b border-panel-border bg-obsidian/95 z-50"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 border border-hud/40 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-hud/5" />
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" stroke="currentColor" strokeWidth="1" className="text-hud" />
              <circle cx="7" cy="7" r="1.5" fill="currentColor" className="text-hud" />
              <line x1="7" y1="3" x2="7" y2="5.5" stroke="currentColor" strokeWidth="0.5" className="text-hud/50" />
              <line x1="7" y1="8.5" x2="7" y2="11" stroke="currentColor" strokeWidth="0.5" className="text-hud/50" />
              <line x1="3.5" y1="7" x2="5.5" y2="7" stroke="currentColor" strokeWidth="0.5" className="text-hud/50" />
              <line x1="8.5" y1="7" x2="10.5" y2="7" stroke="currentColor" strokeWidth="0.5" className="text-hud/50" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[11px] font-bold tracking-[0.2em] text-hud leading-none text-glow-hud">
                TACCON-SIM
              </h1>
              <span className="text-[8px] text-mist tracking-[0.15em] border border-slate-steel px-1.5 py-0.5">
                v1.0
              </span>
            </div>
            <p className="text-[8px] text-ash tracking-[0.25em] mt-0.5">
              SISTEMA DE SIMULACIÓN TÁCTICO | PERSECUCIÓN AÉREA
            </p>
          </div>
        </div>

        <nav className="flex gap-px">
          {([
            { id: "simulation" as TabId, label: "SIMULACIÓN TÁCTICA", code: "TAC-01" },
            { id: "theory" as TabId, label: "ANÁLISIS TEÓRICO", code: "THR-02" },
          ]).map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-5 py-1.5 text-[10px] font-bold tracking-[0.15em] transition-all cursor-pointer border ${activeTab === tab.id
                ? "bg-hud/10 text-hud border-hud/30"
                : "bg-transparent text-ash border-slate-steel hover:text-mist hover:border-mist/30"
                }`}
              whileHover={{ y: -1 }}
              whileTap={{ y: 0 }}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-x-0 top-0 h-[2px] bg-hud"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                />
              )}
              <span className="text-[7px] text-mist mr-2">[{tab.code}]</span>
              {tab.label}
            </motion.button>
          ))}
        </nav>

        <StatusPanel
          currentTime={currentTime}
          currentDistance={currentDistance}
          closingVelocity={closingVel}
          outcome={result.outcome}
          playing={false}
        />
      </motion.header>

      <main className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === "simulation" ? (
            <motion.div
              key="simulation"
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="flex-1 flex overflow-hidden">
                <AnimatePresence>
                  {showControls && (
                    <motion.aside
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 310, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="border-r border-panel-border bg-obsidian/60 overflow-y-auto overflow-x-hidden flex-shrink-0"
                    >
                      <Controls
                        config={config}
                        onConfigChange={setConfig}
                        onSimulate={() => { }}
                      />
                    </motion.aside>
                  )}
                </AnimatePresence>

                <motion.button
                  onClick={() => setShowControls((v) => !v)}
                  className="self-start mt-3 px-0.5 py-4 bg-obsidian border border-panel-border border-l-0 text-mist hover:text-hud transition-colors cursor-pointer z-10"
                  whileHover={{ x: 2 }}
                  title={showControls ? "OCULTAR PANEL" : "MOSTRAR PANEL"}
                >
                  <motion.span
                    animate={{ rotate: showControls ? 0 : 180 }}
                    transition={{ duration: 0.2 }}
                    className="block text-[9px]"
                  >
                    ◂
                  </motion.span>
                </motion.button>

                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="flex-1 p-3 grid grid-cols-2 grid-rows-[1fr_0.8fr] gap-2 overflow-hidden tactical-grid"
                >
                  <motion.div variants={fadeInUp} className="mil-panel mil-panel-amber p-0 flex flex-col min-h-0 relative">
                    <div className="mil-corners">
                      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-amber-glow/10">
                        <div className="w-1.5 h-1.5 bg-amber-glow pulse-dot" />
                        <span className="tac-label">DISPLAY 01</span>
                        <span className="text-[8px] text-amber-glow/60 ml-auto tracking-widest">CENITAL 2D</span>
                      </div>
                      <div className="flex-1 p-2 graph-container">
                        <GraphPlaceholder
                          name="GridView2D"
                          description="Vista cenital | Grilla táctica"
                          accent="amber"
                          result={result}
                          currentFrame={currentFrame}
                        />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="mil-panel mil-panel-cyan p-0 flex flex-col min-h-0 relative">
                    <div className="mil-corners">
                      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-cyan-glow/10">
                        <div className="w-1.5 h-1.5 bg-cyan-glow pulse-dot" />
                        <span className="tac-label">DISPLAY 02</span>
                        <span className="text-[8px] text-cyan-glow/60 ml-auto tracking-widest">TRAYECTORIA 3D</span>
                      </div>
                      <div className="flex-1 p-2 graph-container">
                        <GraphPlaceholder
                          name="Trajectory3D"
                          description="Espacio de misión | Three.js"
                          accent="cyan"
                          result={result}
                          currentFrame={currentFrame}
                        />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    variants={fadeInUp}
                    className="mil-panel p-0 flex flex-col col-span-2 min-h-0 relative"
                  >
                    <div className="mil-corners">
                      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-hud/10">
                        <div className="w-1.5 h-1.5 bg-hud pulse-dot" />
                        <span className="tac-label">DISPLAY 03</span>
                        <span className="text-[8px] text-hud/60 ml-auto tracking-widest">RANGO vs TIEMPO</span>
                      </div>
                      <div className="flex-1 p-2 graph-container">
                        <GraphPlaceholder
                          name="DistancePlot"
                          description="Distancia R(t) | Análisis de intercepción"
                          accent="hud"
                          result={result}
                          currentFrame={currentFrame}
                        />
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>

              <PlaybackBar
                currentFrame={currentFrame}
                totalFrames={totalFrames}
                currentTime={currentTime}
                totalTime={result.time[totalFrames - 1] ?? 0}
                playing={false}
                speed={1}
                speedPresets={[0.25, 0.5, 1, 2, 4]}
                onPlay={() => { }}
                onPause={() => { }}
                onSeek={(frame) => setCurrentFrame(frame)}
                onRestart={() => { }}
                onSpeedChange={() => { }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="theory"
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="flex-1 overflow-y-auto p-6 tactical-grid"
            >
              <div className="max-w-4xl mx-auto">
                <div className="mil-panel p-6">
                  <div className="mil-corners">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1.5 h-1.5 bg-hud" />
                      <span className="tac-label tac-label-hud">ANÁLISIS TEÓRICO</span>
                      <span className="text-[8px] text-mist ml-2">[THR-02]</span>
                    </div>
                    <div className="mil-divider mb-4" />
                    <p className="text-mist text-[11px] leading-relaxed tracking-wide">
                      MÓDULO RESERVADO PARA EL GRUPO 6.
                      CONTENIDO: ECUACIONES DE MOVIMIENTO, LEYES DE GUIADO,
                      CLASIFICACIÓN DEL SISTEMA (LINEAL / NO LINEAL / HOMOGÉNEO),
                      ANÁLISIS DE ESTABILIDAD VÍA AUTOVALORES.
                    </p>
                    <div className="mt-6 p-4 border border-dashed border-slate-steel text-center">
                      <code className="text-hud/50 text-[11px]">{"<TheoryTab />"}</code>
                      <span className="text-ash text-[10px] ml-2">PENDIENTE IMPLEMENTACIÓN</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <div className="px-4 py-1 border-t border-panel-border bg-obsidian/90 flex items-center justify-between text-[8px] text-ash tracking-[0.15em]">
        <span>SISTEMA OPERATIVO | INTEGRADOR: {result.metadata.integrator.toUpperCase()} | dt={config.simulation.dt}s</span>
        <span className="flex items-center gap-2">
          <span className="w-1 h-1 bg-hud pulse-dot inline-block" />
          SISTEMA NOMINAL
        </span>
        <span>FRAMES: {totalFrames} | MANIOBRA: {config.aircraft.maneuver.toUpperCase()} | GUIADO: {config.missile.guidanceLaw === "proportional_nav" ? "PN N=" + config.missile.navConstant : "PP"}</span>
      </div>
    </div>
  );
}
