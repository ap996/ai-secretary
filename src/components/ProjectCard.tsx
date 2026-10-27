type Props = {
  project: string;
  count: number;
};

export default function ProjectCard({
  project,
  count,
}: Props) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="font-semibold">
        {project}
      </div>

      <div className="text-sm text-gray-600">
        {count} active items
      </div>
    </div>
  );
}