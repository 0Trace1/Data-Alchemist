"use client";

import { useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { read, utils } from "xlsx";
import { z } from "zod";

const clientSchema = z.object({
  ClientID: z.string().min(1),
  ClientName: z.string().min(1),
  PriorityLevel: z.coerce.number().min(1).max(5),
  RequestedTaskIDs: z.string(),
  GroupTag: z.string(),
  AttributesJSON: z.string().refine((val) => {
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }, "Invalid JSON"),
});
const workerSchema = z.object({
  WorkerID: z.string().min(1),
  WorkerName: z.string().min(1),
  Skills: z.string(),
  AvailableSlots: z.string(),
  MaxLoadPerPhase: z.coerce.number(),
  WorkerGroup: z.string(),
  QualificationLevel: z.coerce.number(),
});
const taskSchema = z.object({
  TaskID: z.string(),
  TaskName: z.string(),
  Category: z.string(),
  Duration: z.coerce.number().min(1),
  RequiredSkills: z.string(),
  PreferredPhases: z.string(),
  MaxConcurrent: z.coerce.number(),
});

type Client = z.infer<typeof clientSchema>;
type Worker = z.infer<typeof workerSchema>;
type Task = z.infer<typeof taskSchema>;

export default function Home() {
  const [clients, setClients] = useState<Client[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await file.arrayBuffer();
    // if(file.type=="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"){}

    const wb = read(data);
    wb.SheetNames.forEach((worksheet) => {
      const sheet = wb.Sheets[worksheet];
      const json: any[] = utils.sheet_to_json(sheet);

      const err: Record<string, string> = {};
      const name =
        file.type ==
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          ? worksheet.toLowerCase()
          : file.name.toLowerCase();

      if (name.includes("client")) {
        const validated: Client[] = [];
        json.forEach((row, i) => {
          const parsed = clientSchema.safeParse(row);
          if (parsed.success) validated.push(parsed.data);
          else err[`${i}`] = parsed.error.issues.map((e) => e.message).join("");
        });
        setClients(validated);
      } else if (name.includes("worker")) {
        const validated: Worker[] = [];
        json.forEach((row, i) => {
          const parsed = workerSchema.safeParse(row);
          if (parsed.success) validated.push(parsed.data);
          else err[`${i}`] = parsed.error.issues.map((e) => e.message).join("");
        });
        setWorkers(validated);
      } else if (name.includes("tasks")) {
        const validated: Task[] = [];
        json.forEach((row, i) => {
          const parsed = taskSchema.safeParse(row);
          if (parsed.success) validated.push(parsed.data);
          else err[`${i}`] = parsed.error.issues.map((e) => e.message).join("");
        });
        setTasks(validated);
      }
      setErrors(err);
    });
  };

  const clientColumns: GridColDef[] = [
    { field: "ClientID", headerName: "Client ID", width: 120 },
    { field: "ClientName", headerName: "Name", width: 150 },
    { field: "PriorityLevel", headerName: "Priority", width: 100 },
    { field: "RequestedTaskIDs", headerName: "Tasks", width: 180 },
    { field: "GroupTag", headerName: "Group", width: 100 },
    { field: "AttributesJSON", headerName: "Attributes JSON", width: 200 },
  ];
  const workerColumns: GridColDef[] = [
    { field: "WorkerID", headerName: "Worker ID", width: 120 },
    { field: "WorkerName", headerName: "Name", width: 150 },
    { field: "Skills", headerName: "Skills", width: 180 },
    { field: "AvailableSlots", headerName: "Slots", width: 160 },
    { field: "MaxLoadPerPhase", headerName: "Max Load", width: 100 },
    { field: "WorkerGroup", headerName: "Group", width: 100 },
    { field: "QualificationLevel", headerName: "Qualification", width: 120 },
  ];

  const taskColumns: GridColDef[] = [
    { field: "TaskID", headerName: "Task ID", width: 100 },
    { field: "TaskName", headerName: "Name", width: 150 },
    { field: "Category", headerName: "Category", width: 120 },
    { field: "Duration", headerName: "Duration", width: 100 },
    { field: "RequiredSkills", headerName: "Skills", width: 160 },
    { field: "PreferredPhases", headerName: "Phases", width: 140 },
    { field: "MaxConcurrent", headerName: "Max Concurrent", width: 140 },
  ];
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">📥 Data Alchemist Starter</h1>

      <input
        type="file"
        accept=".csv, .xlsx"
        onChange={handleFile}
        className="mb-4"
      />

      {Object.keys(errors).length > 0 && (
        <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
          <p className="font-semibold">Validation Errors:</p>
          <ul>
            {Object.entries(errors).map(([i, msg]) => (
              <li key={i}>
                Row {Number(i) + 2}: {msg}
              </li>
            ))}
          </ul>
        </div>
      )}
      {clients.length > 0 && (
        <>
          <div className="flex justify-between">
            <h2 className="font-semibold my-2">Clients</h2>
            <button
              onClick={() => {
                setClients([]);
              }}
              className="w-20 border rounded-2xl hover:bg-white hover:text-black cursor-pointer"
            >
              Clear
            </button>
          </div>
          <div className="h-[400px] mb-6">
            <DataGrid
              rows={clients.map((r, i) => ({ id: i, ...r }))}
              columns={clientColumns}
            ></DataGrid>
          </div>
        </>
      )}
      {workers.length > 0 && (
        <>
          <div className="flex justify-between">
            <h2 className="font-semibold my-2">Workers</h2>
            <button
              onClick={() => {
                setWorkers([]);
              }}
              className="w-20 border rounded-2xl hover:bg-white hover:text-black cursor-pointer"
            >
              Clear
            </button>
          </div>
          <div className="h-[400px] mb-6">
            <DataGrid
              rows={workers.map((r, i) => ({ id: i, ...r }))}
              columns={workerColumns}
            ></DataGrid>
          </div>
        </>
      )}
      {tasks.length > 0 && (
        <>
          <div className="flex justify-between">
            <h2 className="font-semibold my-2">Tasks</h2>
            <button
              onClick={() => {
                setWorkers([]);
              }}
              className="w-20 border rounded-2xl hover:bg-white hover:text-black cursor-pointer"
            >
              Clear
            </button>
          </div>
          <div className="h-[400px] mb-6">
            <DataGrid
              rows={tasks.map((r, i) => ({ id: i, ...r }))}
              columns={taskColumns}
            ></DataGrid>
          </div>
        </>
      )}
    </main>
  );
}
