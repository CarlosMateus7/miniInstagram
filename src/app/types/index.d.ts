export interface Timestamp {
  nanoseconds: number;
  seconds: number;
}

export interface Post {
  id: string;
  imageUrl: string;
  caption: string;
  userId: string;
  userName: string;
  likes: string[];
  createdAt: Timestamp;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Timestamp;
}

export interface User {
  uid: string;
  biography?: string;
  userName: string;
  email: string;
  photoURL: string | null;
  createdAt: Date;
}
