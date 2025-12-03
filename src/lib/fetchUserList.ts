import { db } from "@/lib/firebase-client";
import { doc, getDoc } from "firebase/firestore";
import { User } from "@/app/types";

export async function fetchUserList(
  userId: string,
  type: "followers" | "following"
): Promise<User[]> {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return [];

  const data = userSnap.data();
  const ids: string[] = data[type] || []; // array de IDs

  const list: User[] = [];

  for (const uid of ids) {
    const uRef = doc(db, "users", uid);
    const uSnap = await getDoc(uRef);

    if (uSnap.exists()) {
      const uData = uSnap.data();
      list.push({
        uid,
        userName: uData.userName || "Unknown",
        photoURL: uData.photoURL || null,
        biography: uData.biography || "",
        followers: uData.followers || [],
        following: uData.following || [],
      });
    }
  }

  return list;
}
