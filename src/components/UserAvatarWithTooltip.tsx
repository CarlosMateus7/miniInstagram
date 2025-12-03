import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";
import { useEffect, useState } from "react";
import { User } from "@/app/types";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase-client";

interface UserAvatarWithTooltipProps {
  user: User;
}

export function UserAvatarWithTooltip({ user }: UserAvatarWithTooltipProps) {
  console.log(user);
  const [postCount, setPostCount] = useState(0);

  useEffect(() => {
    const fetchPostCount = async () => {
      if (!user?.uid) return;

      const q = query(collection(db, "posts"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      setPostCount(snapshot.size);
    };

    fetchPostCount();
  }, [user?.uid]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Image
            src={user.photoURL || "/default-avatar.png"}
            width={40}
            height={40}
            className="rounded-full cursor-pointer"
            alt="avatar"
          />
        </TooltipTrigger>

        <TooltipContent className="p-3 text-sm shadow-lg border rounded-md bg-white">
          <p>
            <strong>{user.userName}</strong>
          </p>
          <p className="text-xs text-gray-600">Posts: {postCount}</p>
          <p className="text-xs text-gray-600">
            Followers: {user.followers?.length ?? 0}
          </p>
          <p className="text-xs text-gray-600">
            Following: {user.following?.length ?? 0}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
