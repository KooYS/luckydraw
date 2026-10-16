"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  THEME_TOKENS,
  TOKEN_GROUP_LABELS,
  type ThemeTokenOverrides,
  type TokenGroup,
} from "@/lib/themeTokens";

interface TokenGroupEditorProps {
  group: TokenGroup;
  /** 그룹 대표 색 = 기존 6색 중 하나 */
  groupColor: string;
  onGroupColorChange: (value: string) => void;
  overrides: ThemeTokenOverrides;
}

/**
 * 기본 6색 중 하나. 이 색이 몇 개 요소에 쓰이는지, 그중 몇 개가 개별 지정됐는지 보여준다.
 * 개별 지정은 미리보기에서 요소를 클릭해서 한다.
 */
export default function TokenGroupEditor({
  group,
  groupColor,
  onGroupColorChange,
  overrides,
}: TokenGroupEditorProps) {
  const tokens = THEME_TOKENS.filter((t) => t.group === group);
  const overriddenCount = tokens.filter((t) => overrides[t.id]).length;

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <input
        type="color"
        value={groupColor}
        onChange={(e) => onGroupColorChange(e.target.value)}
        className="w-10 h-9 rounded cursor-pointer border shrink-0"
      />
      <div className="min-w-0 flex-1">
        <Label className="block">{TOKEN_GROUP_LABELS[group]}</Label>
        <span className="text-xs text-muted-foreground">
          {overriddenCount > 0
            ? `${tokens.length}개 요소 중 ${overriddenCount}개는 개별 지정됨`
            : `${tokens.length}개 요소에 적용 중`}
        </span>
      </div>
      <Input
        value={groupColor}
        onChange={(e) => onGroupColorChange(e.target.value)}
        className="w-28 shrink-0"
      />
    </div>
  );
}
