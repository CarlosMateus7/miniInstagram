"use client";

import { useState } from "react";
import { auth, db } from "../lib/firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  getFirestore,
} from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PostUploader() {
  const [caption, setCaption] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const db = getFirestore();

  const handleUpload = async () => {
    if (!imageFile || !auth.currentUser) return;

    setLoading(true);

    try {
      // 🔁 Upload to Cloudinary
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
      const user = auth.currentUser;
      const { displayName, uid } = user;

      // Save post on Firestore
      await addDoc(collection(db, "posts"), {
        imageUrl,
        caption,
        userId: uid,
        userName: displayName,
        createdAt: serverTimestamp(),
        likes: [],
      });

      // Clean the fields
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
          onChange={(e) => {
            if (e.target.files?.[0]) setImageFile(e.target.files[0]);
          }}
        />

        <Textarea
          placeholder="Legenda"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        <Button onClick={handleUpload} disabled={loading || !imageFile}>
          {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
          Publicar
        </Button>
      </CardContent>
    </Card>
  );
}
