"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";

const DEFAULT_PROFILE_IMAGE = "/default-profile.png";

export default function EditProfilePage({ userId }: { userId: string }) {
  const [userName, setUserName] = useState("");
  const [biography, setBiography] = useState("");
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserName(data.userName || "");
        setBiography(data.biography || "");
        setPhotoURL(data.photoURL || null);
      }
    };

    fetchData();
  }, [userId]);

  const handleSave = async () => {
    setLoading(true);

    let uploadedImageUrl = photoURL;

    if (file) {
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
      uploadedImageUrl = data.secure_url;
    }

    await updateDoc(doc(db, "users", userId), {
      userName,
      biography,
      photoURL: uploadedImageUrl,
    });

    setLoading(false);
    router.push(`/profile/${userId}`);
  };

  return (
    <div className="max-w-md mx-auto p-6">
      {/* Photo */}
      <div className="flex flex-col items-center mb-4">
        <Image
          src={photoURL || DEFAULT_PROFILE_IMAGE}
          alt="Foto de perfil"
          width={100}
          height={100}
          className="rounded-full object-cover mb-2"
        />
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>

      {/* Name */}
      <label className="block text-sm font-medium mb-1">Nome</label>
      <Input
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        className="mb-4"
      />

      {/* Biography */}
      <label className="block text-sm font-medium mb-1">Biografia</label>
      <Textarea
        value={biography}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          setBiography(e.target.value)
        }
        className="mb-4"
        placeholder="Fala um pouco sobre ti..."
      />

      <Button onClick={handleSave} disabled={loading} className="w-full">
        {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
        Guardar alterações
      </Button>
    </div>
  );
}
