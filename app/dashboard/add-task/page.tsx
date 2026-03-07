"use client";

import { Suspense } from "react";
import AddTaskForm from "./AddTaskForm";

export default function AddTaskPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddTaskForm />
    </Suspense>
  );
}