type Memory = {
  id: number;
  title: string | null;
  content: string;
  completed: boolean;
  memory_type: string | null;
  priority: number | null;
  project: string | null;
  due_date: string | null;
};

type Props = {
  memory: Memory;
  toggleComplete: (
    id: number,
    completed: boolean
  ) => void;
  deleteMemory: (id: number) => void;
};

export default function MemoryCard({
  memory,
  toggleComplete,
  deleteMemory,
}: Props) {
  function priorityLabel(
    priority: number | null
  ) {
    const value = priority ?? 50;

    if (value >= 81) return "Urgent";
    if (value >= 61) return "Important";
    if (value >= 41) return "Normal";
    if (value >= 21) return "Low";

    return "Someday";
  }

  return (
    <li className="border rounded p-4">
      <div className="flex gap-3 items-start">
        <input
          type="checkbox"
          checked={memory.completed}
          onChange={() =>
            toggleComplete(
              memory.id,
              memory.completed
            )
          }
        />

        <div className="flex-1">
          <div
            className={
              memory.completed
                ? "line-through text-gray-400 font-semibold"
                : "font-semibold"
            }
          >
            {memory.title ||
              memory.content}
          </div>

          <div className="text-xs text-gray-500 mb-2">
            {memory.content}
          </div>

          <div className="text-sm text-gray-700">
            Type:{" "}
            {memory.memory_type
              ? memory.memory_type
                  .charAt(0)
                  .toUpperCase() +
                memory.memory_type.slice(1)
              : "Inbox"}
          </div>

          <div className="text-sm text-gray-700">
            Priority:{" "}
            {priorityLabel(
              memory.priority
            )}
          </div>

          <div className="text-sm text-gray-700">
            Project:{" "}
            {memory.project || "-"}
          </div>

          <div className="text-sm text-gray-700">
            Due:{" "}
            {memory.due_date || "-"}
          </div>
        </div>

        <button
          onClick={() => {
            if (
              confirm(
                "Delete this memory?"
              )
            ) {
              deleteMemory(memory.id);
            }
          }}
          className="bg-red-600 text-white px-3 py-1 rounded text-sm"
        >
          Delete
        </button>
      </div>
    </li>
  );
}