import EditProfile from "@/components/EditProfile";

export default function EditProfilePage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Edit Profile</h1>
      <EditProfile userId={params.id} />
    </main>
  );
}
