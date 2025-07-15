import { neon } from "@neondatabase/serverless"

// Neon database connection
const sql = neon(
  "postgresql://healdb_owner:npg_6eYzFkR5CtiA@ep-winter-morning-a5x6pbns-pooler.us-east-2.aws.neon.tech/healdb?sslmode=require&channel_binding=require",
)

// Database helper functions
export async function getUsers() {
  try {
    const users = await sql`
      SELECT id, email, username, role, profile_photo, created_at, updated_at 
      FROM users 
      ORDER BY created_at DESC
    `
    return users
  } catch (error) {
    console.error("Error fetching users:", error)
    throw error
  }
}

export async function getUserByEmail(email: string) {
  try {
    const users = await sql`
      SELECT id, email, username, password_hash, role, profile_photo 
      FROM users 
      WHERE email = ${email}
    `
    return users[0] || null
  } catch (error) {
    console.error("Error fetching user by email:", error)
    throw error
  }
}

export async function getFiles() {
  try {
    const files = await sql`
      SELECT id, name, original_name, file_type, file_size, file_url, uploaded_by, created_at 
      FROM files 
      ORDER BY created_at DESC
    `
    return files
  } catch (error) {
    console.error("Error fetching files:", error)
    throw error
  }
}

export async function insertFile(fileData: {
  name: string
  original_name: string
  file_type: string
  file_size: number
  file_url: string
  uploaded_by: string
}) {
  try {
    const result = await sql`
      INSERT INTO files (name, original_name, file_type, file_size, file_url, uploaded_by)
      VALUES (${fileData.name}, ${fileData.original_name}, ${fileData.file_type}, 
              ${fileData.file_size}, ${fileData.file_url}, ${fileData.uploaded_by})
      RETURNING id, name, file_url, created_at
    `
    return result[0]
  } catch (error) {
    console.error("Error inserting file:", error)
    throw error
  }
}

export async function deleteFileById(id: string) {
  try {
    const result = await sql`
      DELETE FROM files 
      WHERE id = ${id}
      RETURNING id
    `
    return result[0]
  } catch (error) {
    console.error("Error deleting file:", error)
    throw error
  }
}

export async function getVideoLinks() {
  try {
    const videos = await sql`
      SELECT id, title, url, description, created_at, updated_at 
      FROM video_links 
      WHERE is_active = true 
      ORDER BY created_at DESC
    `
    return videos
  } catch (error) {
    console.error("Error fetching video links:", error)
    throw error
  }
}

export async function deleteVideoLinkById(id: string) {
  try {
    const result = await sql`
      UPDATE video_links 
      SET is_active = false 
      WHERE id = ${id}
      RETURNING id
    `
    return result[0]
  } catch (error) {
    console.error("Error deleting video link:", error)
    throw error
  }
}

export async function updateUserProfile(
  id: string,
  updates: {
    username?: string
    profile_photo?: string
  },
) {
  try {
    const setParts = []
    const values = []

    if (updates.username) {
      setParts.push("username = $" + (values.length + 2))
      values.push(updates.username)
    }

    if (updates.profile_photo) {
      setParts.push("profile_photo = $" + (values.length + 2))
      values.push(updates.profile_photo)
    }

    if (setParts.length === 0) return null

    const result = await sql`
      UPDATE users 
      SET ${sql(setParts.join(", "))}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, username, profile_photo, updated_at
    `
    return result[0]
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

export async function updateUserPassword(id: string, passwordHash: string) {
  try {
    const result = await sql`
      UPDATE users 
      SET password_hash = ${passwordHash}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, updated_at
    `
    return result[0]
  } catch (error) {
    console.error("Error updating user password:", error)
    throw error
  }
}

export async function createUser(userData: {
  email: string
  username: string
  password_hash: string
  role?: string
}) {
  try {
    const result = await sql`
      INSERT INTO users (email, username, password_hash, role)
      VALUES (${userData.email}, ${userData.username}, ${userData.password_hash}, ${userData.role || "user"})
      RETURNING id, email, username, role, created_at
    `
    return result[0]
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}
