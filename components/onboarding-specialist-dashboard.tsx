"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { AppHeader } from "@/components/ui/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Search, 
  Filter, 
  Bell,
  LogOut, 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  FileText,
  Shield,
  Eye,
  MessageSquare,
  AlertCircle,
  UserPlus,
  TrendingUp,
  Calendar,
  Building2,
  Menu,
  X,
  Bot
} from "lucide-react"
import { 
  generateOnboardingCases,
  getDashboardMetrics,
  getStageDistribution,
  getDepartmentMetrics,
  generateAgentActivity,
  generateNotifications,
  DEPARTMENTS 
} from "@/lib/mockData"
import { telemetryService, TelemetryEvent } from "@/lib/telemetry"
import { 
  OnboardingCase, 
  DashboardMetrics, 
  StageDistribution, 
  DepartmentMetrics,
  AgentActivity,
  Notification,
  DashboardFilters,
  OnboardingStage,
  Department,
  CaseStatus,
  AgentType 
} from "@/lib/types"
import { ChatAIDialog } from "@/components/ui/chat-ai-dialog"

interface OnboardingSpecialistDashboardProps {
  onLogout: () => void
  onViewChange: (view: 'dashboard' | 'survey' | 'journey', caseId?: string) => void
}

export default function OnboardingSpecialistDashboard({ 
  onLogout, 
  onViewChange 
}: OnboardingSpecialistDashboardProps) {
  const [cases, setCases] = useState<OnboardingCase[]>([])
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [stageDistribution, setStageDistribution] = useState<StageDistribution[]>([])
  const [departmentMetrics, setDepartmentMetrics] = useState<DepartmentMetrics[]>([])
  const [agentActivity, setAgentActivity] = useState<AgentActivity[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [telemetryEvents, setTelemetryEvents] = useState<TelemetryEvent[]>([])
  const [filters, setFilters] = useState<DashboardFilters>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Chat AI Dialog state
  const [chatDialogOpen, setChatDialogOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<{
    id: string
    name: string
    stage: string
  } | null>(null)

  // Load data on component mount
  useEffect(() => {
    const loadData = () => {
      const casesData = generateOnboardingCases()
      setCases(casesData)
      setMetrics(getDashboardMetrics())
      setStageDistribution(getStageDistribution())
      setDepartmentMetrics(getDepartmentMetrics())
      setNotifications(generateNotifications())
      
      // Generate recent agent activity from first few cases
      const recentActivity: AgentActivity[] = []
      casesData.slice(0, 5).forEach((caseItem) => {
        recentActivity.push(...generateAgentActivity(caseItem.id).slice(0, 2))
      })
      setAgentActivity(recentActivity.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ).slice(0, 10))
    }

    loadData()

    // Subscribe to telemetry events
    const unsubscribe = telemetryService.subscribe((events) => {
      setTelemetryEvents(events)
    })

    // Subscribe to notifications from telemetry
    const unsubscribeNotifications = telemetryService.subscribeToNotifications((notification: Notification) => {
      setNotifications((prev: Notification[]) => [notification, ...prev.slice(0, 9)]) // Keep latest 10 notifications
    })

    return () => {
      unsubscribe()
      unsubscribeNotifications()
    }
  }, [])

  // Filter and search cases
  const filteredCases = useMemo(() => {
    let filtered = cases

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((caseItem: OnboardingCase) =>
        caseItem.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        caseItem.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply stage filter
    if (filters.stage && filters.stage.length > 0) {
      filtered = filtered.filter((caseItem: OnboardingCase) => filters.stage!.includes(caseItem.stage))
    }

    // Apply status filter
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter((caseItem: OnboardingCase) => filters.status!.includes(caseItem.status))
    }

    // Apply department filter
    if (filters.department && filters.department.length > 0) {
      filtered = filtered.filter((caseItem: OnboardingCase) => filters.department!.includes(caseItem.department as Department))
    }

    return filtered
  }, [cases, searchQuery, filters])

  // Handle filter changes
  const handleStageFilter = (stage: OnboardingStage) => {
    setFilters((prev: DashboardFilters) => ({
      ...prev,
      stage: prev.stage?.includes(stage) 
        ? prev.stage.filter((s: OnboardingStage) => s !== stage)
        : [...(prev.stage || []), stage]
    }))
  }

  const handleStatusFilter = (status: CaseStatus) => {
    setFilters((prev: DashboardFilters) => ({
      ...prev,
      status: prev.status?.includes(status)
        ? prev.status.filter((s: CaseStatus) => s !== status)
        : [...(prev.status || []), status]
    }))
  }

  const handleDepartmentFilter = (department: Department) => {
    setFilters((prev: DashboardFilters) => ({
      ...prev,
      department: prev.department?.includes(department)
        ? prev.department.filter((d: Department) => d !== department)
        : [...(prev.department || []), department]
    }))
  }

  // Handle chat dialog
  const handleOpenChatDialog = (candidate: OnboardingCase) => {
    setSelectedCandidate({
      id: candidate.id,
      name: candidate.employeeName,
      stage: candidate.stage
    })
    setChatDialogOpen(true)
  }

  const clearFilters = () => {
    setFilters({})
    setSearchQuery("")
  }

  const getStatusColor = (status: CaseStatus) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'InProgress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Blocked': return 'bg-red-100 text-red-800 border-red-200'
      case 'At Risk': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStageColor = (stage: OnboardingStage) => {
    switch (stage) {
      case 'Preboarding': return 'bg-purple-100 text-purple-800'
      case 'Day 1': return 'bg-blue-100 text-blue-800'
      case 'Week 1': return 'bg-indigo-100 text-indigo-800'
      case 'Day 30': return 'bg-green-100 text-green-800'
      case 'Day 90': return 'bg-emerald-100 text-emerald-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatAgentName = (agent: string) => {
    return agent.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getDueDateColor = (dueDate: string, status: CaseStatus) => {
    if (status === 'Completed') return 'text-green-600'
    
    const today = new Date()
    const due = new Date(dueDate)
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 3600 * 24))
    
    if (diffDays < 0) return 'text-red-600 font-medium' // Overdue
    if (diffDays === 0) return 'text-orange-600 font-medium' // Due today
    if (diffDays <= 2) return 'text-yellow-600' // Due soon
    return 'text-gray-600'
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Custom styles for animation delays */}
      <style jsx>{`
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        .animation-delay-300 {
          animation-delay: 300ms;
        }
        .animation-delay-600 {
          animation-delay: 600ms;
        }
      `}</style>
      
      {/* Professional Header */}
      <AppHeader 
        onLogout={onLogout}
        userEmail="ospecialist@corespectrum.com"
        userRole="Onboarding Specialist"
        showSearch={true}
        showNotifications={true}
        onViewChange={onViewChange}
        notifications={notifications}
      />

      {/* Demo Telemetry Banner */}
      {telemetryEvents.length > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-800">Live Demo Telemetry</span>
            </div>
            <div className="flex-1 mx-4">
              <div className="text-sm text-blue-700 truncate">
                Latest: {telemetryEvents[0]?.description} - {telemetryEvents[0]?.employeeName}
              </div>
            </div>
            <div className="text-xs text-blue-600">
              {telemetryEvents.length} events
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar for mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-25 md:hidden">
            <div className="fixed left-0 top-0 h-full w-64 bg-white p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Navigation</h2>
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    onViewChange('dashboard')
                    setSidebarOpen(false)
                  }}
                >
                  Specialist Dashboard
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    onViewChange('survey')
                    setSidebarOpen(false)
                  }}
                >
                  Survey Insights
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Dashboard Content */}
        <div className="flex-1 p-6">
          {/* KPI Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-600 flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  Active Journeys
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">{metrics.activeJourneys}</div>
                <p className="text-xs text-blue-600 mt-1">Currently in progress</p>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 border-orange-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-orange-600 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Due Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-700">{metrics.dueToday}</div>
                <p className="text-xs text-orange-600 mt-1">Tasks due today</p>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-600 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Overdue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-700">{metrics.overdue}</div>
                <p className="text-xs text-red-600 mt-1">Past due date</p>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-yellow-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Stuck
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-700">{metrics.stuck}</div>
                <p className="text-xs text-yellow-600 mt-1">Blocked journeys</p>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-600 flex items-center">
                  <Shield className="h-4 w-4 mr-1" />
                  BGV Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-700">{metrics.bgvPending}</div>
                <p className="text-xs text-purple-600 mt-1">Background verification</p>
              </CardContent>
            </Card>

            <Card className="bg-indigo-50 border-indigo-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-indigo-600 flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-700">{metrics.compliancePending}</div>
                <p className="text-xs text-indigo-600 mt-1">Pending acknowledgments</p>
              </CardContent>
            </Card>
          </div>

          {/* Stage Overview */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Stage Overview</CardTitle>
              <CardDescription>Distribution of active onboarding journeys across stages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {stageDistribution.map(stage => (
                  <div 
                    key={stage.stage}
                    className="text-center p-4 rounded-lg border bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => handleStageFilter(stage.stage)}
                  >
                    <div className="text-2xl font-bold text-gray-900">{stage.count}</div>
                    <div className="text-sm font-medium text-gray-700">{stage.stage}</div>
                    <div className="text-xs text-gray-500">{stage.percentage.toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Filters and Journey List */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg font-semibold">My Journeys</CardTitle>
                      <CardDescription>
                        {filteredCases.length} of {cases.length} journeys
                        {(filters.stage?.length || filters.status?.length || filters.department?.length || searchQuery) && (
                          <Button
                            variant="link"
                            size="sm"
                            onClick={clearFilters}
                            className="ml-2 p-0 text-blue-600 hover:text-blue-800"
                          >
                            Clear filters
                          </Button>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Search for mobile */}
                      <div className="sm:hidden relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 w-40"
                        />
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Filter className="h-4 w-4 mr-1" />
                            Filter
                            {(filters.stage?.length || filters.status?.length || filters.department?.length) && (
                              <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                                {(filters.stage?.length || 0) + (filters.status?.length || 0) + (filters.department?.length || 0)}
                              </Badge>
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Filter by Stage</DropdownMenuLabel>
                          {['Preboarding', 'Day 1', 'Week 1', 'Day 30', 'Day 90'].map(stage => (
                            <DropdownMenuItem
                              key={stage}
                              onClick={() => handleStageFilter(stage as OnboardingStage)}
                              className="flex items-center justify-between"
                            >
                              {stage}
                              {filters.stage?.includes(stage as OnboardingStage) && <CheckCircle className="h-4 w-4" />}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                          {['InProgress', 'Blocked', 'At Risk', 'Completed'].map(status => (
                            <DropdownMenuItem
                              key={status}
                              onClick={() => handleStatusFilter(status as CaseStatus)}
                              className="flex items-center justify-between"
                            >
                              {status}
                              {filters.status?.includes(status as CaseStatus) && <CheckCircle className="h-4 w-4" />}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Filter by Department</DropdownMenuLabel>
                          {DEPARTMENTS.map(dept => (
                            <DropdownMenuItem
                              key={dept}
                              onClick={() => handleDepartmentFilter(dept)}
                              className="flex items-center justify-between"
                            >
                              {dept}
                              {filters.department?.includes(dept) && <CheckCircle className="h-4 w-4" />}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Role/Dept</TableHead>
                          <TableHead>Stage</TableHead>
                          <TableHead className="text-center">% Complete</TableHead>
                          <TableHead>Due Next</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-center">Exceptions</TableHead>
                          <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCases.slice(0, 20).map(case_ => (
                          <TableRow key={case_.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div>
                                <div className="font-medium">{case_.employeeName}</div>
                                <div className="text-sm text-gray-500">{case_.id}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium text-sm">{case_.role}</div>
                                <div className="text-xs text-gray-500">{case_.department}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getStageColor(case_.stage)}>
                                {case_.stage}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center">
                                <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${Math.min(case_.progressPercent, 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium">{case_.progressPercent}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className={getDueDateColor(case_.dueDate, case_.status)}>
                                <div className="text-sm font-medium">{case_.dueNext}</div>
                                <div className="text-xs">
                                  {new Date(case_.dueDate).toLocaleDateString()}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getStatusColor(case_.status)}>
                                {case_.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              {(case_.employeeName === "Alex Morgan" || case_.exceptionCount > 0) ? (
                                <Badge variant="destructive" className="text-xs">
                                  {case_.employeeName === "Alex Morgan" ? 3 : case_.exceptionCount}
                                </Badge>
                              ) : (
                                <span className="text-gray-400 text-xs">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onViewChange('journey', case_.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Exceptions by Department */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Exceptions by Department</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {departmentMetrics.map(dept => (
                    <div key={dept.department} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                      <div>
                        <div className="font-medium text-sm">{dept.department}</div>
                        <div className="text-xs text-gray-500">{dept.active} active</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{dept.atRisk}</div>
                        <div className="text-xs text-gray-500">at risk</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Agent Activity Feed */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Recent Agent Activity</CardTitle>
                  <CardDescription>Real-time updates and telemetry events</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {/* Show telemetry events first */}
                    {telemetryEvents.slice(0, 5).map((event) => (
                      <div key={event.id} className="border-l-2 border-green-200 pl-3 py-2">
                        <div className="text-sm font-medium text-green-800">
                          Telemetry Event
                        </div>
                        <div className="text-xs text-gray-600">
                          {event.description}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(event.timestamp).toLocaleString()}
                        </div>
                        <div className="flex items-center mt-1">
                          <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                            Live
                          </Badge>
                          <span className="text-xs text-gray-500 ml-2">{event.employeeName}</span>
                        </div>
                      </div>
                    ))}
                    
                    {/* Show static agent activity */}
                    {agentActivity.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="border-l-2 border-gray-200 pl-3 py-2">
                        <div className="text-sm font-medium">
                          {formatAgentName(activity.agent)}
                        </div>
                        <div className="text-xs text-gray-600">
                          {activity.action}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(activity.timestamp).toLocaleString()}
                        </div>
                        <div className="flex items-center mt-1">
                          <Badge 
                            variant={activity.status === 'success' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {activity.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Intelligent AI Chatbot - Floating outside Recent Agent Activity */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative group">
          {/* Main Chatbot Button */}
          <Button
            onClick={() => handleOpenChatDialog({
              id: 'alex-morgan-001',
              employeeId: 'EMP-2024-1201',
              employeeName: 'Alex Morgan',
              department: 'Engineering',
              role: 'Senior Software Engineer',
              stage: 'Preboarding',
              progressPercent: 65,
              status: 'At Risk',
              dueNext: 'BGC Report Review',
              dueDate: '2025-12-15',
              exceptionCount: 3,
              exceptions: [],
              createdDate: '2025-12-01',
              manager: 'Sarah Chen'
            } as OnboardingCase)}
            className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-white"
            title="AI Onboarding Assistant"
          >
            <div className="relative">
              {/* Bot Icon */}
              <Bot className="h-8 w-8 text-white" />
              
              {/* Pulse animation for AI activity */}
              <div className="absolute -inset-1 bg-blue-400 rounded-full opacity-20 animate-ping"></div>
              <div className="absolute -inset-2 bg-blue-300 rounded-full opacity-10 animate-ping animation-delay-200"></div>
            </div>
          </Button>

          {/* Tooltip on hover */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
              AI Onboarding Assistant
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>

          {/* Floating status indicators */}
          <div className="absolute -left-3 top-1/2 transform -translate-y-1/2">
            <div className="flex flex-col gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse animation-delay-300"></div>
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse animation-delay-600"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat AI Dialog */}
      {selectedCandidate && (
        <ChatAIDialog
          open={chatDialogOpen}
          onOpenChange={setChatDialogOpen}
          candidateName={selectedCandidate.name}
          candidateId={selectedCandidate.id}
          currentStage={selectedCandidate.stage}
        />
      )}
    </div>
  )
}