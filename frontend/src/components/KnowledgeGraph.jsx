import { useEffect, useRef, useState } from 'react'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'

/**
 * Improved Knowledge Graph Visualization Component
 * Uses hierarchical layout for better structure
 */
const KnowledgeGraph = ({
  graphData,
  onNodeClick,
  highlightedNodes = [],
  highlightedPath = [],
  centerNode = null
}) => {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
  const [hoveredNode, setHoveredNode] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [selectedNode, setSelectedNode] = useState(null)
  const [nodePositions, setNodePositions] = useState({})

  // Category colors - Professional gradient-based palette
  const categoryColors = {
    'frontend': {
      primary: '#3B82F6',
      gradient: '#60A5FA',
      shadow: 'rgba(59, 130, 246, 0.3)'
    },
    'backend': {
      primary: '#10B981',
      gradient: '#34D399',
      shadow: 'rgba(16, 185, 129, 0.3)'
    },
    'database': {
      primary: '#8B5CF6',
      gradient: '#A78BFA',
      shadow: 'rgba(139, 92, 246, 0.3)'
    },
    'devops': {
      primary: '#F59E0B',
      gradient: '#FBBF24',
      shadow: 'rgba(245, 158, 11, 0.3)'
    },
    'softskills': {
      primary: '#EC4899',
      gradient: '#F472B6',
      shadow: 'rgba(236, 72, 153, 0.3)'
    },
    'design': {
      primary: '#14B8A6',
      gradient: '#2DD4BF',
      shadow: 'rgba(20, 184, 166, 0.3)'
    },
    'general': {
      primary: '#64748B',
      gradient: '#94A3B8',
      shadow: 'rgba(100, 116, 139, 0.3)'
    },
    'career': {
      primary: '#EF4444',
      gradient: '#F87171',
      shadow: 'rgba(239, 68, 68, 0.3)'
    },
    'role': {
      primary: '#EF4444',
      gradient: '#F87171',
      shadow: 'rgba(239, 68, 68, 0.3)'
    },
    'software-dev': {
      primary: '#3B82F6',
      gradient: '#60A5FA',
      shadow: 'rgba(59, 130, 246, 0.3)'
    },
    'data-science': {
      primary: '#8B5CF6',
      gradient: '#A78BFA',
      shadow: 'rgba(139, 92, 246, 0.3)'
    },
    'business': {
      primary: '#EC4899',
      gradient: '#F472B6',
      shadow: 'rgba(236, 72, 153, 0.3)'
    },
    'domain-skills': {
      primary: '#14B8A6',
      gradient: '#2DD4BF',
      shadow: 'rgba(20, 184, 166, 0.3)'
    }
  }

  // Calculate hierarchical layout based on prerequisites
  const calculateHierarchicalLayout = (nodes, edges) => {
    const positions = {}
    const levels = {}
    const nodesByLevel = {}

    // Build adjacency list for incoming edges (prerequisites)
    const incomingEdges = {}
    const outgoingEdges = {}

    nodes.forEach(node => {
      incomingEdges[node.id] = []
      outgoingEdges[node.id] = []
    })

    edges.forEach(edge => {
      if (edge.type === 'PREREQUISITE_OF') {
        incomingEdges[edge.target]?.push(edge.source)
        outgoingEdges[edge.source]?.push(edge.target)
      }
    })

    // Assign levels using topological sort
    const visited = new Set()
    const assignLevel = (nodeId, level = 0) => {
      if (visited.has(nodeId)) return levels[nodeId] || 0
      visited.add(nodeId)

      const incoming = incomingEdges[nodeId] || []
      if (incoming.length === 0) {
        levels[nodeId] = 0
      } else {
        const maxPrereqLevel = Math.max(...incoming.map(prereq => assignLevel(prereq, level)))
        levels[nodeId] = maxPrereqLevel + 1
      }

      return levels[nodeId]
    }

    // Assign levels to all nodes
    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        assignLevel(node.id)
      }
    })

    // Group nodes by level
    nodes.forEach(node => {
      const level = levels[node.id] || 0
      if (!nodesByLevel[level]) nodesByLevel[level] = []
      nodesByLevel[level].push(node)
    })

    // Position nodes with much better spacing
    const levelWidth = 400 // Increased horizontal spacing
    const nodeHeight = 180 // Increased vertical spacing
    const startX = 150
    const startY = 100

    Object.keys(nodesByLevel).forEach(level => {
      const levelNodes = nodesByLevel[level]
      const levelNum = Number(level)

      // Sort nodes in level by category for better grouping
      levelNodes.sort((a, b) => {
        const catA = a.category || 'general'
        const catB = b.category || 'general'
        return catA.localeCompare(catB)
      })

      // Center nodes vertically for this level
      const totalHeight = levelNodes.length * nodeHeight
      const offsetY = 0 // Can adjust for centering

      levelNodes.forEach((node, index) => {
        positions[node.id] = {
          x: levelNum * levelWidth + startX,
          y: index * nodeHeight + startY + offsetY,
          vx: 0,
          vy: 0
        }
      })
    })

    return positions
  }

  // Initialize node positions using hierarchical layout
  useEffect(() => {
    if (!graphData || !graphData.nodes) return

    const nodes = graphData.nodes
    const edges = graphData.edges || []

    const positions = calculateHierarchicalLayout(nodes, edges)
    setNodePositions(positions)
  }, [graphData])

  // Handle container resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({ width: rect.width, height: rect.height })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Render graph on canvas
  useEffect(() => {
    if (!canvasRef.current || !graphData) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const { width, height } = dimensions
    const { x: tx, y: ty, scale } = transform

    canvas.width = width
    canvas.height = height

    ctx.clearRect(0, 0, width, height)
    ctx.save()
    ctx.translate(tx, ty)
    ctx.scale(scale, scale)

    // Draw edges first (so they appear behind nodes)
    if (graphData.edges) {
      graphData.edges.forEach(edge => {
        const sourcePos = nodePositions[edge.source]
        const targetPos = nodePositions[edge.target]

        if (!sourcePos || !targetPos) return

        const isHighlighted = highlightedPath.some(
          path => path.source === edge.source && path.target === edge.target
        )

        // Draw edge line with gradient
        const gradient = ctx.createLinearGradient(sourcePos.x, sourcePos.y, targetPos.x, targetPos.y)
        gradient.addColorStop(0, isHighlighted ? '#F59E0B' : 'rgba(148, 163, 184, 0.4)')
        gradient.addColorStop(1, isHighlighted ? '#FBBF24' : 'rgba(148, 163, 184, 0.2)')

        ctx.beginPath()
        ctx.moveTo(sourcePos.x, sourcePos.y)
        ctx.lineTo(targetPos.x, targetPos.y)
        ctx.strokeStyle = gradient
        ctx.lineWidth = isHighlighted ? 3 : 1.5
        ctx.stroke()

        // Draw arrow with better styling
        const angle = Math.atan2(targetPos.y - sourcePos.y, targetPos.x - sourcePos.x)
        const arrowSize = isHighlighted ? 12 : 8
        const nodeRadius = 32
        const distance = Math.sqrt(
          Math.pow(targetPos.x - sourcePos.x, 2) +
          Math.pow(targetPos.y - sourcePos.y, 2)
        )
        const arrowX = sourcePos.x + (distance - nodeRadius - 8) * Math.cos(angle)
        const arrowY = sourcePos.y + (distance - nodeRadius - 8) * Math.sin(angle)

        ctx.beginPath()
        ctx.moveTo(arrowX, arrowY)
        ctx.lineTo(
          arrowX - arrowSize * Math.cos(angle - Math.PI / 6),
          arrowY - arrowSize * Math.sin(angle - Math.PI / 6)
        )
        ctx.lineTo(
          arrowX - arrowSize * Math.cos(angle + Math.PI / 6),
          arrowY - arrowSize * Math.sin(angle + Math.PI / 6)
        )
        ctx.closePath()
        ctx.fillStyle = isHighlighted ? '#F59E0B' : 'rgba(148, 163, 184, 0.5)'
        ctx.fill()
      })
    }

    // Draw nodes with modern styling
    if (graphData.nodes) {
      graphData.nodes.forEach(node => {
        const pos = nodePositions[node.id]
        if (!pos) return

        const isHighlighted = highlightedNodes.includes(node.id)
        const isSelected = selectedNode === node.id
        const isHovered = hoveredNode === node.id

        const nodeRadius = node.type === 'role' ? 38 : 32

        const category = node.category || 'general'
        const colors = categoryColors[category] || categoryColors.general

        // Draw outer glow for hover/select
        if (isHovered || isSelected || isHighlighted) {
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, nodeRadius + 8, 0, 2 * Math.PI)
          const glowGradient = ctx.createRadialGradient(pos.x, pos.y, nodeRadius, pos.x, pos.y, nodeRadius + 8)
          glowGradient.addColorStop(0, colors.shadow)
          glowGradient.addColorStop(1, 'transparent')
          ctx.fillStyle = glowGradient
          ctx.fill()
        }

        // Draw shadow
        ctx.shadowColor = colors.shadow
        ctx.shadowBlur = isSelected ? 20 : (isHovered ? 15 : 10)
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 4

        // Draw node circle with gradient
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, nodeRadius, 0, 2 * Math.PI)

        const nodeGradient = ctx.createRadialGradient(
          pos.x - nodeRadius * 0.3,
          pos.y - nodeRadius * 0.3,
          0,
          pos.x,
          pos.y,
          nodeRadius
        )

        if (isHighlighted) {
          nodeGradient.addColorStop(0, '#FCD34D')
          nodeGradient.addColorStop(1, '#F59E0B')
        } else {
          nodeGradient.addColorStop(0, colors.gradient)
          nodeGradient.addColorStop(1, colors.primary)
        }

        ctx.fillStyle = nodeGradient
        ctx.fill()

        // Draw border
        ctx.strokeStyle = isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.3)'
        ctx.lineWidth = isSelected ? 3 : 2
        ctx.stroke()

        // Reset shadow
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0

        // Draw role icon with better styling
        if (node.type === 'role') {
          ctx.fillStyle = '#FFFFFF'
          ctx.font = 'bold 20px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('🎯', pos.x, pos.y)
        }

        // Draw completion checkmark
        if (node.completed) {
          ctx.beginPath()
          ctx.arc(pos.x + nodeRadius - 8, pos.y - nodeRadius + 8, 10, 0, 2 * Math.PI)
          ctx.fillStyle = '#10B981'
          ctx.fill()
          ctx.strokeStyle = '#FFFFFF'
          ctx.lineWidth = 2
          ctx.stroke()

          ctx.fillStyle = '#FFFFFF'
          ctx.font = 'bold 12px sans-serif'
          ctx.fillText('✓', pos.x + nodeRadius - 8, pos.y - nodeRadius + 8)
        }

        // Draw label with better typography and background
        ctx.fillStyle = '#FFFFFF'
        ctx.font = `${isSelected ? 'bold' : '600'} 13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'

        const label = node.label || node.id
        const maxWidth = 160
        const lines = []
        const words = label.split(' ')
        let currentLine = ''

        // Word wrap
        words.forEach((word) => {
          const testLine = currentLine + (currentLine ? ' ' : '') + word
          const metrics = ctx.measureText(testLine)
          if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine)
            currentLine = word
          } else {
            currentLine = testLine
          }
        })
        if (currentLine) lines.push(currentLine)

        // Draw text background for better readability
        const lineHeight = 18
        const textPadding = 8
        const bgWidth = Math.max(...lines.map(line => ctx.measureText(line).width)) + textPadding * 2
        const bgHeight = lines.length * lineHeight + textPadding * 2
        const bgX = pos.x - bgWidth / 2
        const bgY = pos.y + nodeRadius + 8

        ctx.fillStyle = 'rgba(30, 41, 59, 0.95)'
        ctx.beginPath()
        ctx.roundRect(bgX, bgY, bgWidth, bgHeight, 6)
        ctx.fill()

        // Draw text with shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
        ctx.shadowBlur = 4
        ctx.shadowOffsetY = 1
        ctx.fillStyle = '#FFFFFF'

        let textY = bgY + textPadding + 4
        lines.forEach(line => {
          ctx.fillText(line, pos.x, textY)
          textY += lineHeight
        })

        ctx.shadowColor = 'transparent'
      })
    }

    ctx.restore()
  }, [graphData, nodePositions, transform, hoveredNode, selectedNode, highlightedNodes, highlightedPath, dimensions])

  // Mouse event handlers
  const getCanvasCoordinates = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - transform.x) / transform.scale
    const y = (e.clientY - rect.top - transform.y) / transform.scale
    return { x, y }
  }

  const findNodeAtPosition = (x, y) => {
    if (!graphData || !graphData.nodes) return null

    for (const node of graphData.nodes) {
      const pos = nodePositions[node.id]
      if (!pos) continue

      const nodeRadius = node.type === 'role' ? 35 : 28

      const dx = pos.x - x
      const dy = pos.y - y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance <= nodeRadius) {
        return node
      }
    }
    return null
  }

  const handleMouseMove = (e) => {
    const { x, y } = getCanvasCoordinates(e)
    const node = findNodeAtPosition(x, y)
    setHoveredNode(node ? node.id : null)

    if (isDragging) {
      const dx = e.clientX - dragStart.x
      const dy = e.clientY - dragStart.y
      setTransform(prev => ({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy
      }))
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseDown = (e) => {
    const { x, y } = getCanvasCoordinates(e)
    const node = findNodeAtPosition(x, y)

    if (node) {
      setSelectedNode(node.id)
      if (onNodeClick) onNodeClick(node)
    } else {
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setTransform(prev => ({
      ...prev,
      scale: Math.max(0.1, Math.min(3, prev.scale * delta))
    }))
  }

  const handleZoomIn = () => {
    setTransform(prev => ({ ...prev, scale: Math.min(3, prev.scale * 1.2) }))
  }

  const handleZoomOut = () => {
    setTransform(prev => ({ ...prev, scale: Math.max(0.1, prev.scale / 1.2) }))
  }

  const handleResetView = () => {
    setTransform({ x: 0, y: 0, scale: 1 })
  }

  return (
    <div ref={containerRef} className="relative w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl overflow-hidden border border-slate-700/50 shadow-2xl">
      <canvas
        ref={canvasRef}
        className="cursor-grab active:cursor-grabbing"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Controls with modern styling */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="p-3 bg-slate-800/90 backdrop-blur-md rounded-lg shadow-lg hover:bg-slate-700 transition-all border border-slate-600/50 hover:scale-105"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5 text-slate-200" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-3 bg-slate-800/90 backdrop-blur-md rounded-lg shadow-lg hover:bg-slate-700 transition-all border border-slate-600/50 hover:scale-105"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5 text-slate-200" />
        </button>
        <button
          onClick={handleResetView}
          className="p-3 bg-slate-800/90 backdrop-blur-md rounded-lg shadow-lg hover:bg-slate-700 transition-all border border-slate-600/50 hover:scale-105"
          title="Reset View"
        >
          <Maximize2 className="w-5 h-5 text-slate-200" />
        </button>
      </div>

      {/* Legend with modern styling */}
      <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur-md rounded-xl shadow-2xl p-5 max-w-xs border border-slate-600/50">
        <h3 className="font-bold text-base mb-4 text-slate-100">Legend</h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg"></div>
            <span className="text-slate-200 font-medium">Frontend</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg"></div>
            <span className="text-slate-200 font-medium">Backend</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg"></div>
            <span className="text-slate-200 font-medium">Database</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg"></div>
            <span className="text-slate-200 font-medium">DevOps</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-lg"></div>
            <span className="text-slate-200 font-medium">🎯 Role</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-1 bg-gradient-to-r from-slate-500 to-slate-400 rounded"></div>
            <span className="text-slate-300 text-[10px]">→ Prerequisite</span>
          </div>
        </div>
      </div>

      {/* Hovered Node Info with modern styling */}
      {hoveredNode && graphData && (
        <div className="absolute top-4 left-4 bg-slate-800/95 backdrop-blur-md rounded-xl shadow-2xl p-5 max-w-md border border-slate-600/50 animate-in fade-in slide-in-from-top-2 duration-200">
          {(() => {
            const node = graphData.nodes.find(n => n.id === hoveredNode)
            if (!node) return null
            const category = node.category || 'general'
            const colors = categoryColors[category] || categoryColors.general
            return (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-3 h-3 rounded-full shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${colors.gradient}, ${colors.primary})`,
                      boxShadow: `0 0 20px ${colors.shadow}`
                    }}
                  ></div>
                  <h3 className="font-bold text-lg text-slate-100">{node.label}</h3>
                </div>
                <p className="text-sm text-slate-300 mb-3 leading-relaxed">{node.description}</p>
                <div className="flex gap-2 text-xs flex-wrap">
                  <span className="px-3 py-1.5 bg-slate-700/70 text-slate-200 rounded-full font-medium border border-slate-600/30">
                    {node.category}
                  </span>
                  {node.type === 'role' && (
                    <span className="px-3 py-1.5 bg-red-500/20 text-red-200 rounded-full font-medium border border-red-500/30">
                      Career Role
                    </span>
                  )}
                  {node.completed && (
                    <span className="px-3 py-1.5 bg-green-500/20 text-green-200 rounded-full font-medium border border-green-500/30">
                      ✓ Completed
                    </span>
                  )}
                </div>
              </>
            )
          })()}
        </div>
      )}
    </div>
  )
}

export default KnowledgeGraph
