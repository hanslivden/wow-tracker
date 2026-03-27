"use client";

import { useState } from "react";
import type { WowRegion } from "@/types";

const REGIONS: WowRegion[] = ["eu", "us", "kr", "tw"];

interface Props {
  onClose: () => void;
  onAdded: () => void;
}

export default function AddCharacterModal({ onClose, onAdded }: Props) {
  const [name, setName] = useState("");
  const [realm, setRealm] = useState("");
  const [region, setRegion] = useState<WowRegion>("eu");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, realm, region }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add character");
      }

      onAdded();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(2,6,23,0.85)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-md rounded-xl border border-[#c8a848] bg-[#0f172a] p-6"
        style={{ boxShadow: "0 0 40px rgba(200,168,72,0.2)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold font-mono text-[#c8a848]" style={{ textShadow: "0 0 8px rgba(200,168,72,0.6)" }}>
            Add Character
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#334155] flex items-center justify-center hover:border-[#c8a848] transition-colors cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#94a3b8]" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Character name */}
          <div>
            <label htmlFor="char-name" className="block text-xs font-mono text-[#94a3b8] mb-1 uppercase tracking-widest">
              Character Name
            </label>
            <input
              id="char-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Thrall"
              required
              className="w-full rounded-lg border border-[#334155] bg-[#1e293b] px-3 py-2 text-sm font-mono text-[#f8fafc]
                placeholder-[#475569] focus:outline-none focus:border-[#c8a848] transition-colors"
            />
          </div>

          {/* Realm */}
          <div>
            <label htmlFor="char-realm" className="block text-xs font-mono text-[#94a3b8] mb-1 uppercase tracking-widest">
              Realm
            </label>
            <input
              id="char-realm"
              type="text"
              value={realm}
              onChange={(e) => setRealm(e.target.value)}
              placeholder="tarren-mill"
              required
              className="w-full rounded-lg border border-[#334155] bg-[#1e293b] px-3 py-2 text-sm font-mono text-[#f8fafc]
                placeholder-[#475569] focus:outline-none focus:border-[#c8a848] transition-colors"
            />
            <p className="text-[10px] text-[#475569] mt-1 font-mono">Use realm slug (e.g. tarren-mill, draenor)</p>
          </div>

          {/* Region */}
          <div>
            <label className="block text-xs font-mono text-[#94a3b8] mb-1 uppercase tracking-widest">
              Region
            </label>
            <div className="flex gap-2">
              {REGIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRegion(r)}
                  className={`flex-1 py-2 rounded-lg border text-xs font-mono uppercase font-bold transition-all duration-150 cursor-pointer
                    ${region === r
                      ? "border-[#c8a848] bg-[#c8a848]/10 text-[#c8a848]"
                      : "border-[#334155] text-[#94a3b8] hover:border-[#475569]"
                    }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs font-mono text-red-400 border border-red-900 rounded-lg px-3 py-2 bg-red-950/40">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-[#c8a848] text-[#020617] font-bold font-mono text-sm
              hover:bg-[#ffd700] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Adding..." : "Add to Roster"}
          </button>
        </form>
      </div>
    </div>
  );
}
