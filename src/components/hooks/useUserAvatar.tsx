import { useEffect, useState } from "react";
import { db } from "@/lib/firebase-client";
import { getDoc, doc } from "firebase/firestore";

export function useUserAvatar(userId: string) {
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    async function fetchAvatar() {
      const ref = doc(db, "users", userId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setAvatar(snap.data().photoURL || null);
      }
    }

    fetchAvatar();
  }, [userId]);

  return avatar;
}
