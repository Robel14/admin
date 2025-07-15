import { GraphQLClient } from "graphql-request"

// Hasura configuration
const HASURA_ENDPOINT = "https://heal-db.hasura.app/v1/graphql"
const HASURA_ADMIN_SECRET = "8z865XNRXKMg2TJCRzSBj2FZUDKEpgMfqdbJckBh0vpzDk2z7tdQ8X9dVOXEqM9P"

// Create GraphQL client
export const hasuraClient = new GraphQLClient(HASURA_ENDPOINT, {
  headers: {
    "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
  },
})

// GraphQL queries and mutations
export const GET_USERS = `
  query GetUsers {
    users {
      id
      email
      username
      role
      profile_photo
      created_at
      updated_at
    }
  }
`

export const GET_FILES = `
  query GetFiles {
    files {
      id
      name
      original_name
      file_type
      file_size
      file_url
      uploaded_by
      created_at
    }
  }
`

export const GET_VIDEO_LINKS = `
  query GetVideoLinks {
    video_links(where: {is_active: {_eq: true}}) {
      id
      title
      url
      description
      created_at
      updated_at
    }
  }
`

export const INSERT_FILE = `
  mutation InsertFile($object: files_insert_input!) {
    insert_files_one(object: $object) {
      id
      name
      file_url
      created_at
    }
  }
`

export const DELETE_FILE = `
  mutation DeleteFile($id: uuid!) {
    delete_files_by_pk(id: $id) {
      id
    }
  }
`

export const DELETE_VIDEO_LINK = `
  mutation DeleteVideoLink($id: uuid!) {
    update_video_links_by_pk(pk_columns: {id: $id}, _set: {is_active: false}) {
      id
    }
  }
`

export const UPDATE_USER_PROFILE = `
  mutation UpdateUserProfile($id: uuid!, $username: String, $profile_photo: String) {
    update_users_by_pk(pk_columns: {id: $id}, _set: {username: $username, profile_photo: $profile_photo}) {
      id
      username
      profile_photo
      updated_at
    }
  }
`

export const UPDATE_USER_PASSWORD = `
  mutation UpdateUserPassword($id: uuid!, $password_hash: String!) {
    update_users_by_pk(pk_columns: {id: $id}, _set: {password_hash: $password_hash}) {
      id
      updated_at
    }
  }
`

// Helper functions
export async function fetchUsers() {
  try {
    const data = await hasuraClient.request(GET_USERS)
    return data.users
  } catch (error) {
    console.error("Error fetching users:", error)
    throw error
  }
}

export async function fetchFiles() {
  try {
    const data = await hasuraClient.request(GET_FILES)
    return data.files
  } catch (error) {
    console.error("Error fetching files:", error)
    throw error
  }
}

export async function fetchVideoLinks() {
  try {
    const data = await hasuraClient.request(GET_VIDEO_LINKS)
    return data.video_links
  } catch (error) {
    console.error("Error fetching video links:", error)
    throw error
  }
}

export async function insertFile(fileData: any) {
  try {
    const data = await hasuraClient.request(INSERT_FILE, { object: fileData })
    return data.insert_files_one
  } catch (error) {
    console.error("Error inserting file:", error)
    throw error
  }
}

export async function deleteFile(id: string) {
  try {
    const data = await hasuraClient.request(DELETE_FILE, { id })
    return data.delete_files_by_pk
  } catch (error) {
    console.error("Error deleting file:", error)
    throw error
  }
}

export async function deleteVideoLink(id: string) {
  try {
    const data = await hasuraClient.request(DELETE_VIDEO_LINK, { id })
    return data.update_video_links_by_pk
  } catch (error) {
    console.error("Error deleting video link:", error)
    throw error
  }
}

export async function updateUserProfile(id: string, username?: string, profilePhoto?: string) {
  try {
    const data = await hasuraClient.request(UPDATE_USER_PROFILE, {
      id,
      username,
      profile_photo: profilePhoto,
    })
    return data.update_users_by_pk
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

export async function updateUserPassword(id: string, passwordHash: string) {
  try {
    const data = await hasuraClient.request(UPDATE_USER_PASSWORD, {
      id,
      password_hash: passwordHash,
    })
    return data.update_users_by_pk
  } catch (error) {
    console.error("Error updating user password:", error)
    throw error
  }
}
