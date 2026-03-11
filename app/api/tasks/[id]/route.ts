import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, getUserFromPayload } from "@/lib/auth";
import { addDays } from "date-fns";

function getNextDueDate(rule: any, currentDate: Date) {
  const next = new Date(currentDate);

  switch (rule.frequency) {
    case "DAILY":
      return addDays(currentDate, 1);
    case "WEEKDAYS": {
      let nextDate = addDays(currentDate, 1);
      while (nextDate.getDay() === 0 || nextDate.getDay() === 6) {
        nextDate = addDays(nextDate, 1);
      }
      return nextDate;
    }
    case "WEEKLY": {
      let nextDate = addDays(currentDate, 1);
      while (nextDate.getDay() !== rule.dayOfWeek) {
        nextDate = addDays(nextDate, 1);
      }
      return nextDate;
    }
    case "MONTHLY": {
      const nextDate = new Date(currentDate);
      nextDate.setMonth(nextDate.getMonth() + 1);
      nextDate.setDate(rule.dayOfMonth || 1);
      return nextDate;
    }
    case "CUSTOM":
      return addDays(currentDate, rule.interval || 1);
    default:
      return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 },
      );
    }

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (task.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Fetch task error:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const body = await request.json();

    let user = await getCurrentUser();

    // 2️⃣ fallback to payload userId (ESP device)
    if (!user && body.userId) {
      user = await getUserFromPayload(body.userId);
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Received update data:", body);

    if (!id) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 },
      );
    }

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (existingTask.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let parsedRecurrenceEndDate = null;
    if (body.recurrenceEndDate && body.recurrenceEndDate.trim() !== "") {
      parsedRecurrenceEndDate = new Date(body.recurrenceEndDate);
      if (isNaN(parsedRecurrenceEndDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid recurrence end date format" },
          { status: 400 },
        );
      }
    }

    // Prepare update data
    const updateData: any = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.estimatedEffort !== undefined)
      updateData.estimatedEffort = Number(body.estimatedEffort);
    if (body.isRecurring !== undefined)
      updateData.isRecurring = body.isRecurring;
    // Handle completion
    if (body.completed !== undefined) {
      updateData.completed = body.completed;
      if (body.completed) {
        updateData.completedAt = new Date();
      } else {
        updateData.completedAt = null;
      }
    }

    console.log("Parsed due date:", body);
    // Parse dates
    // let parsedDueDate = null;

    if (body.dueDate) {
      const parsedDueDate = new Date(body.dueDate);

      if (isNaN(parsedDueDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid due date format" },
          { status: 400 },
        );
      }

      updateData.dueDate = parsedDueDate;
    }
    // Handle recurrence fields
    if (body.isRecurring) {
      updateData.recurrenceType = body.recurrenceType || null;

      // Only set interval for CUSTOM type or as needed
      if (
        body.recurrenceInterval !== undefined &&
        body.recurrenceInterval !== null
      ) {
        updateData.recurrenceInterval = Number(body.recurrenceInterval);
      } else {
        updateData.recurrenceInterval = null;
      }

      // Handle day fields based on recurrence type
      if (
        body.recurrenceType === "WEEKLY" &&
        body.recurrenceDayOfWeek !== undefined
      ) {
        updateData.recurrenceDayOfWeek = Number(body.recurrenceDayOfWeek);
      } else {
        updateData.recurrenceDayOfWeek = null;
      }

      if (
        body.recurrenceType === "MONTHLY" &&
        body.recurrenceDayOfMonth !== undefined
      ) {
        updateData.recurrenceDayOfMonth = Number(body.recurrenceDayOfMonth);
      } else {
        updateData.recurrenceDayOfMonth = null;
      }

      updateData.recurrenceEndDate = parsedRecurrenceEndDate;

      if (body.recurrenceCount !== undefined && body.recurrenceCount !== null) {
        updateData.recurrenceCount = Number(body.recurrenceCount);
      } else {
        updateData.recurrenceCount = null;
      }
    } else {
      // Clear all recurrence fields if not recurring
      updateData.recurrenceType = null;
      updateData.recurrenceInterval = null;
      updateData.recurrenceDayOfWeek = null;
      updateData.recurrenceDayOfMonth = null;
      updateData.recurrenceEndDate = null;
      updateData.recurrenceCount = null;
    }

    console.log("Processed update data:", updateData);

    // Update the task
    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    // Handle recurring task completion - create next instance
    if (
      body.completed === true &&
      existingTask.isRecurring &&
      existingTask.recurrenceType
    ) {
      const nextDueDate = getNextDueDate(
        {
          frequency: existingTask.recurrenceType,
          interval: existingTask.recurrenceInterval,
          dayOfWeek: existingTask.recurrenceDayOfWeek,
          dayOfMonth: existingTask.recurrenceDayOfMonth,
        },
        new Date(existingTask.dueDate),
      );

      // Check if we haven't exceeded the end date
      if (
        nextDueDate &&
        (!existingTask.recurrenceEndDate ||
          nextDueDate <= existingTask.recurrenceEndDate)
      ) {
        await prisma.task.create({
          data: {
            title: existingTask.title,
            category: existingTask.category,
            priority: existingTask.priority,
            dueDate: nextDueDate,
            estimatedEffort: existingTask.estimatedEffort,
            isRecurring: true,
            recurrenceType: existingTask.recurrenceType,
            recurrenceInterval: existingTask.recurrenceInterval,
            recurrenceDayOfWeek: existingTask.recurrenceDayOfWeek,
            recurrenceDayOfMonth: existingTask.recurrenceDayOfMonth,
            recurrenceEndDate: existingTask.recurrenceEndDate,
            recurrenceCount: existingTask.recurrenceCount,
            userId: user.id,
          },
        });
      }
    }

    return NextResponse.json(updatedTask);
  } catch (error: any) {
    console.error("Update task error details:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to update task: " + error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 },
      );
    }

    // Check if task exists and belongs to user
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (task.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 },
    );
  }
}
