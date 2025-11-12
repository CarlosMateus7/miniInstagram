"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { auth, googleProvider } from "../lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { User as AppUser } from "@/app/types";

type LoginFormInputs = {
  email: string;
  password: string;
};

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Converte FirebaseUser para AppUser
  const firebaseUserToAppUser = (user: FirebaseUser): AppUser => ({
    uid: user.uid,
    userName: user.displayName || "Utilizador sem nome",
    email: user.email || "",
    photoURL: user.photoURL || null,
    createdAt: new Date(),
  });

  // Cria perfil no Firestore se não existir
  const createUserProfile = async (user: AppUser) => {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        userName: user.userName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: user.createdAt,
      });
    }
  };

  // Login com Google
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const appUser = firebaseUserToAppUser(user);
      await createUserProfile(appUser);

      router.push("/feed");
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error);
    } finally {
      setLoading(false);
    }
  };

  // Login com email e senha
  const handleEmailLogin = async (data: LoginFormInputs) => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;
      const appUser = firebaseUserToAppUser(user);

      await createUserProfile(appUser);

      router.push("/feed");
    } catch (error) {
      console.error("Erro ao fazer login com email:", error);
    } finally {
      setLoading(false);
    }
  };

  // Criar conta com email e senha
  const handleEmailSignup = async (data: LoginFormInputs) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;
      const appUser = firebaseUserToAppUser(user);

      await createUserProfile(appUser);

      router.push("/feed");
    } catch (error) {
      console.error("Erro ao criar conta:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="max-w-sm w-full bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-center mb-6">Login</h2>

        {/* Formulário para Login (email + senha) */}
        <form onSubmit={handleSubmit(handleEmailLogin)} className="space-y-4">
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
            {loading ? "Loading..." : "Entrar com Email"}
          </button>
        </form>

        {/* Botão Login com Google */}
        <div className="text-center mt-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-red-500 text-white py-2 rounded-md"
            disabled={loading}
          >
            {loading ? "Loading..." : "Entrar com Google"}
          </button>
        </div>

        {/* Botão para Criar Conta - chama handleEmailSignup */}
        <div className="text-center mt-4">
          <form onSubmit={handleSubmit(handleEmailSignup)}>
            <button
              type="submit"
              className="w-full bg-green-500 text-white py-2 rounded-md"
              disabled={loading}
            >
              {loading ? "Loading..." : "Criar uma conta"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
