export type BoardPage = {
  id: string;
  user_id: string | null;
  title: string;
  page_label: string | null;
  person_name: string | null;
  avatar_url: string | null;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  page_id: string;
  sender_name: string;
  content: string;
  created_at: string;
};

export type Photo = {
  id: string;
  page_id: string;
  image_url: string;
  sender_name: string;
  created_at: string;
};

export type CreatePageInput = {
  pageLabel: string | null;
  personName: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  avatarFile: File;
};
