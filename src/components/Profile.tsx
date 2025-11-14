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
import { Loader2, Plus, Settings, LogOut } from "lucide-react";
import { db, auth } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  addDoc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, getAuth, onAuthStateChanged } from "firebase/auth";
import { Post, Comment } from "../app/types/index";
import PostModal from "./PostModal";

const DEFAULT_PROFILE_IMAGE = "/default-profile.png";

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
  const [currentUserName, setCurrentUserName] = useState<string>("");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [currentPostIndex, setCurrentPostIndex] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
        setCurrentUserName(user.displayName || "Utilizador");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserPhotoURL(data.photoURL || null);
        setUserName(data.userName || "Nome não disponível");
        setBiography(data.biography || null);
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

    fetchUserData();
    fetchPostsData();
  }, [userId]);

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

  // Sincronizar índice quando selectedPostId mudar
  useEffect(() => {
    if (selectedPostId) {
      const postIndex = posts.findIndex((p) => p.id === selectedPostId);
      if (postIndex !== -1) {
        setCurrentPostIndex(postIndex);
      }
    }
  }, [selectedPostId, posts]);

  const handleCommentSubmit = async (postId: string) => {
    const commentText = newComments[postId];
    if (!commentText?.trim()) return;

    try {
      await addDoc(collection(db, "comments"), {
        postId,
        userId: currentUserId,
        userName: currentUserName,
        text: commentText,
        userAvatar: auth.currentUser?.photoURL || "/default-avatar.png",
        createdAt: serverTimestamp(),
      });

      setNewComments((prev) => ({ ...prev, [postId]: "" }));
      // Comments will be updated automatically via onSnapshot
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
    }
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
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!data.secure_url) throw new Error("Upload failed");

      await updateDoc(doc(db, "users", userId), {
        photoURL: data.secure_url,
      });

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
    await updateDoc(doc(db, "users", userId), {
      photoURL: null,
    });
    setUserPhotoURL(null);
    setOpen(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  function openPostModal(post: Post) {
    const postIndex = posts.findIndex((p) => p.id === post.id);
    if (postIndex !== -1) {
      setCurrentPostIndex(postIndex);
      setSelectedPostId(post.id);
    }
  }

  const handleNextPost = () => {
    if (currentPostIndex < posts.length - 1) {
      const nextIndex = currentPostIndex + 1;
      setCurrentPostIndex(nextIndex);
      setSelectedPostId(posts[nextIndex].id);
    }
  };

  const handlePreviousPost = () => {
    if (currentPostIndex > 0) {
      const prevIndex = currentPostIndex - 1;
      setCurrentPostIndex(prevIndex);
      setSelectedPostId(posts[prevIndex].id);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deleteDoc(doc(db, "posts", postId));
      // Atualizar a lista de posts removendo o post deletado
      const updatedPosts = posts.filter((p) => p.id !== postId);
      setPosts(updatedPosts);
      setPostCount(updatedPosts.length);

      // Se o post deletado era o que estava aberto, fechar o modal
      if (selectedPostId === postId) {
        setSelectedPostId(null);
      } else {
        // Ajustar o índice se necessário
        const deletedIndex = posts.findIndex((p) => p.id === postId);
        if (deletedIndex !== -1 && deletedIndex < currentPostIndex) {
          setCurrentPostIndex(currentPostIndex - 1);
        }
      }
    } catch (error) {
      console.error("Erro ao excluir post:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4">
      <div className="w-full flex items-center justify-start px-4 py-4">
        <Link href="/feed">
          <Image
            src="/mini-instagram-logo.png"
            alt="Mini Instagram"
            width={90}
            height={90}
            className="cursor-pointer"
          />
        </Link>
      </div>
      <div className="flex items-center justify-center gap-8 mb-8">
        {/* Profile Photo */}
        <div className="flex flex-col items-center">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <div className="relative w-32 h-32">
                <Image
                  src={
                    userPhotoURL ||
                    auth.currentUser?.photoURL ||
                    DEFAULT_PROFILE_IMAGE
                  }
                  alt="Foto de perfil"
                  fill
                  className="object-cover rounded-full"
                />
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Fotografia</DialogTitle>
              </DialogHeader>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={handleUploadPhoto}
                  disabled={uploading || !file}
                >
                  {uploading && (
                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                  )}
                  Carregar nova
                </Button>
                <Button variant="destructive" onClick={handleRemovePhoto}>
                  Remover
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* User info */}
        <div className="text-left space-y-2">
          <h2 className="text-2xl font-semibold flex items-center gap-4">
            {userName}

            <Button
              variant="secondary"
              onClick={() => router.push(`/edit-profile/${userId}`)}
            >
              Editar Perfil
            </Button>

            <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="w-5 h-5" />
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Definições</DialogTitle>
                </DialogHeader>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Terminar Sessão
                </Button>
              </DialogContent>
            </Dialog>
          </h2>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">{postCount}</span> publicações
          </p>

          {biography && (
            <p className="text-sm text-muted-foreground max-w-md whitespace-pre-line">
              {biography}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center py-10">
        <Link href="/upload">
          <Button
            variant="outline"
            className="rounded-full w-16 h-16 p-0 flex items-center justify-center"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </Link>
        <span className="text-sm mt-2 text-muted-foreground">Novo</span>
      </div>

      <Separator className="w-full my-8" />

      <h3 className="text-xl font-semibold">Publicações</h3>

      {/* Post Grid */}
      <div className="w-full overflow-x-auto mt-8">
        <div className="flex gap-[4px] min-w-max">
          {posts.length > 0 ? (
            posts.map((post, index) => (
              <div
                key={post.id || index}
                onClick={() => openPostModal(post)} // chama o modal ao clicar
                className="bg-gray-200 rounded-lg overflow-hidden shadow-md min-w-[calc(100%/3-1rem)] max-w-[calc(100%/3-1rem)] cursor-pointer"
              >
                <Image
                  src={post.imageUrl || "/default-post.png"}
                  alt={`Post ${index + 1}`}
                  width={400}
                  height={300}
                  className="object-cover w-full h-full"
                />
              </div>
            ))
          ) : (
            <p className="text-gray-500">Nenhum post encontrado.</p>
          )}
        </div>
      </div>
      {selectedPostId &&
        (() => {
          const currentPost = posts.find((p) => p.id === selectedPostId);
          const currentPostComments = comments
            .filter((comment) => comment.postId === selectedPostId)
            .sort(
              (a, b) =>
                (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)
            );

          if (!currentPost) return null;

          const hasNext = currentPostIndex < posts.length - 1;
          const hasPrevious = currentPostIndex > 0;

          return (
            <PostModal
              currentUserId={currentUserId}
              post={currentPost}
              comments={currentPostComments}
              isOpen={!!selectedPostId}
              onClose={() => setSelectedPostId(null)}
              newComments={newComments}
              setNewComments={setNewComments}
              handleCommentSubmit={handleCommentSubmit}
              onNext={handleNextPost}
              onPrevious={handlePreviousPost}
              hasNext={hasNext}
              hasPrevious={hasPrevious}
              onDeletePost={handleDeletePost}
            />
          );
        })()}
    </div>
  );
}
