import ProfilePage from "@/components/Profile";

export default async function Profile({ params }: { params: { id: string } }) {
  const userId = params.id;
  return <ProfilePage userId={userId} />;
}
