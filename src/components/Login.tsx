"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { auth, googleProvider } from "../lib/firebase-client";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase-client";
import { User as AppUser } from "@/app/types";
import Image from "next/image";

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

  // Converts FirebaseUser to AppUser
  const firebaseUserToAppUser = (user: FirebaseUser): AppUser => ({
    uid: user.uid,
    userName: user.displayName || "User without a name",
    email: user.email || "",
    photoURL: user.photoURL || null,
    createdAt: new Date(),
    followers: [],
    following: [],
  });

  // Create a Firestore profile if one doesn't already exist.
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
        followers: user.followers,
        following: user.following,
      });
    }
  };

  // Login with Google
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const appUser = firebaseUserToAppUser(user);
      await createUserProfile(appUser);

      router.push("/feed");
    } catch (error) {
      console.error("Error logging in with Google:", error);
    } finally {
      setLoading(false);
    }
  };

  // Login with email and password
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
      console.error("Error logging in with email:", error);
    } finally {
      setLoading(false);
    }
  };

  // Create an account with email and password.
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

      router.push(`/edit-profile/${user.uid}`);
    } catch (error) {
      console.error("Error creating account:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="max-w-sm w-full bg-white p-8 rounded-xl shadow-md">
        {/* Logo */}
        <div className="w-full flex justify-center mb-2">
          <Image
            src="/picshare-logo.png"
            alt="Picshare"
            width={100}
            height={100}
            className="cursor-pointer"
            priority
          />
        </div>

        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 max-w-xs mx-auto mb-6">
          <p className="text-xs text-yellow-800 text-center">
            This project is merely a demonstration portfolio, with no profit or
            commercial intent. All images and data are fictitious or used for
            testing purposes only.
          </p>
        </div>

        <h2 className="text-2xl font-semibold text-center mb-6 mt-6 text-gray-800">
          Login
        </h2>

        {/* Form with Login */}
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
              {...register("email", { required: "Email is required." })}
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
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register("password", { required: "Password is required" })}
              className="w-full p-2 border rounded-md mt-2"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md mt-4 hover:bg-blue-600 transition"
            disabled={loading}
          >
            {loading ? "Loading..." : "Log in with Email"}
          </button>
        </form>

        {/* Login with Google */}
        <div className="mt-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition"
            disabled={loading}
          >
            {loading ? "Loading..." : "Log in with Google"}
          </button>
        </div>

        {/* Create account */}
        <div className="mt-4">
          <form onSubmit={handleSubmit(handleEmailSignup)}>
            <button
              type="submit"
              className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition"
              disabled={loading}
            >
              {loading ? "Loading..." : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
