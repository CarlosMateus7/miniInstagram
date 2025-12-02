import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchUserList } from "@/lib/fetchUserList";

interface ListedUser {
  id: string;
  userName: string;
  photoURL: string;
}

interface UserListModalProps {
  userId: string;
  type: "followers" | "following";
  open: boolean;
  onClose: () => void;
}

export default function UserListModal({
  userId,
  type,
  open,
  onClose,
}: UserListModalProps) {
  const [list, setList] = useState<ListedUser[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) loadList();
  }, [open, userId, type]);

  const loadList = async () => {
    const data = await fetchUserList(userId, type);
    setList(data);
  };

  const filtered = list.filter((u) =>
    u.userName.toLowerCase().includes(query.toLowerCase())
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 w-96 max-h-[80vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 capitalize">{type}</h2>

        <input
          type="text"
          placeholder="Search username..."
          className="w-full p-2 border rounded mb-4"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="flex flex-col gap-3">
          {filtered.map((user) => (
            <Link
              key={user.id}
              href={`/profile/${user.id}`}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded"
            >
              <Image
                src={user.photoURL ?? "/default-avatar.png"}
                width={40}
                height={40}
                className="rounded-full object-cover h-10"
                alt="avatar"
              />
              <span className="font-medium">{user.userName}</span>
            </Link>
          ))}

          {filtered.length === 0 && (
            <p className="text-gray-500 text-center py-6">No users found</p>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full p-2 bg-black text-white rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
}
