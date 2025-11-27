"use client";

import { useState } from "react";
import { auth } from "../lib/firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  getFirestore,
  getDoc,
  doc,
} from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import Image from "next/image";

export default function PostUploader({ userId }: { userId: string }) {
  const [caption, setCaption] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const db = getFirestore();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!imageFile || !auth.currentUser) return;

    setLoading(true);

    try {
      // Upload ao Cloudinary
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("upload_preset", "unsigned_preset");
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dgapgiwov/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      const imageUrl = data.secure_url;

      // Valores do Firestore (NÃO do Google)
      const userDoc = await getDoc(doc(db, "users", userId));
      const userData = userDoc.exists() ? userDoc.data() : {};

      const postUserName = userData.userName || "Utilizador";

      await addDoc(collection(db, "posts"), {
        imageUrl,
        caption,
        userId: userId,
        userName: postUserName,
        createdAt: serverTimestamp(),
        likes: [],
      });

      setCaption("");
      setImageFile(null);
      router.push("/feed");
    } catch (err) {
      console.error("Erro ao fazer upload:", err);
    }

    setLoading(false);
  };

  return (
    <Card className="max-w-xl mx-auto mt-8">
      <CardContent className="space-y-4 p-6">
        <h2 className="text-xl font-bold">Criar Post</h2>

        <Input
          type="file"
          accept="image/*"
          className="cursor-pointer"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setImageFile(file);
              setPreviewUrl(URL.createObjectURL(file));
            }
          }}
        />

        {previewUrl && (
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden">
            <Image
              src={previewUrl}
              alt="Post"
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              priority
              className="object-cover"
            />
          </div>
        )}

        <Textarea
          placeholder="Legenda"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
          className="mr-4"
        >
          Cancelar
        </Button>

        <Button onClick={handleUpload} disabled={loading || !imageFile}>
          {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
          Publicar
        </Button>
      </CardContent>
    </Card>
  );
}
