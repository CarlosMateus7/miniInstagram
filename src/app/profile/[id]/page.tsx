import ProfilePage from "@/components/Profile";

interface ProfilePageProps {
  params: {
    id: string;
  };
}

export default function Profile({ params }: ProfilePageProps) {
  return <ProfilePage userId={params.id} />;
}
