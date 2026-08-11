'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import * as icons from '@/lib/icons'
import { verifyPassword } from '@/lib/password'
import { createSessionToken, SESSION_COOKIE_NAME } from '@/lib/session'

export async function loginAction(_prevState: unknown, formData: FormData) {
  const username = String(formData.get('username') ?? '')
  const password = String(formData.get('password') ?? '')

  const expectedUser = process.env.ADMIN_USER
  const expectedHash = process.env.ADMIN_PASSWORD_HASH
  const secret = process.env.SESSION_SECRET

  if (!expectedUser || !expectedHash || !secret) {
    return { error: 'Admin auth is not configured (missing env vars).' }
  }

  if (username !== expectedUser || !(await verifyPassword(password, expectedHash))) {
    return { error: 'Invalid username or password.' }
  }

  const token = await createSessionToken(secret)
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  redirect('/')
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
  redirect('/login')
}

export async function createIconAction(_prevState: unknown, formData: FormData) {
  try {
    await icons.createIcon(db, {
      name: String(formData.get('name') ?? '').trim(),
      label: String(formData.get('label') ?? '').trim(),
      svg: String(formData.get('svg') ?? '').trim(),
      tags: String(formData.get('tags') ?? '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      category: String(formData.get('category') ?? '').trim() || null,
    })
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to create icon.' }
  }

  redirect('/')
}

export async function updateIconAction(id: string, _prevState: unknown, formData: FormData) {
  try {
    await icons.updateIcon(db, id, {
      name: String(formData.get('name') ?? '').trim(),
      label: String(formData.get('label') ?? '').trim(),
      svg: String(formData.get('svg') ?? '').trim(),
      tags: String(formData.get('tags') ?? '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      category: String(formData.get('category') ?? '').trim() || null,
    })
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to update icon.' }
  }

  redirect('/')
}

export async function deleteIconAction(id: string) {
  await icons.deleteIcon(db, id)
  redirect('/')
}
