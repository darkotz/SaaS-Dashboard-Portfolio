"use client";

import { useCallback, useEffect, useState } from "react";
import { demoCrmSnapshot } from "@/lib/crm/demo";
import type { CrmSnapshot } from "@/lib/crm/types";

const storageKey = "atlasops.crm-demo.v2";
const eventName = "atlasops:crm-change";

function cloneSeed(): CrmSnapshot {
  return JSON.parse(JSON.stringify(demoCrmSnapshot)) as CrmSnapshot;
}

export function readDemoCrm(): CrmSnapshot {
  if (typeof window === "undefined") return cloneSeed();

  const stored = window.localStorage.getItem(storageKey);
  if (!stored) {
    const seed = cloneSeed();
    window.localStorage.setItem(storageKey, JSON.stringify(seed));
    return seed;
  }

  try {
    const parsed = JSON.parse(stored) as CrmSnapshot;
    if (parsed.version !== 2) throw new Error("Unsupported demo version");
    return parsed;
  } catch {
    const seed = cloneSeed();
    window.localStorage.setItem(storageKey, JSON.stringify(seed));
    return seed;
  }
}

export function writeDemoCrm(snapshot: CrmSnapshot) {
  window.localStorage.setItem(storageKey, JSON.stringify(snapshot));
  window.dispatchEvent(new CustomEvent(eventName));
}

export function resetDemoCrm() {
  writeDemoCrm(cloneSeed());
}

export function useDemoCrm(enabled = true) {
  const [snapshot, setSnapshot] = useState<CrmSnapshot>(demoCrmSnapshot);

  useEffect(() => {
    if (!enabled) return;
    const sync = () => setSnapshot(readDemoCrm());
    sync();
    window.addEventListener(eventName, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(eventName, sync);
      window.removeEventListener("storage", sync);
    };
  }, [enabled]);

  const update = useCallback((recipe: (current: CrmSnapshot) => CrmSnapshot) => {
    const next = recipe(readDemoCrm());
    writeDemoCrm(next);
    setSnapshot(next);
  }, []);

  return { snapshot, update, reset: resetDemoCrm };
}
