import { useCallback, useEffect, useRef, useState } from "react";

import { Sfx } from "@/games/_shared";
import {
  ACCENT,
  BULLET_DAMAGE,
  BULLET_LIFE_MS,
  BULLET_R,
  BULLET_SPEED,
  DANGER,
  FIRE_INTERVAL_MS,
  PLAYER_HIT_R,
  PLAYER_R,
  SHAKE_DECAY,
  STORAGE_KEY,
  STREAK_WINDOW_MS,
} from "../constants";
import type {
  Bullet,
  Enemy,
  Particle,
  ScorePop,
  SurvivalPhase,
  SurvivalStats,
} from "../types";
import { killScore, makeEnemy, spawnIntervalFor, waveFor } from "../utils/spawn";

interface EngineState {
  enemies: Enemy[];
  bullets: Bullet[];
  particles: Particle[];
  pops: ScorePop[];
  aim: number;
  pointer: { x: number; y: number } | null;
  firing: boolean;
  lastShotAt: number;
  spawnTimer: number;
  timeMs: number;
  score: number;
  kills: number;
  streak: number;
  lastKillAt: number;
  shake: number;
  muzzle: number;
  nextId: number;
  running: boolean;
}

function freshState(): EngineState {
  return {
    enemies: [],
    bullets: [],
    particles: [],
    pops: [],
    aim: -Math.PI / 2,
    pointer: null,
    firing: false,
    lastShotAt: 0,
    spawnTimer: 0,
    timeMs: 0,
    score: 0,
    kills: 0,
    streak: 0,
    lastKillAt: -99999,
    shake: 0,
    muzzle: 0,
    nextId: 1,
    running: false,
  };
}

function burst(s: EngineState, x: number, y: number, color: string, n: number, power: number) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = (0.4 + Math.random()) * power;
    s.particles.push({
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      life: 420 + Math.random() * 260,
      maxLife: 680,
      size: 1.6 + Math.random() * 2.4,
      color,
    });
  }
}

/**
 * Survival shooter engine — single canvas, RAF loop, mutable state ref.
 * React only re-renders for phase changes and the throttled HUD snapshot.
 */
export function useSurvival() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<EngineState>(freshState());
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });

  const [phase, setPhase] = useState<SurvivalPhase>("intro");
  const [soundOn, setSoundOn] = useState(true);
  const [best, setBest] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);
  const [stats, setStats] = useState<SurvivalStats>({
    score: 0,
    kills: 0,
    timeMs: 0,
    streak: 0,
    wave: 1,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setBest(Number(raw) || 0);
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    Sfx.setEnabled(soundOn);
  }, [soundOn]);

  /* ---------------- sizing ---------------- */
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      sizeRef.current = { w: rect.width, h: rect.height, dpr };
    };
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
    };
  }, []);

  const endRun = useCallback(() => {
    const s = stateRef.current;
    s.running = false;
    s.firing = false;
    Sfx.play("gameover");
    Sfx.haptic(40);
    setStats({
      score: s.score,
      kills: s.kills,
      timeMs: s.timeMs,
      streak: s.streak,
      wave: waveFor(s.timeMs),
    });
    setBest((prev) => {
      if (s.score > prev) {
        setIsNewBest(true);
        try {
          localStorage.setItem(STORAGE_KEY, String(s.score));
        } catch {
          /* noop */
        }
        return s.score;
      }
      return prev;
    });
    setPhase("over");
  }, []);

  /* ---------------- loop ---------------- */
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let hudAt = 0;

    const step = (now: number) => {
      raf = requestAnimationFrame(step);
      const dtMs = Math.min(now - last, 48);
      last = now;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      const { w, h, dpr } = sizeRef.current;
      const s = stateRef.current;
      const cx = w / 2;
      const cy = h / 2;
      const dt = dtMs / 1000;

      if (s.running) {
        s.timeMs += dtMs;

        /* aim */
        if (s.pointer) {
          s.aim = Math.atan2(s.pointer.y - cy, s.pointer.x - cx);
        }

        /* shooting */
        if (s.firing && s.timeMs - s.lastShotAt >= FIRE_INTERVAL_MS) {
          s.lastShotAt = s.timeMs;
          const spread = (Math.random() - 0.5) * 0.05;
          const a = s.aim + spread;
          s.bullets.push({
            id: s.nextId++,
            x: cx + Math.cos(a) * (PLAYER_R + 8),
            y: cy + Math.sin(a) * (PLAYER_R + 8),
            vx: Math.cos(a) * BULLET_SPEED,
            vy: Math.sin(a) * BULLET_SPEED,
            life: BULLET_LIFE_MS,
          });
          s.muzzle = 1;
          Sfx.play("tap");
        }

        /* spawning */
        s.spawnTimer -= dtMs;
        if (s.spawnTimer <= 0) {
          s.spawnTimer = spawnIntervalFor(s.timeMs);
          s.enemies.push(makeEnemy(s.nextId++, w, h, s.timeMs));
        }

        /* streak decay */
        if (s.streak > 0 && s.timeMs - s.lastKillAt > STREAK_WINDOW_MS) {
          s.streak = 0;
        }

        /* bullets */
        for (const b of s.bullets) {
          b.x += b.vx * dt;
          b.y += b.vy * dt;
          b.life -= dtMs;
        }
        s.bullets = s.bullets.filter(
          (b) => b.life > 0 && b.x > -40 && b.x < w + 40 && b.y > -40 && b.y < h + 40,
        );

        /* enemies */
        for (const e of s.enemies) {
          const dx = cx - e.x;
          const dy = cy - e.y;
          const d = Math.hypot(dx, dy) || 1;
          e.vx = (dx / d) * e.speed;
          e.vy = (dy / d) * e.speed;
          e.x += e.vx * dt;
          e.y += e.vy * dt;
          e.flash = Math.max(0, e.flash - dt * 4);

          if (d < PLAYER_HIT_R + e.r) {
            burst(s, cx, cy, DANGER, 34, 220);
            s.shake = 22;
            endRun();
            break;
          }
        }

        /* bullet ↔ enemy */
        if (s.running) {
          for (const b of s.bullets) {
            for (const e of s.enemies) {
              if (e.hp <= 0) continue;
              if (Math.hypot(b.x - e.x, b.y - e.y) > e.r + BULLET_R) continue;
              b.life = 0;
              e.hp -= BULLET_DAMAGE;
              e.flash = 1;
              burst(s, b.x, b.y, e.hue, 5, 90);
              if (e.hp <= 0) {
                const chained = s.timeMs - s.lastKillAt <= STREAK_WINDOW_MS;
                s.streak = chained ? s.streak + 1 : 1;
                s.lastKillAt = s.timeMs;
                const gained = killScore(e.value, s.streak - 1);
                s.score += gained;
                s.kills += 1;
                s.shake = Math.min(14, 5 + s.streak * 0.6);
                burst(s, e.x, e.y, e.hue, 18, 170);
                s.pops.push({
                  x: e.x,
                  y: e.y,
                  life: 720,
                  text: s.streak > 2 ? `+${gained} ×${s.streak}` : `+${gained}`,
                  color: s.streak > 2 ? ACCENT : "#ffffff",
                });
                Sfx.play(s.streak > 2 ? "combo" : "clear");
                if (s.streak > 2) Sfx.haptic(10);
              }
              break;
            }
          }
          s.bullets = s.bullets.filter((b) => b.life > 0);
          s.enemies = s.enemies.filter((e) => e.hp > 0);
        }
      }

      /* particles + pops always animate (also during the death freeze) */
      for (const p of s.particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.life -= dtMs;
      }
      s.particles = s.particles.filter((p) => p.life > 0);
      for (const p of s.pops) {
        p.y -= 26 * dt;
        p.life -= dtMs;
      }
      s.pops = s.pops.filter((p) => p.life > 0);
      s.muzzle = Math.max(0, s.muzzle - dt * 8);
      s.shake *= SHAKE_DECAY;

      /* ---------------- render ---------------- */
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const sx = (Math.random() - 0.5) * s.shake;
      const sy = (Math.random() - 0.5) * s.shake;

      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.75);
      bg.addColorStop(0, "#1a0a2e");
      bg.addColorStop(1, "#08040f");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.translate(sx, sy);

      /* arena rings */
      ctx.strokeStyle = "rgba(232,121,249,0.08)";
      ctx.lineWidth = 1;
      for (let r = 90; r < Math.max(w, h); r += 90) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      /* particles */
      for (const p of s.particles) {
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      /* enemies */
      for (const e of s.enemies) {
        const ang = Math.atan2(cy - e.y, cx - e.x);
        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.rotate(ang);
        ctx.fillStyle = e.flash > 0 ? "#ffffff" : e.hue;
        ctx.shadowColor = e.hue;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(e.r, 0);
        ctx.lineTo(-e.r * 0.75, e.r * 0.72);
        ctx.lineTo(-e.r * 0.4, 0);
        ctx.lineTo(-e.r * 0.75, -e.r * 0.72);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        if (e.maxHp > 1 && e.hp < e.maxHp) {
          ctx.fillStyle = "rgba(255,255,255,0.75)";
          const bw = e.r * 1.8;
          ctx.fillRect(e.x - bw / 2, e.y - e.r - 8, bw * (e.hp / e.maxHp), 2.5);
        }
      }
      ctx.shadowBlur = 0;

      /* bullets */
      for (const b of s.bullets) {
        ctx.strokeStyle = ACCENT;
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.shadowColor = ACCENT;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x - b.vx * 0.014, b.y - b.vy * 0.014);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      /* player turret */
      if (s.running || phase === "intro") {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(s.aim);
        if (s.muzzle > 0) {
          ctx.globalAlpha = s.muzzle;
          ctx.fillStyle = "#fff6ff";
          ctx.shadowColor = ACCENT;
          ctx.shadowBlur = 26;
          ctx.beginPath();
          ctx.arc(PLAYER_R + 14, 0, 9 * s.muzzle, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.shadowBlur = 0;
        }
        ctx.fillStyle = "#f5e6ff";
        ctx.fillRect(PLAYER_R - 4, -4, 18, 8);
        ctx.restore();

        ctx.fillStyle = "#faf5ff";
        ctx.shadowColor = ACCENT;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(cx, cy, PLAYER_R, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(232,121,249,0.5)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, PLAYER_R + 7, 0, Math.PI * 2);
        ctx.stroke();
      }

      /* score pops */
      for (const p of s.pops) {
        ctx.globalAlpha = Math.min(1, p.life / 400);
        ctx.fillStyle = p.color;
        ctx.font = "700 14px ui-sans-serif, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(p.text, p.x, p.y);
      }
      ctx.globalAlpha = 1;
      ctx.restore();

      /* HUD snapshot ~10fps */
      if (s.running && now - hudAt > 100) {
        hudAt = now;
        setStats({
          score: s.score,
          kills: s.kills,
          timeMs: s.timeMs,
          streak: s.streak,
          wave: waveFor(s.timeMs),
        });
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [endRun, phase]);

  /* ---------------- controls ---------------- */
  const start = useCallback(() => {
    stateRef.current = freshState();
    stateRef.current.running = true;
    setIsNewBest(false);
    setStats({ score: 0, kills: 0, timeMs: 0, streak: 0, wave: 1 });
    setPhase("playing");
    Sfx.play("pickup");
  }, []);

  const toPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = stateRef.current;
    s.pointer = toPointer(e);
    s.firing = true;
    s.lastShotAt = -9999;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    stateRef.current.pointer = toPointer(e);
  }, []);

  const stopFiring = useCallback(() => {
    stateRef.current.firing = false;
  }, []);

  return {
    canvasRef,
    phase,
    stats,
    best,
    isNewBest,
    soundOn,
    toggleSound: () => setSoundOn((v) => !v),
    start,
    onPointerDown,
    onPointerMove,
    stopFiring,
  };
}
