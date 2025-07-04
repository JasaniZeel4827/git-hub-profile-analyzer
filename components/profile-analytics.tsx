"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, GitFork, Calendar, Code, TrendingUp, ExternalLink } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

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

interface ProfileAnalyticsProps {
  analytics: AnalyticsData
  repositories: Repository[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658"]

export function ProfileAnalytics({ analytics, repositories }: ProfileAnalyticsProps) {
  const languageData = Object.entries(analytics.topLanguages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 7)
    .map(([name, value]) => ({ name, value }))

  const repoStarsData = analytics.topRepos.map((repo) => ({
    name: repo.name.length > 15 ? repo.name.substring(0, 15) + "..." : repo.name,
    stars: repo.stargazers_count,
    fullName: repo.name,
  }))

  const formatAccountAge = (days: number) => {
    const years = Math.floor(days / 365)
    const months = Math.floor((days % 365) / 30)

    if (years > 0) {
      return `${years} year${years > 1 ? "s" : ""} ${months > 0 ? `${months} month${months > 1 ? "s" : ""}` : ""}`
    }
    return `${months} month${months > 1 ? "s" : ""}`
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-yellow-500">
              <Star className="h-5 w-5" />
              {analytics.totalStars}
            </div>
            <p className="text-sm text-muted-foreground">Total Stars</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-blue-500">
              <Code className="h-5 w-5" />
              {Object.keys(analytics.topLanguages).length}
            </div>
            <p className="text-sm text-muted-foreground">Languages</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-green-500">
              <TrendingUp className="h-5 w-5" />
              {analytics.totalRepos}
            </div>
            <p className="text-sm text-muted-foreground">Repositories</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-purple-500">
              <Calendar className="h-5 w-5" />
              {Math.floor(analytics.accountAge / 365)}
            </div>
            <p className="text-sm text-muted-foreground">Years on GitHub</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Languages Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Top Programming Languages
            </CardTitle>
            <CardDescription>Distribution of languages across repositories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={languageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {languageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Repositories by Stars */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Top Repositories by Stars
            </CardTitle>
            <CardDescription>Most starred public repositories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={repoStarsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                <YAxis />
                <Tooltip
                  labelFormatter={(label, payload) => {
                    const item = repoStarsData.find((d) => d.name === label)
                    return item ? item.fullName : label
                  }}
                />
                <Bar dataKey="stars" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Repositories List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top 5 Repositories
          </CardTitle>
          <CardDescription>Most popular repositories with detailed information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topRepos.map((repo, index) => (
              <div
                key={repo.name}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">#{index + 1}</Badge>
                    <h3 className="font-semibold truncate">{repo.name}</h3>
                    {repo.language && <Badge variant="outline">{repo.language}</Badge>}
                  </div>
                  {repo.description && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{repo.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {repo.stargazers_count}
                    </div>
                    <div className="flex items-center gap-1">
                      <GitFork className="h-3 w-3" />
                      {repo.forks_count}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(repo.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" />
                    View
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Account Age</p>
              <p className="text-lg font-semibold">{formatAccountAge(analytics.accountAge)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Stars per Repository</p>
              <p className="text-lg font-semibold">
                {analytics.totalRepos > 0 ? (analytics.totalStars / analytics.totalRepos).toFixed(1) : "0"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
