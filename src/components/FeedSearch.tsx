import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchUserList } from "@/lib/fetchUserList";
import { UserAvatarWithTooltip } from "./UserAvatarWithTooltip";
import { User } from "@/app/types";

export default function FeedSearch({
  currentUserId,
}: {
  currentUserId: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [searchHistory, setSearchHistory] = useState<User[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
      return;
    }

    const loadUsers = async () => {
      const allUsers = await fetchUserList(currentUserId, "following");
      const filtered = allUsers.filter((u) =>
        u.userName.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    };

    loadUsers();
  }, [query, currentUserId]);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectUser = (user: User) => {
    // evita duplicados
    setSearchHistory((prev) => [
      user,
      ...prev.filter((u) => u.uid !== user.uid),
    ]);

    setShowDropdown(false);
    setQuery("");
  };

  const removeFromHistory = (uid: string) => {
    setSearchHistory((prev) => prev.filter((u) => u.uid !== uid));
  };

  return (
    <div className="relative w-full mb-6" ref={wrapperRef}>
      {/* INPUT */}
      <input
        type="text"
        placeholder="Search users..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
        }}
        className="w-full p-2 border rounded-lg"
      />

      {/* DROPDOWN */}
      {showDropdown && (
        <div className="absolute top-full left-0 w-full bg-white border rounded-lg shadow-lg mt-2 z-50 max-h-60 overflow-y-auto">
          {/* HISTÓRICO */}
          {searchHistory.length > 0 && query.length === 0 && (
            <div className="p-2 border-b">
              <p className="text-xs font-semibold text-gray-500 mb-1">
                Recent searches
              </p>

              {searchHistory.map((user) => (
                <div
                  key={user.uid}
                  className="flex items-center justify-between px-2 py-1 hover:bg-gray-100 rounded"
                >
                  {/* Avatar + Username */}
                  <div className="flex items-center gap-2">
                    <Image
                      src={user.photoURL || "/default-avatar.png"}
                      width={30}
                      height={30}
                      className="rounded-full"
                      alt="avatar"
                    />
                    <span className="text-sm">{user.userName}</span>
                  </div>

                  {/* Ações: View Profile + X */}
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/profile/${user.uid}`}
                      className="text-blue-600 text-xs hover:underline"
                      onClick={() => handleSelectUser(user)}
                    >
                      View Profile →
                    </Link>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromHistory(user.uid);
                      }}
                      className="text-gray-400 hover:text-black text-lg font-bold flex items-center justify-center w-5 h-5"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* RESULTADOS */}
          {results.map((user, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-2 py-1 hover:bg-gray-100 rounded"
            >
              {/* Avatar + Username */}
              <div className="flex items-center gap-2">
                <UserAvatarWithTooltip user={user} />
                <span className="text-sm">{user.userName}</span>
              </div>

              {/* Ações: View Profile + X */}
              <div className="flex items-center gap-3">
                <Link
                  href={`/profile/${user.uid}`}
                  className="text-blue-600 text-xs hover:underline"
                  onClick={() => handleSelectUser(user)}
                >
                  View Profile →
                </Link>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromHistory(user.uid);
                  }}
                  className="text-gray-400 hover:text-black text-lg font-bold flex items-center justify-center w-5 h-5"
                >
                  ×
                </button>
              </div>
            </div>
          ))}

          {results.length === 0 && query.length > 0 && (
            <p className="text-center py-3 text-gray-500 text-sm">
              No users found
            </p>
          )}
        </div>
      )}
    </div>
  );
}
