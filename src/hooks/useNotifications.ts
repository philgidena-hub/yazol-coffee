"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export function useNotifications() {
  const [isMuted, setIsMuted] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const audioContextRef = useRef<AudioContext | null>(null);

  // Load mute preference from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("admin-muted");
    if (stored !== null) {
      setIsMuted(stored === "true");
    }
    if (typeof Notification !== "undefined") {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "default") {
      const result = await Notification.requestPermission();
      setPermission(result);
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      localStorage.setItem("admin-muted", String(next));
      // Request notification permission when unmuting
      if (!next) requestPermission();
      return next;
    });
  }, [requestPermission]);

  const playChime = useCallback(() => {
    try {
      // Use Web Audio API for a simple chime — no external file needed
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5
      oscillator.frequency.setValueAtTime(1108.73, ctx.currentTime + 0.1); // C#6
      oscillator.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.2); // E6

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.4);
    } catch {
      // Audio not available in this environment
    }
  }, []);

  const notify = useCallback(
    (title: string, body: string) => {
      if (isMuted) return;

      playChime();

      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification(title, {
          body,
          icon: "/favicon.ico",
          tag: "new-order",
        });
      }
    },
    [isMuted, playChime]
  );

  return { notify, isMuted, toggleMute, permission };
}
