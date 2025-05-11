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
import { Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator"; // Importando o separator da shadcn

const DEFAULT_PROFILE_IMAGE = "/default-profile.png";

export default function ProfilePage({ userId }: { userId: string }) {
  const [userPhotoURL, setUserPhotoURL] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>(""); // Para armazenar o nome do usuário
  const [postCount, setPostCount] = useState<number>(0);
  const [posts, setPosts] = useState<any[]>([]); // Para armazenar os posts do usuário
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserPhotoURL(data.photoURL || null);
        setUserName(data.userName || "Nome não disponível"); // Adicionando nome do usuário
      }
    };

    const fetchPostsData = async () => {
      const q = query(collection(db, "posts"), where("userId", "==", userId));
      const snapshot = await getDocs(q);
      const postsData = snapshot.docs.map((doc) => doc.data());
      setPosts(postsData);
      setPostCount(postsData.length);
    };

    fetchUserData();
    fetchPostsData();
  }, [userId]);

  const handleUploadPhoto = async () => {
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "unsigned_preset"); // substitua com o preset correto do Cloudinary

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="flex items-center justify-center gap-8 mb-8">
        {/* Foto de perfil */}
        <div className="flex flex-col items-center">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <div className="w-32 h-32 rounded-full overflow-hidden border shadow-md cursor-pointer">
                <Image
                  src={userPhotoURL || DEFAULT_PROFILE_IMAGE}
                  alt="Foto de perfil"
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
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

          <p className="text-sm text-muted-foreground mt-2">
            Clique na imagem para editar
          </p>
        </div>

        {/* Informações do usuário */}
        <div className="text-left">
          <h2 className="text-2xl font-semibold">{userName}</h2>{" "}
          {/* Exibindo o nome do usuário */}
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-medium">{postCount}</span> publicações
          </p>
        </div>
      </div>

      {/* Risco Horizontal com Separator da Shadcn */}
      <Separator className="w-full my-8" />

      {/* Título de Publicações */}
      <h3 className="text-xl font-semibold">Publicações</h3>

      {/* Grid de Posts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {posts.length > 0 ? (
          posts.map((post, index) => (
            <div
              key={index}
              className="bg-gray-200 rounded-lg overflow-hidden shadow-md"
            >
              <Image
                src={post.imageUrl || "/default-post.png"} // Substitua com o campo de imagem correto do post
                alt={`Post ${index + 1}`}
                width={400}
                height={300}
                className="object-cover w-full h-full"
              />
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">Nenhum post encontrado.</p>
        )}
      </div>
    </div>
  );
}
