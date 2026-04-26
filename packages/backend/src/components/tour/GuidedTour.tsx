import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, CheckCircle2, Compass, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TOUR_STORAGE_KEY = "enovait.guided-tour.seen.v1";
const DASHBOARD_PATH = "/dashboard";

type TourStep = {
  id: string;
  selector: string;
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
};

const TOUR_STEPS: TourStep[] = [
  {
    id: "hero",
    selector: '[data-tour-id="dashboard-hero"]',
    eyebrow: "Welcome",
    title: "A control room built for fast orientation",
    description:
      "Start here to understand the current session, the active role, and the operating context before drilling into controls.",
    accent: "Primary context",
  },
  {
    id: "kpis",
    selector: '[data-tour-id="dashboard-kpis"]',
    eyebrow: "At a glance",
    title: "The top line tells you the access posture immediately",
    description:
      "These summary cards surface the permission footprint, queue depth, and policy health without making you hunt for it.",
    accent: "Live signals",
  },
  {
    id: "chart",
    selector: '[data-tour-id="dashboard-chart"]',
    eyebrow: "Trend view",
    title: "This chart shows how approvals and escalations move over time",
    description:
      "Use it to spot bursts, bottlenecks, and unusual access behavior before they turn into a problem.",
    accent: "Behavioral trend",
  },
  {
    id: "ladder",
    selector: '[data-tour-id="dashboard-ladder"]',
    eyebrow: "Policy ladder",
    title: "Roles are mapped as a ladder so hierarchy stays obvious",
    description:
      "You can scan the available tiers, understand their scope, and compare the summary for each role class quickly.",
    accent: "Access structure",
  },
  {
    id: "activity",
    selector: '[data-tour-id="dashboard-activity"]',
    eyebrow: "Audit trail",
    title: "Recent access activity closes the loop",
    description:
      "This is where the system explains what changed, what was approved, and what needs attention next.",
    accent: "Recent events",
  },
];

type SpotlightRect = {
  top: number;
  left: number;
  width: number;
  height: number;
  radius: number;
};

type PanelStyle = {
  top: number;
  left: number;
  width: number;
};

type GuidedTourContextValue = {
  startTour: () => void;
  closeTour: (markSeen?: boolean) => void;
  nextStep: () => void;
  previousStep: () => void;
  isOpen: boolean;
  activeStepIndex: number;
  stepCount: number;
  activeStep: TourStep;
};

const GuidedTourContext = createContext<GuidedTourContextValue | null>(null);

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function readSeenState() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(TOUR_STORAGE_KEY) === "true";
}

export function useGuidedTour() {
  const context = useContext(GuidedTourContext);

  if (!context) {
    throw new Error("useGuidedTour must be used within GuidedTourProvider");
  }

  return context;
}

export function GuidedTourProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [isClient, setIsClient] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const [panelStyle, setPanelStyle] = useState<PanelStyle | null>(null);
  const measureTimeoutRef = useRef<number | null>(null);

  const activeStep = TOUR_STEPS[activeStepIndex] ?? TOUR_STEPS[0];

  useEffect(() => {
    setIsClient(true);
    setHasSeenTour(readSeenState());
  }, []);

  useEffect(() => {
    if (location.pathname !== DASHBOARD_PATH && isOpen) {
      setIsOpen(false);
    }
  }, [isOpen, location.pathname]);

  useEffect(() => {
    if (!isClient || hasSeenTour || location.pathname !== DASHBOARD_PATH) {
      return;
    }

    const timer = window.setTimeout(() => {
      setActiveStepIndex(0);
      setIsOpen(true);
    }, 900);

    return () => {
      window.clearTimeout(timer);
    };
  }, [hasSeenTour, isClient, location.pathname]);

  useEffect(() => {
    if (!isOpen || !isClient) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, isClient]);

  useEffect(() => {
    if (!isOpen || !isClient) {
      return;
    }

    const measure = (shouldRevealTarget: boolean) => {
      const target = document.querySelector(activeStep.selector);

      if (!(target instanceof HTMLElement)) {
        setSpotlight(null);
        setPanelStyle(null);
        return;
      }

      if (shouldRevealTarget) {
        target.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      }

      if (measureTimeoutRef.current) {
        window.clearTimeout(measureTimeoutRef.current);
      }

      measureTimeoutRef.current = window.setTimeout(() => {
        const rect = target.getBoundingClientRect();
        const viewportPadding = 16;
        const spotlightPadding = 14;
        const spotlightLeft = clamp(rect.left - spotlightPadding, viewportPadding, window.innerWidth - viewportPadding);
        const spotlightTop = clamp(rect.top - spotlightPadding, viewportPadding, window.innerHeight - viewportPadding);
        const spotlightWidth = Math.min(
          rect.width + spotlightPadding * 2,
          window.innerWidth - spotlightLeft - viewportPadding
        );
        const spotlightHeight = Math.min(
          rect.height + spotlightPadding * 2,
          window.innerHeight - spotlightTop - viewportPadding
        );

        const borderRadius = Number.parseFloat(window.getComputedStyle(target).borderRadius) || 24;
        setSpotlight({
          top: spotlightTop,
          left: spotlightLeft,
          width: spotlightWidth,
          height: spotlightHeight,
          radius: borderRadius,
        });

        const panelWidth = Math.min(392, window.innerWidth - viewportPadding * 2);
        const panelHeight = 320;
        const hasRightSpace = window.innerWidth - rect.right > panelWidth + 32;
        const hasLeftSpace = rect.left > panelWidth + 32;

        let panelLeft: number;
        let panelTop: number;

        if (window.innerWidth < 768) {
          panelLeft = viewportPadding;
          panelTop = clamp(
            rect.bottom + 18,
            viewportPadding,
            window.innerHeight - panelHeight - viewportPadding
          );
        } else if (hasRightSpace) {
          panelLeft = clamp(rect.right + 20, viewportPadding, window.innerWidth - panelWidth - viewportPadding);
          panelTop = clamp(rect.top - 12, viewportPadding, window.innerHeight - panelHeight - viewportPadding);
        } else if (hasLeftSpace) {
          panelLeft = clamp(rect.left - panelWidth - 20, viewportPadding, window.innerWidth - panelWidth - viewportPadding);
          panelTop = clamp(rect.top - 12, viewportPadding, window.innerHeight - panelHeight - viewportPadding);
        } else {
          panelLeft = clamp(
            (window.innerWidth - panelWidth) / 2,
            viewportPadding,
            window.innerWidth - panelWidth - viewportPadding
          );
          panelTop = clamp(
            rect.bottom + 18,
            viewportPadding,
            window.innerHeight - panelHeight - viewportPadding
          );
        }

        setPanelStyle({
          top: panelTop,
          left: panelLeft,
          width: panelWidth,
        });
      }, 220);
    };

    measure(true);

    const syncLayout = () => measure(false);

    window.addEventListener("resize", syncLayout);
    window.addEventListener("scroll", syncLayout, true);

    return () => {
      if (measureTimeoutRef.current) {
        window.clearTimeout(measureTimeoutRef.current);
      }

      window.removeEventListener("resize", syncLayout);
      window.removeEventListener("scroll", syncLayout, true);
    };
  }, [activeStep.selector, isClient, isOpen]);

  function markTourSeen() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(TOUR_STORAGE_KEY, "true");
    }
    setHasSeenTour(true);
  }

  function startTour() {
    setActiveStepIndex(0);
    setIsOpen(true);
  }

  function closeTour(markSeen = true) {
    setIsOpen(false);

    if (markSeen) {
      markTourSeen();
    }
  }

  function nextStep() {
    if (activeStepIndex >= TOUR_STEPS.length - 1) {
      closeTour(true);
      return;
    }

    setActiveStepIndex((current) => Math.min(current + 1, TOUR_STEPS.length - 1));
  }

  function previousStep() {
    setActiveStepIndex((current) => Math.max(current - 1, 0));
  }

  const contextValue: GuidedTourContextValue = {
    startTour,
    closeTour,
    nextStep,
    previousStep,
    isOpen,
    activeStepIndex,
    stepCount: TOUR_STEPS.length,
    activeStep,
  };

  return (
    <GuidedTourContext.Provider value={contextValue}>
      {children}
      {isClient && typeof document !== "undefined"
        ? createPortal(
            <AnimatePresence>
              {isOpen && spotlight && panelStyle ? (
                <div className="fixed inset-0 z-[80]">
                  <motion.button
                    type="button"
                    aria-label="Close guided tour"
                    className="absolute inset-0 cursor-default bg-slate-950/70 backdrop-blur-[4px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => closeTour(true)}
                  />

                  <motion.div
                    className="fixed rounded-[28px] border border-white/20 bg-white/5 shadow-[0_0_0_9999px_rgba(5,8,10,0.62),0_30px_80px_-30px_rgba(0,0,0,0.75)]"
                    style={{
                      top: spotlight.top,
                      left: spotlight.left,
                      width: spotlight.width,
                      height: spotlight.height,
                      borderRadius: spotlight.radius,
                    }}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 220, damping: 24 }}
                  >
                    <div className="absolute inset-0 rounded-[inherit] border border-white/15 bg-gradient-to-br from-white/12 via-white/5 to-transparent" />
                  </motion.div>

                  <motion.div
                    className="fixed z-[81] w-[min(100vw-32px,392px)] overflow-hidden rounded-[30px] border border-white/15 bg-[#0f1412]/92 text-white shadow-[0_30px_100px_-35px_rgba(0,0,0,0.85)] backdrop-blur-xl"
                    style={{
                      top: panelStyle.top,
                      left: panelStyle.left,
                      width: panelStyle.width,
                    }}
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 240, damping: 24 }}
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#4A6741] via-emerald-300 to-cyan-300" />
                    <div className="flex items-start justify-between gap-4 p-5">
                      <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/65">
                          <Compass className="h-3.5 w-3.5 text-emerald-300" />
                          Guided tour
                        </div>
                        <div className="space-y-2">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-200/75">
                            {activeStep.eyebrow}
                          </p>
                          <h2 className="text-xl font-semibold tracking-tight">{activeStep.title}</h2>
                          <p className="text-sm leading-6 text-white/68">{activeStep.description}</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                        onClick={() => closeTour(true)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="px-5 pb-4">
                      <div className="flex items-center gap-2">
                        {TOUR_STEPS.map((step, index) => (
                          <div
                            key={step.id}
                            className={cn(
                              "h-1.5 flex-1 rounded-full transition-colors",
                              index <= activeStepIndex ? "bg-emerald-300" : "bg-white/10"
                            )}
                          />
                        ))}
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">
                          {activeStep.accent}
                        </div>
                        <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                          Step {activeStepIndex + 1} of {TOUR_STEPS.length}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-black/15 px-5 py-4">
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-10 rounded-full border border-white/10 bg-white/5 px-4 text-sm text-white hover:bg-white/10 hover:text-white"
                        onClick={previousStep}
                        disabled={activeStepIndex === 0}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-10 rounded-full px-4 text-sm text-white/70 hover:bg-white/10 hover:text-white"
                          onClick={() => closeTour(true)}
                        >
                          Skip
                        </Button>
                        <Button
                          type="button"
                          className="h-10 rounded-full bg-[#4A6741] px-5 text-sm font-medium text-white hover:bg-[#5a794f]"
                          onClick={nextStep}
                        >
                          {activeStepIndex === TOUR_STEPS.length - 1 ? "Finish tour" : "Next"}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ) : null}
            </AnimatePresence>,
            document.body
          )
        : null}
    </GuidedTourContext.Provider>
  );
}
