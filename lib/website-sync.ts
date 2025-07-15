// Website synchronization utilities

export interface SyncData {
  action: "create" | "update" | "delete"
  category: string
  data: any
}

export class WebsiteSync {
  private mainWebsiteUrl = "https://www.ethiopia-vitality.org"
  private apiKey = process.env.MAIN_WEBSITE_API_KEY

  async syncContent(syncData: SyncData): Promise<boolean> {
    try {
      const endpoint = `${this.mainWebsiteUrl}/api/admin-sync/${syncData.category}`

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "X-Admin-Source": "admin.ethiopia-vitality.org",
        },
        body: JSON.stringify(syncData),
      })

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`)
      }

      const result = await response.json()
      console.log("Sync successful:", result)
      return true
    } catch (error) {
      console.error("Sync error:", error)
      return false
    }
  }

  async syncPhotos(data: any) {
    return this.syncContent({
      action: "create",
      category: "photos",
      data,
    })
  }

  async syncVideos(data: any) {
    return this.syncContent({
      action: "create",
      category: "videos",
      data,
    })
  }

  async syncNews(data: any) {
    return this.syncContent({
      action: "create",
      category: "news",
      data,
    })
  }

  async syncAnnouncements(data: any) {
    return this.syncContent({
      action: "create",
      category: "announcements",
      data,
    })
  }

  async syncReports(data: any) {
    return this.syncContent({
      action: "create",
      category: "reports",
      data,
    })
  }

  async syncVolunteerOpportunities(data: any) {
    return this.syncContent({
      action: "create",
      category: "volunteer",
      data,
    })
  }
}

export const websiteSync = new WebsiteSync()
