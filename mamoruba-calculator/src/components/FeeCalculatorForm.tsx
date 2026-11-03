"use client";

import { useMemo, useState } from "react";
import {
  buildBreakdownText,
  calculateFees,
  createInitialFeeCalculatorInput,
  formatHours,
  formatYen,
  generateTimeOptions,
  INSURANCE_MAX,
  INSURANCE_RATE_PER_HOUR,
  INSURANCE_TIME_STEP_HOURS,
  CARE_SUPPORT_RATE_PER_HOUR,
  CARE_SUPPORT_TIME_STEP_HOURS,
  type FeeCalculatorInput,
  type OtherExpense,
  type TransportMode,
  TRANSPORT_RATE_PER_KM,
  WORK_RATE_PER_HOUR,
} from "@/lib/fee-calculator";

function SectionLabel({
  children,
  required = false,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <p className="mc-section-label">
      {children}
      {required && (
        <span className="mc-required" aria-hidden>
          *
        </span>
      )}
    </p>
  );
}

function ChoiceButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={selected ? "mc-choice-btn mc-choice-btn--selected" : "mc-choice-btn"}
    >
      {children}
    </button>
  );
}

const WORK_TIME_OPTIONS = generateTimeOptions(12);
const INSURANCE_TIME_OPTIONS = generateTimeOptions(8, INSURANCE_TIME_STEP_HOURS);
const CARE_SUPPORT_TIME_OPTIONS = generateTimeOptions(
  8,
  CARE_SUPPORT_TIME_STEP_HOURS,
);

function createExpenseId(): string {
  return `expense-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function FeeCalculatorForm() {
  const [input, setInput] = useState<FeeCalculatorInput>(
    createInitialFeeCalculatorInput,
  );
  const [showValidation, setShowValidation] = useState(false);

  const result = useMemo(() => calculateFees(input), [input]);
  const isValid = result !== null;

  const updateTransportMode = (transportMode: TransportMode) => {
    setInput((prev) => ({ ...prev, transportMode }));
  };

  const addOtherExpense = () => {
    setInput((prev) => ({
      ...prev,
      otherExpenses: [
        ...prev.otherExpenses,
        { id: createExpenseId(), label: "", amount: 0 },
      ],
    }));
  };

  const updateOtherExpense = (
    id: string,
    patch: Partial<Pick<OtherExpense, "label" | "amount">>,
  ) => {
    setInput((prev) => ({
      ...prev,
      otherExpenses: prev.otherExpenses.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    }));
  };

  const removeOtherExpense = (id: string) => {
    setInput((prev) => ({
      ...prev,
      otherExpenses: prev.otherExpenses.filter((item) => item.id !== id),
    }));
  };

  const handleCalculate = () => {
    setShowValidation(true);
  };

  return (
    <div className="space-y-8">
      <section>
        <SectionLabel>稼働時間</SectionLabel>
        <p className="mc-hint">
          {formatYen(WORK_RATE_PER_HOUR)}/時間（30分単位）
        </p>
        <select
          value={input.workHours}
          onChange={(event) =>
            setInput((prev) => ({
              ...prev,
              workHours: Number(event.target.value),
            }))
          }
          className="mc-input"
        >
          <option value={0}>選択しない（0時間）</option>
          {WORK_TIME_OPTIONS.map((hours) => (
            <option key={hours} value={hours}>
              {formatHours(hours)}
            </option>
          ))}
        </select>
      </section>

      <div className="mc-divider" />

      <section>
        <SectionLabel required>往復交通費</SectionLabel>
        <div className="mb-4 grid grid-cols-2 gap-2">
          <ChoiceButton
            selected={input.transportMode === "public"}
            onClick={() => updateTransportMode("public")}
          >
            公共交通機関
          </ChoiceButton>
          <ChoiceButton
            selected={input.transportMode === "vehicle"}
            onClick={() => updateTransportMode("vehicle")}
          >
            車・原付（{formatYen(TRANSPORT_RATE_PER_KM)}/km）
          </ChoiceButton>
          <ChoiceButton
            selected={input.transportMode === "walk"}
            onClick={() => updateTransportMode("walk")}
          >
            徒歩
          </ChoiceButton>
          <ChoiceButton
            selected={input.transportMode === "bicycle"}
            onClick={() => updateTransportMode("bicycle")}
          >
            自転車
          </ChoiceButton>
        </div>

        {input.transportMode === "public" ? (
          <label className="block">
            <span className="mc-field-label">往復交通費（円）</span>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={input.publicTransportCost}
              onChange={(event) =>
                setInput((prev) => ({
                  ...prev,
                  publicTransportCost:
                    event.target.value === "" ? "" : Number(event.target.value),
                }))
              }
              placeholder="例：500"
              className="mc-input"
            />
          </label>
        ) : input.transportMode === "vehicle" ? (
          <label className="block">
            <span className="mc-field-label">走行距離（km）</span>
            <input
              type="number"
              min={0}
              step={0.1}
              inputMode="decimal"
              value={input.vehicleKm}
              onChange={(event) =>
                setInput((prev) => ({
                  ...prev,
                  vehicleKm:
                    event.target.value === "" ? "" : Number(event.target.value),
                }))
              }
              placeholder="例：10"
              className="mc-input"
            />
          </label>
        ) : null}

        {showValidation && !isValid && (
          <p className="mc-error">往復交通費を入力してください。</p>
        )}
      </section>

      <div className="mc-divider" />

      <section>
        <p className="mc-section-label">
          保険料
          <span className="mc-section-note">送迎時のみ</span>
        </p>
        <p className="mc-hint">
          {formatYen(INSURANCE_RATE_PER_HOUR)}/時間（1時間単位・上限{" "}
          {formatYen(INSURANCE_MAX)}）
          <br />
          自宅を出てから家に帰るまでの時間。
        </p>
        <select
          value={input.insuranceHours === "" ? "" : input.insuranceHours}
          onChange={(event) =>
            setInput((prev) => ({
              ...prev,
              insuranceHours:
                event.target.value === "" ? "" : Number(event.target.value),
            }))
          }
          className="mc-input"
        >
          <option value="">入力しない</option>
          {INSURANCE_TIME_OPTIONS.map((hours) => (
            <option key={hours} value={hours}>
              {formatHours(hours)}
            </option>
          ))}
        </select>
      </section>

      <div className="mc-divider" />

      <section>
        <SectionLabel>介護サポート</SectionLabel>
        <p className="mc-hint">
          {formatYen(CARE_SUPPORT_RATE_PER_HOUR)}/時間（30分単位）。該当する場合のみ入力してください。
        </p>
        <select
          value={input.careSupportHours === "" ? "" : input.careSupportHours}
          onChange={(event) =>
            setInput((prev) => ({
              ...prev,
              careSupportHours:
                event.target.value === "" ? "" : Number(event.target.value),
            }))
          }
          className="mc-input"
        >
          <option value="">入力しない</option>
          {CARE_SUPPORT_TIME_OPTIONS.map((hours) => (
            <option key={hours} value={hours}>
              {formatHours(hours)}
            </option>
          ))}
        </select>
      </section>

      <div className="mc-divider" />

      <section>
        <SectionLabel>その他の経費</SectionLabel>
        <p className="mc-hint">必要に応じて項目を追加できます。</p>

        {input.otherExpenses.length > 0 && (
          <div className="mb-4 space-y-3">
            {input.otherExpenses.map((item) => (
              <div key={item.id} className="mc-subcard rounded-xl p-4">
                <div className="grid gap-3 sm:grid-cols-[1fr_120px_auto] sm:items-end">
                  <label className="block">
                    <span className="mc-field-label">項目名</span>
                    <input
                      type="text"
                      value={item.label}
                      onChange={(event) =>
                        updateOtherExpense(item.id, {
                          label: event.target.value,
                        })
                      }
                      placeholder="例：駐車場代"
                      className="mc-input"
                    />
                  </label>
                  <label className="block">
                    <span className="mc-field-label">金額（円）</span>
                    <input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={item.amount || ""}
                      onChange={(event) =>
                        updateOtherExpense(item.id, {
                          amount:
                            event.target.value === ""
                              ? 0
                              : Number(event.target.value),
                        })
                      }
                      placeholder="0"
                      className="mc-input"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeOtherExpense(item.id)}
                    className="mc-btn-secondary"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button type="button" onClick={addOtherExpense} className="mc-btn-dashed">
          ＋ 経費を追加
        </button>
      </section>

      <button type="button" onClick={handleCalculate} className="mc-btn-primary">
        料金を計算する
      </button>

      {showValidation && isValid && result && (
        <section className="mc-result rounded-2xl px-5 py-6" aria-live="polite">
          <p className="mc-result-label">計算結果</p>
          <p className="mc-result-total">{formatYen(result.total)}</p>
          <p className="mc-result-breakdown">{buildBreakdownText(result)}</p>
          <ul className="mc-result-list">
            <li>
              <span>稼働時間</span>
              <strong>{formatYen(result.work.amount)}</strong>
            </li>
            <li>
              <span>往復交通費</span>
              <strong>{formatYen(result.transport.amount)}</strong>
            </li>
            {result.insurance && (
              <li>
                <span>保険料</span>
                <strong>{formatYen(result.insurance.amount)}</strong>
              </li>
            )}
            {result.careSupport && (
              <li>
                <span>介護サポート</span>
                <strong>{formatYen(result.careSupport.amount)}</strong>
              </li>
            )}
            {result.otherExpenses.map((item) => (
              <li key={item.label}>
                <span>{item.label}</span>
                <strong>{formatYen(item.amount)}</strong>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
