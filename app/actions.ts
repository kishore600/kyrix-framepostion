"use server"

import { redirect } from "next/navigation"

export async function publishPost(formData: FormData) {
  const id = formData.get("id") as string

  redirect("/")
}

export async function saveDraft(formData: FormData) {
  const title = formData.get("title") as string
  const content = formData.get("content") as string


  redirect("/")
}