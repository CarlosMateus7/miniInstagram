import { Timestamp } from "firebase/firestore";

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
  userAvatar: string;
}

export interface User {
  uid: string;
  biography?: string;
  userName: string;
  email: string;
  photoURL: string | null;
  createdAt: Date;
}
