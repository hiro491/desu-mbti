export const WORK_RATE_PER_HOUR = 1800;
export const WORK_TIME_STEP_HOURS = 0.5;
export const TRANSPORT_RATE_PER_KM = 40;
export const INSURANCE_RATE_PER_HOUR = 130;
export const INSURANCE_MAX = 630;
export const INSURANCE_TIME_STEP_HOURS = 1;
export const CARE_SUPPORT_RATE_PER_HOUR = 3300;
export const CARE_SUPPORT_TIME_STEP_HOURS = 0.5;
export const TIME_STEP_HOURS = 0.5;

export type TransportMode = "public" | "vehicle" | "walk" | "bicycle";

export interface OtherExpense {
  id: string;
  label: string;
  amount: number;
}

export interface FeeCalculatorInput {
  workHours: number;
  transportMode: TransportMode;
  publicTransportCost: number | "";
  vehicleKm: number | "";
  insuranceHours: number | "";
  careSupportHours: number | "";
  otherExpenses: OtherExpense[];
}

export interface FeeLineItem {
  label: string;
  amount: number;
}

export interface FeeCalculationResult {
  work: FeeLineItem;
  transport: FeeLineItem;
  insurance: FeeLineItem | null;
  careSupport: FeeLineItem | null;
  otherExpenses: FeeLineItem[];
  total: number;
}

export function createInitialFeeCalculatorInput(): FeeCalculatorInput {
  return {
    workHours: 0,
    transportMode: "public",
    publicTransportCost: "",
    vehicleKm: "",
    insuranceHours: "",
    careSupportHours: "",
    otherExpenses: [],
  };
}

export function formatHours(hours: number): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  if (minutes === 0) {
    return `${wholeHours}時間`;
  }
  if (wholeHours === 0) {
    return `${minutes}分`;
  }
  return `${wholeHours}時間${minutes}分`;
}

export function formatYen(amount: number): string {
  return `${amount.toLocaleString("ja-JP")}円`;
}

function parsePositiveNumber(value: number | ""): number | null {
  if (value === "" || Number.isNaN(value) || value < 0) {
    return null;
  }
  return value;
}

export function isWorkHoursValid(workHours: number): boolean {
  if (workHours === 0) return true;
  return workHours > 0 && workHours % WORK_TIME_STEP_HOURS === 0;
}

export function isTransportValid(input: FeeCalculatorInput): boolean {
  if (input.transportMode === "walk" || input.transportMode === "bicycle") {
    return true;
  }
  if (input.transportMode === "public") {
    const cost = parsePositiveNumber(input.publicTransportCost);
    return cost !== null;
  }
  const km = parsePositiveNumber(input.vehicleKm);
  return km !== null && km > 0;
}

export function isInsuranceHoursValid(hours: number | ""): boolean {
  if (hours === "") return true;
  return hours > 0 && hours % INSURANCE_TIME_STEP_HOURS === 0;
}

export function canCalculate(input: FeeCalculatorInput): boolean {
  return isWorkHoursValid(input.workHours) && isTransportValid(input);
}

export function calculateFees(input: FeeCalculatorInput): FeeCalculationResult | null {
  if (!canCalculate(input)) {
    return null;
  }

  const workAmount = input.workHours * WORK_RATE_PER_HOUR;
  const work: FeeLineItem =
    input.workHours === 0
      ? { label: "選択しない（0時間）", amount: 0 }
      : {
          label: `${formatHours(input.workHours)} × ${formatYen(WORK_RATE_PER_HOUR)}`,
          amount: workAmount,
        };

  let transport: FeeLineItem;
  if (input.transportMode === "walk") {
    transport = {
      label: "徒歩",
      amount: 0,
    };
  } else if (input.transportMode === "bicycle") {
    transport = {
      label: "自転車",
      amount: 0,
    };
  } else if (input.transportMode === "public") {
    const cost = parsePositiveNumber(input.publicTransportCost)!;
    transport = {
      label: `公共交通機関 ${formatYen(cost)}`,
      amount: cost,
    };
  } else {
    const km = parsePositiveNumber(input.vehicleKm)!;
    const amount = km * TRANSPORT_RATE_PER_KM;
    transport = {
      label: `${km}キロ × ${formatYen(TRANSPORT_RATE_PER_KM)}`,
      amount,
    };
  }

  let insurance: FeeLineItem | null = null;
  const insuranceHours = parsePositiveNumber(input.insuranceHours);
  if (insuranceHours !== null && insuranceHours > 0) {
    const rawAmount = insuranceHours * INSURANCE_RATE_PER_HOUR;
    const amount = Math.min(rawAmount, INSURANCE_MAX);
    insurance = {
      label: `保険料 ${formatYen(INSURANCE_RATE_PER_HOUR)} × ${formatHours(insuranceHours)}`,
      amount,
    };
  }

  let careSupport: FeeLineItem | null = null;
  const careSupportHours = parsePositiveNumber(input.careSupportHours);
  if (careSupportHours !== null && careSupportHours > 0) {
    const amount = careSupportHours * CARE_SUPPORT_RATE_PER_HOUR;
    careSupport = {
      label: `介護サポート ${formatYen(CARE_SUPPORT_RATE_PER_HOUR)} × ${formatHours(careSupportHours)}`,
      amount,
    };
  }

  const otherExpenses: FeeLineItem[] = input.otherExpenses
    .filter((item) => item.label.trim() && item.amount > 0)
    .map((item) => ({
      label: item.label.trim(),
      amount: item.amount,
    }));

  const total =
    work.amount +
    transport.amount +
    (insurance?.amount ?? 0) +
    (careSupport?.amount ?? 0) +
    otherExpenses.reduce((sum, item) => sum + item.amount, 0);

  return { work, transport, insurance, careSupport, otherExpenses, total };
}

export function buildBreakdownText(result: FeeCalculationResult): string {
  const parts = [
    `${result.work.label}（${formatYen(result.work.amount)}）`,
    `${result.transport.label}（${formatYen(result.transport.amount)}）`,
  ];

  if (result.insurance) {
    parts.push(
      `${result.insurance.label}（${formatYen(result.insurance.amount)}）`,
    );
  }

  if (result.careSupport) {
    parts.push(
      `${result.careSupport.label}（${formatYen(result.careSupport.amount)}）`,
    );
  }

  for (const item of result.otherExpenses) {
    parts.push(`${item.label}（${formatYen(item.amount)}）`);
  }

  return `${parts.join(" + ")} = ${formatYen(result.total)}`;
}

export function generateTimeOptions(
  maxHours: number,
  stepHours: number = TIME_STEP_HOURS,
): number[] {
  const options: number[] = [];
  for (let h = stepHours; h <= maxHours; h += stepHours) {
    options.push(h);
  }
  return options;
}
