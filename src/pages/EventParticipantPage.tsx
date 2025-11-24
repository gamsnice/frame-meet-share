import { useParams } from "react-router-dom";

export default function EventParticipantPage() {
  const { slug } = useParams();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold mb-4">Event: {slug}</h1>
        <p className="text-muted-foreground">Participant page coming soon...</p>
      </div>
    </div>
  );
}
