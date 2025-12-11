"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Dashboard from "@/components/onboarding-specialist-dashboard"
import LoginPage from "@/components/login-page"
import { AppHeader } from "@/components/ui/app-header"

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already authenticated
    const userEmail = localStorage.getItem("userEmail")
    if (userEmail) {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const handleLogin = (email: string) => {
    setIsAuthenticated(true)
    localStorage.setItem("userEmail", email)
    
    // Clear previous session data to ensure fresh state on sign in
    sessionStorage.removeItem("hasCompletedInteraction")
    // Clear Alex Morgan related session storage to ensure fresh state
    sessionStorage.removeItem("alexInitialized")
    // Clear Alex Morgan localStorage values to ensure 0% start
    localStorage.removeItem('alexMorganChatCompleted')
    localStorage.removeItem('alexMorganStage')
    localStorage.removeItem('alexMorganProgress')
    localStorage.removeItem('alexMetricsUpdated')
    // Clear Jordan Lee localStorage values to ensure fresh BGC Pending state
    localStorage.removeItem('jordanLeeBGCCompleted')
    localStorage.removeItem('jordanLeeStage')
    localStorage.removeItem('jordanLeeProgress')
    localStorage.removeItem('jordanMetricsUpdated')
    sessionStorage.removeItem('jordanInitialized')
    sessionStorage.removeItem('jordanBGCCompleted')
    sessionStorage.removeItem('jordanTilesUpdated')
    // Clear tile counters to reset on sign in
    sessionStorage.removeItem("upcomingJoiners")
    sessionStorage.removeItem("pendingDocuments")
    sessionStorage.removeItem("pendingBGCCount")
    sessionStorage.removeItem("pendingIDCreationCount")
    sessionStorage.removeItem('onboardingsInProgress')
    sessionStorage.removeItem('dashboardTilesInitialized')
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("userEmail")
    // Clear session storage to reset chat interaction tracking
    sessionStorage.removeItem("hasCompletedInteraction")
    // Clear Alex Morgan related session storage to ensure fresh state on next login
    sessionStorage.removeItem("alexInitialized")
    // Clear Alex Morgan localStorage values to ensure 0% start
    localStorage.removeItem('alexMorganChatCompleted')
    localStorage.removeItem('alexMorganStage')
    localStorage.removeItem('alexMorganProgress')
    localStorage.removeItem('alexMetricsUpdated')
    // Clear Jordan Lee localStorage values to ensure fresh BGC Pending state
    localStorage.removeItem('jordanLeeBGCCompleted')
    localStorage.removeItem('jordanLeeStage')
    localStorage.removeItem('jordanLeeProgress')
    localStorage.removeItem('jordanMetricsUpdated')
    // Clear tile counters to reset on next login
    sessionStorage.removeItem("upcomingJoiners")
    sessionStorage.removeItem("pendingDocuments")
    sessionStorage.removeItem("pendingBGCCount")
    sessionStorage.removeItem("pendingIDCreationCount")
    sessionStorage.removeItem("jordanBGCCompleted")
    sessionStorage.removeItem('onboardingsInProgress')
    sessionStorage.removeItem('dashboardTilesInitialized')
    router.push("/")
  }

  const handleViewChange = (view: 'dashboard' | 'survey' | 'journey', caseId?: string) => {
    if (view === 'journey' && caseId) {
      router.push(`/journey/${caseId}`)
    } else if (view === 'survey') {
      router.push('/survey')
    } else {
      router.push('/dashboard')
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader 
        userEmail={localStorage.getItem("userEmail") || "diane.prince@corespectrum.com"}
        onLogout={handleLogout} 
        onViewChange={handleViewChange}
      />
      <Dashboard onLogout={handleLogout} onViewChange={handleViewChange} />
    </div>
  )
}