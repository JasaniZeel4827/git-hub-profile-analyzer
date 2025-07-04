import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { username: string } }) {
  const { username } = params

  try {
    // Fetch all repositories (up to 100 per page, we'll get first 100)
    const response = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated&direction=desc`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "GitHub-Profile-Analyzer",
        },
      },
    )

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch repositories" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch repositories" }, { status: 500 })
  }
}
