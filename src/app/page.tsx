"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";


import MemoryCard from "@/components/MemoryCard";
import ProjectCard from "@/components/ProjectCard";
import BriefingCard from "@/components/BriefingCard";

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

export default function Home() {
  const [memory, setMemory] = useState("");
  const [memories, setMemories] = useState<Memory[]>([]);
  const [briefing, setBriefing] = useState(
    "Generating briefing..."
  );
  const [selectedProject, setSelectedProject] =
    useState<string | null>(null);

  async function loadMemories() {
    const { data, error } = await supabase
      .from("memories")
      .select("*");

    if (error) {
      console.error(error);
      return;
    }

    const sorted = (data || []).sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      return (
        (b.priority ?? 50) -
        (a.priority ?? 50)
      );
    });

    setMemories(sorted);

    generateBriefing(sorted);
  }

  async function generateBriefing(
    memoryData: Memory[]
  ) {
    try {
      const response = await fetch(
        "/api/briefing",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            memories: memoryData,
          }),
        }
      );

      const data = await response.json();

      setBriefing(
        data.briefing ||
          "No briefing available."
      );
    } catch (error) {
      console.error(error);

      setBriefing(
        "Unable to generate briefing."
      );
    }
  }

  useEffect(() => {
    loadMemories();
  }, []);

  async function saveMemory() {
    if (!memory.trim()) return;

    const originalMemory = memory;

    const { data, error } = await supabase
      .from("memories")
      .insert([
        {
          content: originalMemory,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setMemory("");

    try {
      const response = await fetch(
        "/api/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            content: originalMemory,
          }),
        }
      );

      const aiData =
        await response.json();

      const parsed = JSON.parse(
        aiData.result
      );

      await supabase
        .from("memories")
        .update({
          title: parsed.title,
          memory_type:
            parsed.memory_type,
          priority:
            parsed.priority,
          project: parsed.project,
          due_date:
            parsed.due_date,
        })
        .eq("id", data.id);

    } catch (error) {
      console.error(error);
    }

    loadMemories();
  }

  async function toggleComplete(
    id: number,
    completed: boolean
  ) {
    await supabase
      .from("memories")
      .update({
        completed: !completed,
      })
      .eq("id", id);

    loadMemories();
  }

  const filtered = selectedProject
    ? memories.filter(
        (m) =>
          m.project ===
          selectedProject
      )
    : memories;

  const activeTasks =
    filtered.filter(
      (m) =>
        !m.completed &&
        (m.memory_type ===
          "task" ||
          m.memory_type ===
            "event" ||
          !m.memory_type)
    );

  const notesAndIdeas =
    filtered.filter(
      (m) =>
        !m.completed &&
        (m.memory_type ===
          "note" ||
          m.memory_type ===
            "idea")
    );

  const completedItems =
    filtered.filter(
      (m) => m.completed
    );

  const projectCounts =
    memories.reduce(
      (
        acc: Record<
          string,
          number
        >,
        memory
      ) => {
        if (
          memory.project &&
          !memory.completed
        ) {
          acc[memory.project] =
            (acc[memory.project] ||
              0) + 1;
        }

        return acc;
      },
      {}
    );

    async function deleteMemory(
  id: number
) {
  const { error } = await supabase
    .from("memories")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    return;
  }

  loadMemories();
}

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-black">
      <div className="max-w-5xl mx-auto">

        <BriefingCard
          briefing={briefing}
        />

        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h1 className="text-3xl font-bold mb-4">
            AI Secretary
          </h1>

          <textarea
            className="w-full border rounded p-3"
            rows={4}
            placeholder="Type something..."
            value={memory}
            onChange={(e) =>
              setMemory(
                e.target.value
              )
            }
          />

          <button
            onClick={saveMemory}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Save Memory
          </button>
        </div>

        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">
            📁 Projects
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(
              projectCounts
            ).map(
              ([project, count]) => (
                <button
                  key={project}
                  onClick={() =>
                    setSelectedProject(
                      project
                    )
                  }
                  className="text-left"
                >
                  <ProjectCard
                    project={project}
                    count={count}
                  />
                </button>
              )
            )}
          </div>

          {selectedProject && (
            <button
              onClick={() =>
                setSelectedProject(
                  null
                )
              }
              className="mt-4 text-blue-600"
            >
              Show All Projects
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-2xl font-bold mb-4">
            🔥 Active Tasks
          </h2>

          <ul className="space-y-3">
            {activeTasks.map(
              (memory) => (
                <MemoryCard
                key={memory.id}
                memory={memory}
                toggleComplete={toggleComplete}
                deleteMemory={deleteMemory}
              />

              )
            )}
          </ul>

          <h2 className="text-2xl font-bold mt-10 mb-4">
            💡 Notes & Ideas
          </h2>

          <ul className="space-y-3">
            {notesAndIdeas.map(
              (memory) => (
                <MemoryCard
                key={memory.id}
                memory={memory}
                toggleComplete={toggleComplete}
                deleteMemory={deleteMemory}
              />

              )
            )}
          </ul>

          <h2 className="text-2xl font-bold mt-10 mb-4">
            ✅ Completed
          </h2>

          <ul className="space-y-3">
            {completedItems.map(
              (memory) => (
               <MemoryCard
                key={memory.id}
                memory={memory}
                toggleComplete={toggleComplete}
                deleteMemory={deleteMemory}
              />

              )
            )}
          </ul>

        </div>

      </div>
    </main>
  );
}