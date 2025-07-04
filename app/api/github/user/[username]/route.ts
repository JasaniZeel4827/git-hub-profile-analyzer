import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { username: string } }) {
  const { username } = params

  try {
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "GitHub-Profile-Analyzer",
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "User not found" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 })
  }
}
