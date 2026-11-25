"use client";

import { useSyncExternalStore } from "react";
import { HudPanel } from "@/feature/hud/components/hud-parts";
import { getRadioSnapshot, subscribeRadio } from "@/lib/radio/radio.store";
import { cn } from "@/lib/utils";
import styles from "./radio-feed.module.css";

export function RadioFeed() {
  const messages = useSyncExternalStore(
    subscribeRadio,
    getRadioSnapshot,
    getRadioSnapshot,
  );

  if (messages.length === 0) return null;

  return (
    <HudPanel
      className={cn(styles.feed, "pointer-events-none")}
      role="log"
      aria-label="Radio"
      aria-live="polite"
    >
      <div className={styles.header}>
        <span className={styles.dot} />
        <span>RADIO · RX</span>
        <span className={styles.count}>
          {messages.length.toString().padStart(2, "0")}
        </span>
      </div>
      <div className={styles.messages}>
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={cn(
              styles.message,
              index === 0 && styles.latest,
              message.priority === "urgent" && styles.urgent,
              message.channel === "ally" && styles.ally,
            )}
          >
            <div className={styles.meta}>
              <span>{message.callsign}</span>
              <span>
                {message.priority === "urgent" ? "PRIORITY" : "ROUTINE"}
              </span>
            </div>
            <div className={styles.title}>{message.title}</div>
            <div className={styles.body}>{message.body}</div>
          </div>
        ))}
      </div>
    </HudPanel>
  );
}
