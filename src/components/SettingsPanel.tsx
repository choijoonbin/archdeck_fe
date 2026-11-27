import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useAppearance } from "../context/AppearanceContext";
export function SettingsPanel({ close }: { close: () => void }) {
  const { preferences: p, setPreferences: set, reset } = useAppearance();
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    ref.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const nodes = ref.current?.querySelectorAll<HTMLElement>(
          "button,input,select",
        );
        if (!nodes?.length) return;
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, []);
  const choice = (field: string, label: string, options: string[][]) => (
    <fieldset>
      <legend>{label}</legend>
      <div className="choice-group">
        {options.map(([value, name]) => (
          <button
            key={value}
            aria-pressed={p[field] === value}
            onClick={() => set({ ...p, [field]: value })}
          >
            {name}
          </button>
        ))}
      </div>
    </fieldset>
  );
  return (
    <div
      className="overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <aside
        className="settings-panel"
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="화면 설정"
      >
        <div className="section-heading">
          <div>
            <span className="eyebrow">APPEARANCE</span>
            <h2>화면 설정</h2>
          </div>
          <button
            className="icon-button"
            aria-label="설정 닫기"
            onClick={close}
          >
            <X />
          </button>
        </div>
        <p>학습 환경을 원하는 방식으로 조정하세요.</p>
        {choice("mode", "화면 모드", [
          ["light", "주간"],
          ["dark", "야간"],
          ["system", "시스템"],
        ])}
        {choice("preset", "색상 프리셋", [
          ["dwp-blue", "DWP Blue"],
          ["archdeck-cyan", "Cyan"],
          ["indigo", "Indigo"],
          ["emerald", "Emerald"],
        ])}
        {choice("placement", "메뉴 위치", [
          ["left", "왼쪽"],
          ["right", "오른쪽"],
          ["top", "상단"],
        ])}
        {choice("density", "화면 밀도", [
          ["compact", "촘촘하게"],
          ["standard", "표준"],
          ["comfortable", "여유롭게"],
        ])}
        {[
          ["collapsed", "메뉴 축소"],
          ["highContrast", "고대비"],
          ["reduceMotion", "모션 줄이기"],
        ].map(([field, label]) => (
          <label className="setting-toggle" key={field}>
            <span>{label}</span>
            <input
              type="checkbox"
              checked={p[field]}
              onChange={(e) => set({ ...p, [field]: e.target.checked })}
            />
          </label>
        ))}
        <button className="secondary-button" onClick={reset}>
          기본값 복원
        </button>
        <p className="muted">외관 설정만 초기화하며 학습 기록은 유지합니다.</p>
      </aside>
    </div>
  );
}
