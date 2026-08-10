"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  THEME_TOKENS,
  TOKEN_GROUP_LABELS,
  type BaseThemeColors,
  type ThemeTokenOverrides,
  type TokenGroup,
  type TokenId,
} from "@/lib/themeTokens";

interface TokenGroupEditorProps {
  group: TokenGroup;
  /** 그룹 대표 색 = 기존 6색 중 하나 */
  groupColor: string;
  onGroupColorChange: (value: string) => void;
  /** 파생 기본값 계산에 쓰는 현재 테마 전체 */
  theme: BaseThemeColors;
  overrides: ThemeTokenOverrides;
  onOverridesChange: (next: ThemeTokenOverrides) => void;
}

/** color input은 6자리 hex만 받는다. 파생값이 #RRGGBBAA거나 rgba()면 앞 6자리만 넘긴다 */
const toColorInputValue = (value: string) => {
  const hex = value.match(/^#([0-9a-f]{6})/i);
  return hex ? `#${hex[1]}` : "#000000";
};

/**
 * 기본 6색 하나 + 그 색이 먹이는 개별 슬롯들.
 *
 * 접혀 있을 땐 지금과 똑같이 색 하나만 고르면 되고,
 * 펼치면 슬롯별로 따로 덮어쓸 수 있다. 안 덮어쓴 슬롯은 그룹 색에서 파생된 값을 보여준다.
 */
export default function TokenGroupEditor({
  group,
  groupColor,
  onGroupColorChange,
  theme,
  overrides,
  onOverridesChange,
}: TokenGroupEditorProps) {
  const [expanded, setExpanded] = useState(false);

  const tokens = THEME_TOKENS.filter((t) => t.group === group);
  const hasPoster = !!theme.posterUrl;
  const overriddenCount = tokens.filter((t) => overrides[t.id]).length;

  const setToken = (id: TokenId, value: string | undefined) => {
    const next = { ...overrides };
    if (value === undefined) {
      delete next[id];
    } else {
      next[id] = value;
    }
    onOverridesChange(next);
  };

  return (
    <div className="rounded-lg border">
      <div className="flex items-center gap-3 p-3">
        <input
          type="color"
          value={toColorInputValue(groupColor)}
          onChange={(e) => onGroupColorChange(e.target.value)}
          className="w-10 h-9 rounded cursor-pointer border shrink-0"
        />
        <div className="min-w-0 flex-1">
          <Label className="block">{TOKEN_GROUP_LABELS[group]}</Label>
          <span className="text-xs text-muted-foreground">
            {overriddenCount > 0
              ? `${tokens.length}개 중 ${overriddenCount}개 개별 지정됨`
              : `${tokens.length}개 요소에 적용 중`}
          </span>
        </div>
        <Input
          value={groupColor}
          onChange={(e) => onGroupColorChange(e.target.value)}
          className="w-28 shrink-0"
        />
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs px-2 py-1.5 rounded border shrink-0 hover:bg-muted"
        >
          {expanded ? "접기" : "세분화"}
        </button>
      </div>

      {expanded && (
        <div className="border-t px-3 py-2 space-y-1">
          {tokens.map((token) => {
            const override = overrides[token.id];
            const derived = token.derive(theme, hasPoster);
            const effective = override || derived;

            return (
              <div key={token.id} className="flex items-center gap-2 py-1">
                <input
                  type="color"
                  value={toColorInputValue(effective)}
                  onChange={(e) => setToken(token.id, e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border shrink-0"
                />
                <span className="text-sm flex-1 min-w-0 truncate">
                  {token.label}
                </span>
                {override ? (
                  <>
                    <Input
                      value={override}
                      onChange={(e) => setToken(token.id, e.target.value)}
                      className="w-28 h-8 shrink-0 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setToken(token.id, undefined)}
                      className="text-xs px-2 py-1 rounded border shrink-0 hover:bg-muted"
                      title="그룹 색 상속으로 되돌리기"
                    >
                      되돌리기
                    </button>
                  </>
                ) : (
                  <>
                    <span className="w-28 shrink-0 text-xs text-muted-foreground font-mono truncate">
                      {derived}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground shrink-0">
                      상속
                    </span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
