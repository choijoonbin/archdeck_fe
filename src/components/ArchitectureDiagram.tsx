import React, { useId, useMemo, useRef, useState } from "react";
import type { DiagramNode, DiagramEdge, FlowStep } from "../types";

const kinds = {
  request: "요청",
  response: "응답",
  internal: "내부 처리",
  event: "이벤트",
  error: "오류·거부",
};
const nodeWidth = 164,
  nodeHeight = 82;
/** Coordinates belong to content; absent coordinates receive a stable row layout. */
export function layoutDiagram(nodes: DiagramNode[]) {
  return nodes.map((node, i) => ({
    ...node,
    x: node.x ?? 80 + (i % 3) * 270,
    y: node.y ?? 90 + Math.floor(i / 3) * 210,
  }));
}
export function validateDiagram(value: any): string[] {
  const errors: string[] = [];
  if (!Array.isArray(value.diagramNodes))
    return ["diagramNodes는 배열이어야 합니다."];
  if (!Array.isArray(value.flowSteps))
    return ["flowSteps는 배열이어야 합니다."];
  if (value.diagramEdges !== undefined && !Array.isArray(value.diagramEdges))
    return ["diagramEdges는 배열이어야 합니다."];
  const ids = new Set<string>();
  for (const n of value.diagramNodes) {
    if (
      !n ||
      typeof n.id !== "string" ||
      typeof n.label !== "string" ||
      typeof n.subLabel !== "string" ||
      typeof n.type !== "string"
    ) {
      errors.push("구성요소의 id, label, subLabel, type을 확인하세요.");
      continue;
    }
    if (ids.has(n.id)) errors.push(`중복 구성요소: ${n.id}`);
    ids.add(n.id);
    if (
      [n.x, n.y].some(
        (v) =>
          v !== undefined && (typeof v !== "number" || !Number.isFinite(v)),
      )
    )
      errors.push(`좌표는 유한한 숫자여야 합니다: ${n.id}`);
  }
  const edgeIds = new Set<string>();
  for (const e of value.diagramEdges || []) {
    if (
      !e ||
      typeof e.id !== "string" ||
      !ids.has(e.source) ||
      !ids.has(e.target) ||
      !Object.prototype.hasOwnProperty.call(kinds, e.type)
    ) {
      errors.push("연결의 id, source, target, type을 확인하세요.");
      continue;
    }
    if (edgeIds.has(e.id)) errors.push(`중복 연결: ${e.id}`);
    edgeIds.add(e.id);
  }
  for (const step of value.flowSteps) {
    if (
      !step ||
      !Array.isArray(step.activeNodes) ||
      step.activeNodes.some((id: string) => !ids.has(id))
    )
      errors.push("단계의 activeNodes 참조를 확인하세요.");
    if (
      step?.activeEdgeIds !== undefined &&
      (!Array.isArray(step.activeEdgeIds) ||
        step.activeEdgeIds.some((id: string) => !edgeIds.has(id)))
    )
      errors.push("단계의 activeEdgeIds 참조를 확인하세요.");
  }
  return [...new Set(errors)];
}
export function ArchitectureDiagram({
  nodes,
  edges,
  activeStep,
}: {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  activeStep: FlowStep;
}) {
  const marker = useId().replace(/:/g, "");
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ x: number; y: number; tx: number; ty: number } | null>(
    null,
  );
  const [camera, setCamera] = useState({ scale: 1, x: 0, y: 0 });
  const [all, setAll] = useState(false);
  const [selected, setSelected] = useState("");
  const placed = useMemo(() => layoutDiagram(nodes), [nodes]);
  const lookup = new Map(placed.map((n) => [n.id, n]));
  const validEdges = edges.filter(
    (e) => lookup.has(e.source) && lookup.has(e.target),
  );
  const minX = Math.min(0, ...placed.map((n) => n.x - 50)),
    minY = Math.min(-30, ...placed.map((n) => n.y - 100));
  const width =
    Math.max(520, ...placed.map((n) => n.x + nodeWidth + 70)) - minX;
  const height =
    Math.max(320, ...placed.map((n) => n.y + nodeHeight + 80)) - minY;
  const fit = () => setCamera({ scale: 1, x: 0, y: 0 });
  const zoom = (factor: number) =>
    setCamera((c) => ({
      ...c,
      scale: Math.min(8, Math.max(0.5, c.scale * factor)),
    }));
  const activeEdges = new Set(activeStep.activeEdgeIds || []);
  const activeNodes = new Set(activeStep.activeNodes || []);
  const zones = [...new Set(placed.map((n) => n.trustZone).filter(Boolean))];
  const selectedNode = lookup.get(selected);
  return (
    <div className="architecture-diagram">
      <div className="diagram-toolbar">
        <div role="group" aria-label="흐름 표시 범위">
          <button aria-pressed={!all} onClick={() => setAll(false)}>
            현재 단계
          </button>
          <button aria-pressed={all} onClick={() => setAll(true)}>
            전체 흐름
          </button>
        </div>
        <div role="group" aria-label="흐름도 보기 조절">
          <button aria-label="흐름도 축소" onClick={() => zoom(1 / 1.2)}>
            −
          </button>
          <output aria-label="흐름도 배율">
            {Math.round(camera.scale * 100)}%
          </output>
          <button aria-label="흐름도 확대" onClick={() => zoom(1.2)}>
            +
          </button>
          <button onClick={fit}>화면 맞춤</button>
        </div>
      </div>
      {activeStep.step > 0 && (
        <p className="diagram-step-summary">
          선택 단계: {activeStep.actor} → {activeStep.target} ·{" "}
          {activeStep.protocol} · {activeStep.action}
        </p>
      )}
      <p className="diagram-help" id={`${marker}-help`}>
        드래그로 이동 · 방향키로 이동 · + / − 확대·축소 · Home 화면 맞춤.
        구성요소를 선택하면 설명을 볼 수 있습니다. 연결 번호의 설명은 아래
        텍스트 목록에서 확인하세요.
      </p>
      {!nodes.length ? (
        <p className="empty-state">
          이 문서에는 구성요소가 등록되어 있지 않습니다.
        </p>
      ) : (
        <svg
          ref={svgRef}
          className="diagram-canvas"
          viewBox={`${minX} ${minY} ${width} ${height}`}
          tabIndex={0}
          role="group"
          aria-label="인터랙티브 아키텍처 흐름도"
          aria-describedby={`${marker}-help`}
          onKeyDown={(e) => {
            if (e.target !== e.currentTarget) return;
            if (
              [
                "ArrowLeft",
                "ArrowRight",
                "ArrowUp",
                "ArrowDown",
                "+",
                "=",
                "-",
                "Home",
              ].includes(e.key)
            )
              e.preventDefault();
            if (e.key === "+" || e.key === "=") zoom(1.2);
            else if (e.key === "-") zoom(1 / 1.2);
            else if (e.key === "Home") fit();
            else if (e.key.startsWith("Arrow"))
              setCamera((c) => ({
                ...c,
                x:
                  c.x +
                  (e.key === "ArrowLeft"
                    ? 35
                    : e.key === "ArrowRight"
                      ? -35
                      : 0),
                y:
                  c.y +
                  (e.key === "ArrowUp" ? 35 : e.key === "ArrowDown" ? -35 : 0),
              }));
          }}
          onPointerDown={(e) => {
            if ((e.target as Element).closest('[role="button"]')) return;
            drag.current = {
              x: e.clientX,
              y: e.clientY,
              tx: camera.x,
              ty: camera.y,
            };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!drag.current || !svgRef.current) return;
            const ratio = width / svgRef.current.getBoundingClientRect().width;
            setCamera((c) => ({
              ...c,
              x: drag.current!.tx + (e.clientX - drag.current!.x) * ratio,
              y: drag.current!.ty + (e.clientY - drag.current!.y) * ratio,
            }));
          }}
          onPointerUp={() => {
            drag.current = null;
          }}
          onPointerCancel={() => {
            drag.current = null;
          }}
        >
          <title>구성요소와 방향이 표시된 연결 흐름</title>
          <defs>
            {Object.keys(kinds).map((kind) => (
              <marker
                key={kind}
                id={`${marker}-${kind}`}
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path
                  d="M 0 0 L 10 5 L 0 10 z"
                  className={`diagram-arrow ${kind}`}
                />
              </marker>
            ))}
          </defs>
          <g
            transform={`translate(${width / 2 + camera.x} ${height / 2 + camera.y}) scale(${camera.scale}) translate(${-width / 2} ${-height / 2})`}
          >
            {zones.map((zone) => {
              const members = placed.filter((n) => n.trustZone === zone),
                x = Math.min(...members.map((n) => n.x)) - 22,
                y = Math.min(...members.map((n) => n.y)) - 35,
                w = Math.max(...members.map((n) => n.x)) - x + nodeWidth + 22,
                h = Math.max(...members.map((n) => n.y)) - y + nodeHeight + 22;
              return (
                <g className="diagram-zone" key={zone}>
                  <rect x={x} y={y} width={w} height={h} rx="18" />
                  <text x={x + 12} y={y + 20}>
                    신뢰 영역 · {zone}
                  </text>
                </g>
              );
            })}
            {validEdges.map((edge, i) => {
              const source = lookup.get(edge.source)!,
                target = lookup.get(edge.target)!,
                active = all || activeEdges.has(edge.id),
                kind = kinds[edge.type] ? edge.type : "request";
              const sx = source.x + nodeWidth / 2,
                sy = source.y + nodeHeight / 2,
                tx = target.x + nodeWidth / 2,
                ty = target.y + nodeHeight / 2;
              const dx = tx - sx,
                dy = ty - sy,
                ratio =
                  1 /
                  Math.max(
                    Math.abs(dx) / (nodeWidth / 2 + 5),
                    Math.abs(dy) / (nodeHeight / 2 + 5),
                    1,
                  );
              const startX = sx + dx * ratio,
                startY = sy + dy * ratio,
                endX = tx - dx * ratio,
                endY = ty - dy * ratio;
              const reverse = validEdges.some(
                  (e) => e.source === edge.target && e.target === edge.source,
                ),
                parallel = validEdges.filter(
                  (e) => e.source === edge.source && e.target === edge.target,
                ),
                index = parallel.findIndex((e) => e.id === edge.id),
                obstructed = placed.some((n) => {
                  if (n.id === edge.source || n.id === edge.target)
                    return false;
                  const nx = n.x + nodeWidth / 2,
                    ny = n.y + nodeHeight / 2;
                  const projection =
                    ((nx - sx) * dx + (ny - sy) * dy) /
                    (dx * dx + dy * dy || 1);
                  const distance =
                    Math.abs((nx - sx) * dy - (ny - sy) * dx) /
                    (Math.hypot(dx, dy) || 1);
                  return (
                    projection > 0 &&
                    projection < 1 &&
                    distance < nodeHeight / 2 + 12
                  );
                }),
                bend =
                  (obstructed ? 180 : 0) +
                  (reverse
                    ? 36 + index * 48
                    : (index - (parallel.length - 1) / 2) * 48);
              const mx =
                  (startX + endX) / 2 - (dy / (Math.hypot(dx, dy) || 1)) * bend,
                my =
                  (startY + endY) / 2 + (dx / (Math.hypot(dx, dy) || 1)) * bend;
              const badgeX =
                edge.source === edge.target
                  ? source.x + nodeWidth / 2
                  : (startX + 2 * mx + endX) / 4;
              const badgeY =
                edge.source === edge.target
                  ? source.y - 48
                  : (startY + 2 * my + endY) / 4;
              const d =
                edge.source === edge.target
                  ? `M ${source.x + 130} ${source.y} C ${source.x + 220} ${source.y - 70}, ${source.x - 50} ${source.y - 70}, ${source.x + 35} ${source.y}`
                  : `M ${startX} ${startY} Q ${mx} ${my} ${endX} ${endY}`;
              return (
                <g
                  key={edge.id}
                  className={`diagram-edge ${kind} ${active ? "is-active" : "is-muted"}`}
                  data-edge-id={edge.id}
                  data-active={active}
                >
                  <path d={d} markerEnd={`url(#${marker}-${kind})`} />
                  <rect
                    className="diagram-edge-badge"
                    x={badgeX - 18}
                    y={badgeY - 11}
                    width={36}
                    height={22}
                    rx={11}
                  />
                  <text x={badgeX} y={badgeY + 4} textAnchor="middle">
                    {i + 1}
                    {active && !all ? "✓" : ""}
                  </text>
                  <title>
                    {lookup.get(edge.source)?.label} →{" "}
                    {lookup.get(edge.target)?.label}:{" "}
                    {edge.label || kinds[kind]} {edge.protocol || ""}
                    {edge.trustBoundary
                      ? ` · 신뢰경계: ${edge.trustBoundary}`
                      : ""}
                  </title>
                </g>
              );
            })}
            {placed.map((node) => {
              const active = all || activeNodes.has(node.id);
              return (
                <g
                  key={node.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${node.label}, ${node.subLabel}${active ? ", 현재 표시" : ""}`}
                  aria-pressed={selected === node.id}
                  className={`diagram-node ${active ? "is-active" : ""} ${selected === node.id ? "is-selected" : ""}`}
                  transform={`translate(${node.x} ${node.y})`}
                  onClick={() => setSelected(node.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelected(node.id);
                    }
                  }}
                >
                  <rect width={nodeWidth} height={nodeHeight} rx="12" />
                  <text x={12} y={24} className="diagram-node-type">
                    {node.type.toUpperCase()}
                    {active && !all ? " · ●" : ""}
                  </text>
                  <text x={12} y={45} className="diagram-node-label">
                    {node.label.length > 19
                      ? node.label.slice(0, 18) + "…"
                      : node.label}
                  </text>
                  <text x={12} y={65}>
                    {node.subLabel.length > 25
                      ? node.subLabel.slice(0, 24) + "…"
                      : node.subLabel}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      )}
      <div className="diagram-legend" aria-label="흐름도 범례">
        {Object.entries(kinds).map(([kind, label]) => (
          <span key={kind}>
            <i className={kind} aria-hidden="true" />
            {label}
          </span>
        ))}
        <span>▧ 신뢰 영역 / 경계</span>
        <span>✓ 현재 단계 연결</span>
      </div>
      <p className="diagram-selection" role="status">
        {selectedNode
          ? `${selectedNode.label} · ${selectedNode.subLabel}${selectedNode.trustZone ? ` · 신뢰 영역: ${selectedNode.trustZone}` : ""}`
          : "구성요소를 선택해 상세 정보를 확인하세요."}
      </p>
      {!validEdges.length && (
        <p className="diagram-help">
          연결 정보가 등록되지 않았습니다. 구성요소 배치는 통신 방향을 의미하지
          않습니다.
        </p>
      )}
      {validEdges.length > 0 && !all && !activeEdges.size && (
        <p className="diagram-help">
          이 단계의 연결 정보가 지정되지 않았습니다. 전체 흐름에서 등록된 연결을
          확인하세요.
        </p>
      )}
      <details className="diagram-text">
        <summary>텍스트로 흐름 읽기 ({validEdges.length}개 연결)</summary>
        <ol>
          {validEdges.map((edge, i) => (
            <li key={edge.id}>
              {i + 1}. {lookup.get(edge.source)?.label} →{" "}
              {lookup.get(edge.target)?.label} · {kinds[edge.type]} ·{" "}
              {edge.label} {edge.protocol}
              {edge.trustBoundary && ` · 경계: ${edge.trustBoundary}`}
              {activeEdges.has(edge.id) && " · 현재 단계"}
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}
