"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import JourneyDrilldown from "@/components/journey-drilldown"
import LoginPage from "@/components/login-page"

interface JourneyPageProps {
  params: Promise<{ caseId: string }>
}

export default function JourneyPage({ params }: JourneyPageProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [caseId, setCaseId] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    // Check if user is already authenticated
    const userEmail = localStorage.getItem("userEmail")
    if (userEmail) {
      setIsAuthenticated(true)
    }
    
    // Get the case ID from params
    params.then(resolvedParams => {
      setCaseId(resolvedParams.caseId)
      setIsLoading(false)
    })
  }, [params])

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

  const handleViewChange = (view: 'dashboard' | 'survey' | 'journey', newCaseId?: string) => {
    if (view === 'journey' && newCaseId) {
      router.push(`/journey/${newCaseId}`)
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

  return <JourneyDrilldown caseId={caseId} onLogout={handleLogout} onViewChange={handleViewChange} />
}