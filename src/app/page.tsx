"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redireciona para a página de login assim que o app for carregado
    router.push("/login");
  }, [router]);

  return null; // ou algum conteúdo carregando
}
