import EditProfile from "@/components/EditProfile";

export default async function EditProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Edit Profile</h1>
      <EditProfile userId={id} />
    </main>
  );
}
