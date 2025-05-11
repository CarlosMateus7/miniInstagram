"use client";
import Feed from "@/components/Feed";

export default function FeedPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Feed</h1>
      <Feed />
    </main>
  );
}
