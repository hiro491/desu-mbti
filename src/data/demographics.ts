export type Gender = "male" | "female" | "prefer_not_to_answer";

export type AgeGroup =
  | "10s"
  | "20s"
  | "30s"
  | "40s"
  | "50s"
  | "60s"
  | "70s"
  | "80s"
  | "90s";

export type Residence =
  | "hokkaido"
  | "tohoku"
  | "capital_area"
  | "kanto"
  | "chubu"
  | "kinki"
  | "chugoku"
  | "shikoku"
  | "kyushu_okinawa"
  | "overseas";

export type Occupation =
  | "company_employee"
  | "executive"
  | "civil_servant"
  | "self_employed"
  | "student"
  | "homemaker"
  | "part_time"
  | "professional"
  | "educator"
  | "religious"
  | "unemployed"
  | "other";

export type MaritalStatus = "married" | "single" | "prefer_not_to_answer";

export type BereavementExperience =
  | "within_1y"
  | "within_1_3y"
  | "over_3y"
  | "none"
  | "prefer_not_to_answer";

export interface DemographicsFormState {
  ageGroup: AgeGroup | null;
  gender: Gender | null;
  residence: Residence | null;
  occupation: Occupation | null;
  occupationOther: string;
  maritalStatus: MaritalStatus | null;
  bereavementExperience: BereavementExperience | null;
}

export const EMPTY_DEMOGRAPHICS: DemographicsFormState = {
  ageGroup: null,
  gender: null,
  residence: null,
  occupation: null,
  occupationOther: "",
  maritalStatus: null,
  bereavementExperience: null,
};

export const AGE_GROUP_OPTIONS: { value: AgeGroup; label: string }[] = [
  { value: "10s", label: "10代" },
  { value: "20s", label: "20代" },
  { value: "30s", label: "30代" },
  { value: "40s", label: "40代" },
  { value: "50s", label: "50代" },
  { value: "60s", label: "60代" },
  { value: "70s", label: "70代" },
  { value: "80s", label: "80代" },
  { value: "90s", label: "90代" },
];

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "男性" },
  { value: "female", label: "女性" },
  { value: "prefer_not_to_answer", label: "回答しない" },
];

export const RESIDENCE_OPTIONS: { value: Residence; label: string }[] = [
  { value: "hokkaido", label: "北海道地方" },
  { value: "tohoku", label: "東北地方" },
  {
    value: "capital_area",
    label: "首都圏（東京都/神奈川県/千葉県/埼玉県）",
  },
  { value: "kanto", label: "関東地方" },
  { value: "chubu", label: "中部地方" },
  { value: "kinki", label: "近畿地方" },
  { value: "chugoku", label: "中国地方" },
  { value: "shikoku", label: "四国地方" },
  { value: "kyushu_okinawa", label: "九州地方・沖縄" },
  { value: "overseas", label: "海外" },
];

export const OCCUPATION_OPTIONS: { value: Occupation; label: string }[] = [
  { value: "company_employee", label: "会社員" },
  { value: "executive", label: "会社経営・会社役員" },
  { value: "civil_servant", label: "公務員" },
  { value: "self_employed", label: "自営業" },
  { value: "student", label: "学生" },
  { value: "homemaker", label: "専業主婦/主夫" },
  { value: "part_time", label: "パート・アルバイト" },
  {
    value: "professional",
    label: "専門職（医師/弁護士/会計士等）",
  },
  { value: "educator", label: "教職" },
  { value: "religious", label: "宗教関係" },
  { value: "unemployed", label: "無職" },
  { value: "other", label: "その他" },
];

export const MARITAL_STATUS_OPTIONS: {
  value: MaritalStatus;
  label: string;
}[] = [
  { value: "married", label: "既婚" },
  { value: "single", label: "未婚" },
  { value: "prefer_not_to_answer", label: "回答しない" },
];

export const BEREAVEMENT_OPTIONS: {
  value: BereavementExperience;
  label: string;
}[] = [
  { value: "within_1y", label: "1年以内にある" },
  { value: "within_1_3y", label: "1年〜3年以内にある" },
  { value: "over_3y", label: "3年以上前にある" },
  { value: "none", label: "経験はない" },
  { value: "prefer_not_to_answer", label: "答えたくない" },
];

function labelFor<T extends string>(
  options: { value: T; label: string }[],
  value: T,
): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function isDemographicsFormComplete(
  state: DemographicsFormState,
): boolean {
  if (
    !state.ageGroup ||
    !state.gender ||
    !state.residence ||
    !state.occupation ||
    !state.maritalStatus ||
    !state.bereavementExperience
  ) {
    return false;
  }

  if (state.occupation === "other" && !state.occupationOther.trim()) {
    return false;
  }

  return true;
}

export interface DemographicsPayload {
  ageGroup: AgeGroup;
  ageGroupLabel: string;
  gender: Gender;
  genderLabel: string;
  residence: Residence;
  residenceLabel: string;
  occupation: Occupation;
  occupationLabel: string;
  occupationOther?: string;
  maritalStatus: MaritalStatus;
  maritalStatusLabel: string;
  bereavementExperience: BereavementExperience;
  bereavementExperienceLabel: string;
}

export function buildDemographicsPayload(
  state: DemographicsFormState,
): DemographicsPayload | null {
  if (!isDemographicsFormComplete(state)) return null;

  const occupationOther =
    state.occupation === "other" ? state.occupationOther.trim() : undefined;

  return {
    ageGroup: state.ageGroup!,
    ageGroupLabel: labelFor(AGE_GROUP_OPTIONS, state.ageGroup!),
    gender: state.gender!,
    genderLabel: labelFor(GENDER_OPTIONS, state.gender!),
    residence: state.residence!,
    residenceLabel: labelFor(RESIDENCE_OPTIONS, state.residence!),
    occupation: state.occupation!,
    occupationLabel: labelFor(OCCUPATION_OPTIONS, state.occupation!),
    ...(occupationOther ? { occupationOther } : {}),
    maritalStatus: state.maritalStatus!,
    maritalStatusLabel: labelFor(MARITAL_STATUS_OPTIONS, state.maritalStatus!),
    bereavementExperience: state.bereavementExperience!,
    bereavementExperienceLabel: labelFor(
      BEREAVEMENT_OPTIONS,
      state.bereavementExperience!,
    ),
  };
}
