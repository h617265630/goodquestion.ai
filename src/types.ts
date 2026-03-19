export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Question {
  id: number;
  title: string;
  content: string;
  answer: string;
  author_id: number | null;
  likes_count: number;
  created_at: string;
}

export interface Comment {
  id: number;
  question_id: number;
  user_id: number;
  username: string;
  content: string;
  created_at: string;
}
