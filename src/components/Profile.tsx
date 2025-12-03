"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Plus,
  Settings,
  LogOut,
  Heart,
  MessageCircle,
} from "lucide-react";
import { db, auth } from "@/lib/firebase-client";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { signOut, getAuth, onAuthStateChanged } from "firebase/auth";
import { Post, Comment } from "../app/types/index";
import PostModal from "./PostModal";
import UserListModal from "./UserListModal";

const DEFAULT_PROFILE_IMAGE = "/default-avatar.png";

function getDateFromFirestore(
  value?: Timestamp | Date | string | number
): Date {
  if (!value) return new Date(0);
  if (value instanceof Date) return value;
  if (typeof value === "object" && value !== null && "toDate" in value) {
    return (value as Timestamp).toDate();
  }
  return new Date(value);
}

export default function ProfilePage({ userId }: { userId: string }) {
  const [userPhotoURL, setUserPhotoURL] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [biography, setBiography] = useState<string | null>(null);
  const [postCount, setPostCount] = useState<number>(0);
  const [posts, setPosts] = useState<Post[]>([]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComments, setNewComments] = useState<{ [postId: string]: string }>(
    {}
  );
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [, setCurrentUserName] = useState<string>("");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [currentPostIndex, setCurrentPostIndex] = useState<number>(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const postIdFromUrl = searchParams.get("post");

  const sortedPosts = [...posts].sort(
    (a, b) =>
      getDateFromFirestore(b.createdAt).getTime() -
      getDateFromFirestore(a.createdAt).getTime()
  );

  useEffect(() => {
    if (!postIdFromUrl || sortedPosts.length === 0) return;

    const index = sortedPosts.findIndex((p) => p.id === postIdFromUrl);
    if (index !== -1) {
      setSelectedPostId(postIdFromUrl);
      setCurrentPostIndex(index);
    }
  }, [postIdFromUrl, sortedPosts]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
        setCurrentUserName(user.displayName || "User");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    const fetchData = async () => {
      const userDoc = await getDoc(doc(db, "users", userId));
      const currentDoc = await getDoc(doc(db, "users", currentUserId));

      if (userDoc.exists() && currentDoc.exists()) {
        const profileData = userDoc.data();
        const currentData = currentDoc.data();

        setUserPhotoURL(profileData.photoURL || null);
        setUserName(profileData.userName || "Name not available");
        setBiography(profileData.biography || null);
        setFollowersCount(profileData.followers?.length || 0);

        if (userId === currentUserId) {
          setFollowingCount(currentData.following?.length || 0);
        } else {
          setFollowingCount(profileData.following?.length || 0);
          setIsFollowing(profileData.followers?.includes(currentUserId));
        }
      }
    };

    const fetchPostsData = async () => {
      const q = query(collection(db, "posts"), where("userId", "==", userId));
      const snapshot = await getDocs(q);
      const postsData: Post[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
      setPosts(postsData);
      setPostCount(postsData.length);
    };

    fetchData();
    fetchPostsData();
  }, [userId, currentUserId]);

  // Load comments
  useEffect(() => {
    const q = query(collection(db, "comments"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allComments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Comment, "id">),
      }));
      setComments(allComments);
    });
    return () => unsubscribe();
  }, []);

  const closePostModal = () => {
    setSelectedPostId(null);
    router.replace(pathname);
  };

  const hasNext = currentPostIndex < sortedPosts.length - 1;
  const hasPrevious = currentPostIndex > 0;

  const handleNextPost = () => {
    if (!hasNext) return;
    const nextPostId = sortedPosts[currentPostIndex + 1].id;
    setSelectedPostId(nextPostId);
    setCurrentPostIndex(currentPostIndex + 1);

    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("post", nextPostId);
    router.replace(`${pathname}?${newParams.toString()}`);
  };

  const handlePreviousPost = () => {
    if (!hasPrevious) return;
    const prevPostId = sortedPosts[currentPostIndex - 1].id;
    setSelectedPostId(prevPostId);
    setCurrentPostIndex(currentPostIndex - 1);

    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("post", prevPostId);
    router.replace(`${pathname}?${newParams.toString()}`);
  };

  const handleUploadPhoto = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "unsigned_preset");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dgapgiwov/image/upload",
        { method: "POST", body: formData }
      );

      const data = await res.json();
      if (!data.secure_url) throw new Error("Upload failed");

      await updateDoc(doc(db, "users", userId), { photoURL: data.secure_url });
      setUserPhotoURL(data.secure_url);
      setFile(null);
      setOpen(false);
    } catch (err) {
      console.error("Erro no upload:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    await updateDoc(doc(db, "users", userId), { photoURL: null });
    setUserPhotoURL(null);
    setOpen(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const handleFollowToggle = async () => {
    if (!currentUserId || currentUserId === userId) return;

    const profileRef = doc(db, "users", userId);
    const currentRef = doc(db, "users", currentUserId);

    const [profileSnap, currentSnap] = await Promise.all([
      getDoc(profileRef),
      getDoc(currentRef),
    ]);

    if (!profileSnap.exists() || !currentSnap.exists()) return;

    const profileData = profileSnap.data();
    const currentData = currentSnap.data();

    const newFollowers = [...(profileData.followers || [])];

    if (isFollowing) {
      // Unfollow
      const idx = newFollowers.indexOf(currentUserId);
      if (idx !== -1) newFollowers.splice(idx, 1);
      setFollowersCount(newFollowers.length);
      setIsFollowing(false);
    } else {
      // Follow
      if (!newFollowers.includes(currentUserId))
        newFollowers.push(currentUserId);
      setFollowersCount(newFollowers.length);
      setIsFollowing(true);
    }

    await updateDoc(profileRef, { followers: newFollowers });

    const updatedFollowing = [...(currentData.following || [])];

    if (isFollowing) {
      const idx = updatedFollowing.indexOf(userId);
      if (idx !== -1) updatedFollowing.splice(idx, 1);
    } else {
      if (!updatedFollowing.includes(userId)) updatedFollowing.push(userId);
    }

    await updateDoc(currentRef, { following: updatedFollowing });
  };

  const onClose = () => setOpen(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4">
      {/* Header */}
      <div className="w-full flex items-center justify-start px-4 py-4 w-32 h-32">
        <Link href="/feed">
          <Image
            src="/picshare-logo.png"
            alt="Picshare"
            sizes="(max-width: 768px) 90pxw, 90px"
            width={90}
            height={90}
            className="cursor-pointer"
          />
        </Link>
      </div>

      {/* Profile Info */}
      <div className="flex items-center justify-center gap-8">
        <div className="flex flex-col items-center cursor-pointer">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <div className="relative w-32 h-32">
                <Image
                  src={userPhotoURL || DEFAULT_PROFILE_IMAGE}
                  alt="Foto de perfil"
                  fill
                  sizes="(max-width: 768px) 100vw, 600px"
                  className="object-cover rounded-full"
                />
              </div>
            </DialogTrigger>
            <DialogContent aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle>Edit Profile Photo</DialogTitle>
              </DialogHeader>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleUploadPhoto}
                  disabled={uploading || !file}
                  variant="outline"
                >
                  {uploading && (
                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                  )}
                  CLoad new
                </Button>
                <Button variant="destructive" onClick={handleRemovePhoto}>
                  Delete
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="text-left space-y-2">
          <h2 className="text-2xl font-semibold flex items-center gap-4">
            {userName}
            <Button
              variant="secondary"
              onClick={() => router.push(`/edit-profile/${userId}`)}
            >
              Edit Profile
            </Button>

            {currentUserId === userId && (
              <Dialog
                open={logoutDialogOpen}
                onOpenChange={setLogoutDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="w-5 h-5" />
                  </Button>
                </DialogTrigger>

                <DialogContent aria-describedby={undefined}>
                  <DialogHeader>
                    <DialogTitle>Definitions</DialogTitle>
                  </DialogHeader>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    End Session
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setLogoutDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </DialogContent>
              </Dialog>
            )}
          </h2>

          <div className="text-sm text-muted-foreground flex gap-4">
            <p>
              <span className="font-medium">{postCount}</span>{" "}
              {postCount === 1 ? "Post" : "Posts"}
            </p>

            <p
              className="cursor-pointer"
              onClick={() => setShowFollowers(true)}
            >
              <span className="font-medium">{followersCount}</span> Followers
            </p>

            <p
              className="cursor-pointer"
              onClick={() => setShowFollowing(true)}
            >
              <span className="font-medium">{followingCount}</span> Following
            </p>
          </div>

          {currentUserId !== userId && (
            <Button
              variant={isFollowing ? "secondary" : "default"}
              onClick={handleFollowToggle}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </Button>
          )}

          {biography && (
            <p className="text-sm text-muted-foreground max-w-md whitespace-pre-line">
              {biography}
            </p>
          )}
        </div>
      </div>

      {/* Upload new post */}
      {currentUserId === userId && (
        <div className="flex flex-col items-center py-10">
          <Link href={`/upload/${currentUserId}`}>
            <Button
              variant="outline"
              className="rounded-full w-16 h-16 p-0 flex items-center justify-center"
            >
              <Plus className="w-6 h-6" />
            </Button>
          </Link>
          <span className="text-sm mt-2 text-muted-foreground">New</span>
        </div>
      )}

      <Separator className="w-full my-8" />

      <h3 className="text-xl font-semibold">
        {postCount > 1 ? "Posts" : "Post"}
      </h3>

      {/* Post Grid */}
      <div className="w-full mt-8">
        <div className="grid grid-cols-3 gap-2">
          {sortedPosts.length > 0 ? (
            sortedPosts.map((post, index) => (
              <div
                key={post.id}
                onClick={() =>
                  router.push(`/profile/${userId}/post/${post.id}`)
                }
                className="bg-gray-200 rounded-lg overflow-hidden shadow-md w-full aspect-square relative cursor-pointer group"
              >
                <Image
                  src={post.imageUrl || "/default-post.png"}
                  alt={`Post ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 600px"
                  className="object-cover"
                />

                {/* Overlay hover */}
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-6 text-white text-sm font-medium">
                  <div className="flex items-center gap-1">
                    <Heart className="w-5 h-5" />
                    <span>{post.likes.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-5 h-5" />
                    <span>
                      {comments.filter((c) => c.postId === post.id).length}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 col-span-3 text-center">
              There are no posts.
            </p>
          )}
        </div>
      </div>

      {/* Post Modal */}
      {selectedPostId && (
        <PostModal
          currentUserId={currentUserId}
          post={sortedPosts[currentPostIndex]}
          comments={comments
            .filter((c) => c.postId === selectedPostId)
            .sort(
              (a, b) =>
                (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)
            )}
          isOpen={!!selectedPostId}
          onClose={closePostModal}
          newComments={newComments}
          setNewComments={setNewComments}
          onNext={handleNextPost}
          onPrevious={handlePreviousPost}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
        />
      )}

      <UserListModal
        userId={userId}
        type="followers"
        open={showFollowers}
        onClose={() => setShowFollowers(false)}
      />

      <UserListModal
        userId={userId}
        type="following"
        open={showFollowing}
        onClose={() => setShowFollowing(false)}
      />
    </div>
  );
}
