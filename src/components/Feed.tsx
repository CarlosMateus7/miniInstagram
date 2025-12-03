"use client";

import { useEffect, useState } from "react";
import {
  onSnapshot,
  orderBy,
  addDoc,
  serverTimestamp,
  getDoc,
  doc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  deleteDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import PostModal from "./PostModal";
import { Comment, Post } from "@/app/types";
import DeleteModal from "./DeleteModal";
import PostOptionModal from "./PostOptionModal";
import PostCard from "./PostCard";
import EditPostModal from "./EditPostModal";
import FeedSearch from "./FeedSearch";

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComments, setNewComments] = useState<{ [postId: string]: string }>(
    {}
  );
  const [userName, setUserName] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPostIdForOptions, setSelectedPostIdForOptions] = useState<
    string | null
  >(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string>("/default-avatar.png");
  const router = useRouter();
  const pathname = usePathname();
  const [isEditing, setIsEditing] = useState(false);
  const [localPost, setLocalPost] = useState<Post | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUserId(user.uid);

        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists()) {
          const data = userDoc.data();

          setUserName(data.userName || "User");
          setUserAvatar(data.photoURL);
        } else {
          setUserName(user.displayName || "User");
          setUserAvatar(user.photoURL || "");
        }
      }
    });

    return () => unsubscribe();
  }, []);

  function openModal(post: Post) {
    setSelectedPostId(post.id);
    setIsModalOpen(true);
  }

  // Load Posts
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedPosts = snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<Post, "id">;
        return {
          id: doc.id,
          ...data,
        };
      });
      setPosts(updatedPosts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load Comments
  useEffect(() => {
    const q = query(collection(db, "comments"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allComments = snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<Comment, "id">;
        return {
          id: doc.id,
          ...data,
        };
      });
      setComments(allComments);
    });

    return () => unsubscribe();
  }, []);

  const handleCommentSubmit = async (postId: string) => {
    const commentText = newComments[postId];
    if (!commentText?.trim()) return;

    try {
      await addDoc(collection(db, "comments"), {
        postId,
        userId: currentUserId,
        userName,
        text: commentText,
        userAvatar: userAvatar,
        createdAt: serverTimestamp(),
      });

      setNewComments((prev) => ({ ...prev, [postId]: "" }));
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDeletePost = async () => {
    if (!selectedPostIdForOptions) return;

    try {
      const postId = selectedPostIdForOptions;

      const commentsQuery = query(
        collection(db, "comments"),
        where("postId", "==", postId)
      );

      console.log(postId);

      console.log(commentsQuery);
      const commentsSnapshot = await getDocs(commentsQuery);

      if (!commentsSnapshot.empty) {
        const batch = writeBatch(db);

        commentsSnapshot.forEach((commentDoc) => {
          batch.delete(commentDoc.ref);
        });

        const postRef = doc(db, "posts", postId);
        batch.delete(postRef);

        await batch.commit();
      } else {
        await deleteDoc(doc(db, "posts", postId));
      }

      setShowDeleteModal(false);
      setSelectedPostIdForOptions(null);
    } catch (error) {
      console.error("Error deleting post and comments:", error);
    }
  };

  return (
    <>
      <div className="grid grid-cols-12 gap-6 mt-10 px-4">
        <div className="col-span-3">
          <div className="w-full flex items-center justify-start px-4 py-4">
            <Link href="/feed">
              <Image
                src="/picshare-logo.png"
                alt="Picshare"
                sizes="100vw"
                priority
                width={90}
                height={90}
                className="cursor-pointer"
              />
            </Link>
          </div>
        </div>
        <div className="col-span-6 space-y-6 mt-[95px]">
          <FeedSearch currentUserId={currentUserId} />
          {/* Delete Post Modal */}
          {showDeleteModal && (
            <DeleteModal
              isOpen={showDeleteModal}
              onClose={() => setShowDeleteModal(false)}
              onConfirm={handleDeletePost}
            />
          )}

          {/* Loading */}
          {loading
            ? [...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-[300px] w-full rounded-md" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </CardContent>
                </Card>
              ))
            : posts.map((post) => {
                const postComments = comments
                  .filter((comment) => comment.postId === post.id)
                  .sort((a, b) => a.createdAt?.seconds - b.createdAt?.seconds);

                return (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={currentUserId}
                    postComments={postComments}
                    newComments={newComments}
                    setNewComments={setNewComments}
                    handleCommentSubmit={handleCommentSubmit}
                    openModal={openModal}
                    setSelectedPostIdForOptions={setSelectedPostIdForOptions}
                    setShowOptionsModal={setShowOptionsModal}
                  />
                );
              })}
        </div>

        <div className="col-span-3 flex justify-center items-start pt-2">
          {currentUserId && (
            <div
              onClick={() => router.push(`/profile/${currentUserId}`)}
              className="flex items-center gap-[10px] mt-[45px] cursor-pointer hover:opacity-80 "
            >
              <div className="relative w-10 h-10">
                <Image
                  src={userAvatar || "/default-avatar.png"}
                  alt="Avatar"
                  priority
                  width={40}
                  height={40}
                  className="object-cover rounded-full h-10"
                />
              </div>
              <span className="text-sm font-medium">{userName || "User"}</span>
            </div>
          )}
        </div>
      </div>

      {showOptionsModal && selectedPostIdForOptions && (
        <PostOptionModal
          isOpen={showOptionsModal}
          onClose={() => setShowOptionsModal(false)}
          onEdit={() => {
            const postToEdit = posts.find(
              (p) => p.id === selectedPostIdForOptions
            );
            if (postToEdit) setLocalPost(postToEdit);

            setIsEditing(true);
            setShowOptionsModal(false);
          }}
          onDelete={() => {
            setShowDeleteModal(true);
            setShowOptionsModal(false);
          }}
          onCopyLink={() => {
            setShowOptionsModal(false);
            const postUrl = `${window.location.origin}/feed/postId/${selectedPostIdForOptions}`;
            navigator.clipboard.writeText(postUrl);
          }}
        />
      )}

      {/* open when click on comment*/}
      {isModalOpen &&
        selectedPostId &&
        (() => {
          const currentPost = posts.find((p) => p.id === selectedPostId);
          const currentPostComments = comments
            .filter((comment) => comment.postId === selectedPostId)
            .sort(
              (a, b) =>
                (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)
            );

          if (!currentPost) return null;

          return (
            <PostModal
              currentUserId={currentUserId}
              post={currentPost}
              comments={currentPostComments}
              isOpen={isModalOpen}
              onClose={() => router.replace(pathname)}
              newComments={newComments}
              setNewComments={setNewComments}
            />
          );
        })()}

      {isEditing && localPost && (
        <EditPostModal
          post={localPost}
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          onUpdatePost={(updatedPost) => {
            setPosts((prev) =>
              prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
            );

            setLocalPost(updatedPost);
            setIsEditing(false);
          }}
        />
      )}
    </>
  );
}
