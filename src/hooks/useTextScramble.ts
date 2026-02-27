"use client";

import { useState, useEffect, useRef } from "react";

export type Phase = "glitch" | "scanner" | "assembly" | "complete";

const GIBBERISH_POOL = [
  "0x88_ERR_SYS_FAULT",
  "AWAITING_INPUT...",
  "KERNEL_PANIC_0xDEAD",
  "SYS.BOOT_FAILED",
  "MEM_ALLOC_ERR_0xFF",
  "SIGNAL_LOST_>>",
  "RETICULATING...",
  "STACK_OVERFLOW_0x7F",
  "INIT_SEQUENCE_ERR",
  "DECRYPT_FAILED_>>",
];

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_./\\|{}[]<>!@#$%^&*";

function randomChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

interface UseTextScrambleOptions {
  targetText: string;
  phase: Phase;
}

export function useTextScramble({ targetText, phase }: UseTextScrambleOptions) {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const resolvedCountRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (phase === "glitch") {
      resolvedCountRef.current = 0;
      setIsComplete(false);
      setDisplayText(GIBBERISH_POOL[0]);
      intervalRef.current = setInterval(() => {
        setDisplayText(
          GIBBERISH_POOL[Math.floor(Math.random() * GIBBERISH_POOL.length)]
        );
      }, 80);
    } else if (phase === "scanner" || phase === "assembly") {
      intervalRef.current = setInterval(() => {
        const resolved = resolvedCountRef.current;
        if (resolved >= targetText.length) {
          setDisplayText(targetText);
          setIsComplete(true);
          if (intervalRef.current) clearInterval(intervalRef.current);
          return;
        }

        let result = "";
        for (let i = 0; i < targetText.length; i++) {
          if (targetText[i] === "\n" || targetText[i] === " ") {
            result += targetText[i];
          } else if (i < resolved) {
            result += targetText[i];
          } else {
            result += randomChar();
          }
        }
        setDisplayText(result);
        resolvedCountRef.current++;
      }, 50);
    } else if (phase === "complete") {
      setDisplayText(targetText);
      setIsComplete(true);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase, targetText]);

  return { displayText, isComplete };
}
