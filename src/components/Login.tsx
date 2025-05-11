"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
} from "../lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase"; // Importando o Firestore

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Função para criar o perfil no Firestore
  const createUserProfile = async (user) => {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Criar um novo perfil se o usuário ainda não tiver um
      await setDoc(userRef, {
        userName: user.displayName || "Usuário sem nome",
        email: user.email,
        photoURL: user.photoURL || null,
        createdAt: new Date(),
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Criar o perfil do usuário no Firestore
      await createUserProfile(user);

      router.push("/feed");
      setLoading(false);
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error);
      setLoading(false);
    }
  };

  const handleEmailLogin = async (data: {
    email: string;
    password: string;
  }) => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;

      // Criar o perfil do usuário no Firestore
      await createUserProfile(user);

      router.push("/feed");
      setLoading(false);
    } catch (error) {
      console.error("Erro ao fazer login com email:", error);
      setLoading(false);
    }
  };

  const handleEmailSignup = async (data: {
    email: string;
    password: string;
  }) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;

      // Criar o perfil do usuário no Firestore
      await createUserProfile(user);

      router.push("/feed");
      setLoading(false);
    } catch (error) {
      console.error("Erro ao criar conta com email:", error);
      setLoading(false);
    }
  };

  const onSubmit = (data: { email: string; password: string }) => {
    handleEmailLogin(data);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="max-w-sm w-full bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-center mb-6">Login</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register("email", { required: "Email é obrigatório" })}
              className="w-full p-2 border rounded-md mt-2"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              {...register("password", { required: "Senha é obrigatória" })}
              className="w-full p-2 border rounded-md mt-2"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md mt-4"
            disabled={loading}
          >
            {loading ? "Carregando..." : "Entrar com Email"}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-red-500 text-white py-2 rounded-md"
            disabled={loading}
          >
            {loading ? "Carregando..." : "Entrar com Google"}
          </button>
        </div>

        <div className="text-center mt-4">
          <button
            onClick={handleEmailSignup}
            className="w-full bg-green-500 text-white py-2 rounded-md"
            disabled={loading}
          >
            {loading ? "Carregando..." : "Criar uma conta"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
