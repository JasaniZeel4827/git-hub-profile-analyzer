"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search, ExternalLink, MapPin, Building, Globe, Users, GitFork, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ProfileAnalytics } from "@/components/profile-analytics"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"

interface GitHubUser {
  login: string
  name: string
  avatar_url: string
  bio: string
  location: string
  company: string
  blog: string
  followers: number
  following: number
  public_repos: number
  html_url: string
  created_at: string
}

interface Repository {
  name: string
  description: string
  stargazers_count: number
  forks_count: number
  language: string
  html_url: string
  created_at: string
  updated_at: string
}

interface AnalyticsData {
  totalStars: number
  topLanguages: { [key: string]: number }
  topRepos: Repository[]
  accountAge: number
  totalRepos: number
}

export default function GitHubProfileFinder() {
  const [username, setUsername] = useState("")
  const [user, setUser] = useState<GitHubUser | null>(null)
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Auto-focus input on page load
    if (inputRef.current) {
      inputRef.current.focus()
    }

    // Load recent searches from localStorage
    const saved = localStorage.getItem("github-recent-searches")
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  const saveToRecentSearches = (searchUsername: string) => {
    const updated = [searchUsername, ...recentSearches.filter((s) => s !== searchUsername)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem("github-recent-searches", JSON.stringify(updated))
  }

  const searchUser = async (searchUsername: string) => {
    if (!searchUsername.trim()) return

    setLoading(true)
    setError("")
    setUser(null)
    setRepositories([])
    setAnalytics(null)

    try {
      // Fetch user profile
      const userResponse = await fetch(`/api/github/user/${searchUsername}`)
      if (!userResponse.ok) {
        if (userResponse.status === 404) {
          throw new Error("User not found")
        }
        throw new Error("Failed to fetch user data")
      }
      const userData = await userResponse.json()
      setUser(userData)

      // Fetch repositories
      const reposResponse = await fetch(`/api/github/repos/${searchUsername}`)
      if (reposResponse.ok) {
        const reposData = await reposResponse.json()
        setRepositories(reposData)

        // Calculate analytics
        const totalStars = reposData.reduce((sum: number, repo: Repository) => sum + repo.stargazers_count, 0)

        const languageCount: { [key: string]: number } = {}
        reposData.forEach((repo: Repository) => {
          if (repo.language) {
            languageCount[repo.language] = (languageCount[repo.language] || 0) + 1
          }
        })

        const topRepos = reposData
          .sort((a: Repository, b: Repository) => b.stargazers_count - a.stargazers_count)
          .slice(0, 5)

        const accountAge = Math.floor((Date.now() - new Date(userData.created_at).getTime()) / (1000 * 60 * 60 * 24))

        setAnalytics({
          totalStars,
          topLanguages: languageCount,
          topRepos,
          accountAge,
          totalRepos: reposData.length,
        })
      }

      saveToRecentSearches(searchUsername)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    searchUser(username)
  }

  const handleRecentSearch = (searchUsername: string) => {
    setUsername(searchUsername)
    searchUser(searchUsername)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Github className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                GitHub Profile Finder & Analyzer
              </h1>
              <p className="text-muted-foreground">Discover and analyze GitHub profiles with detailed insights</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search GitHub User
            </CardTitle>
            <CardDescription>Enter a GitHub username to view their profile and analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Enter GitHub username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-1"
                disabled={loading}
              />
              <Button type="submit" disabled={loading || !username.trim()}>
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Search
              </Button>
            </form>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Recent searches:</p>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search) => (
                    <Badge
                      key={search}
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80 transition-colors"
                      onClick={() => handleRecentSearch(search)}
                    >
                      {search}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Alert className="mb-8 border-destructive/50 text-destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>
          </div>
        )}

        {/* User Profile */}
        {user && !loading && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Profile Card */}
            <Card className="lg:col-span-1">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4">
                  <Image
                    src={user.avatar_url || "/placeholder.svg"}
                    alt={`${user.login}'s avatar`}
                    width={120}
                    height={120}
                    className="rounded-full border-4 border-primary/20"
                  />
                </div>
                <CardTitle className="text-2xl">{user.name || user.login}</CardTitle>
                <CardDescription className="text-lg">@{user.login}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.bio && <p className="text-center text-muted-foreground">{user.bio}</p>}

                <div className="space-y-3">
                  {user.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  {user.company && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>{user.company}</span>
                    </div>
                  )}
                  {user.blog && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={user.blog.startsWith("http") ? user.blog : `https://${user.blog}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {user.blog}
                      </a>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                      <Users className="h-5 w-5" />
                      {user.followers}
                    </div>
                    <p className="text-sm text-muted-foreground">Followers</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                      <Users className="h-5 w-5" />
                      {user.following}
                    </div>
                    <p className="text-sm text-muted-foreground">Following</p>
                  </div>
                </div>

                <div className="text-center pt-4 border-t">
                  <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary">
                    <GitFork className="h-5 w-5" />
                    {user.public_repos}
                  </div>
                  <p className="text-sm text-muted-foreground">Public Repositories</p>
                </div>

                <Button asChild className="w-full">
                  <a href={user.html_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    View on GitHub
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Analytics */}
            {analytics && (
              <div className="lg:col-span-2">
                <ProfileAnalytics analytics={analytics} repositories={repositories} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
