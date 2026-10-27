type Props = {
  briefing: string;
};

export default function BriefingCard({
  briefing,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">
        📋 Today's Briefing
      </h2>

      <div className="whitespace-pre-wrap text-gray-800">
        {briefing}
      </div>
    </div>
  );
}