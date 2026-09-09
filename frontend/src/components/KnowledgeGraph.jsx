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

  // Category colors - more distinct
  const categoryColors = {
    'frontend': '#3B82F6',
    'backend': '#10B981',
    'database': '#8B5CF6',
    'devops': '#F59E0B',
    'softskills': '#EC4899',
    'design': '#14B8A6',
    'general': '#64748B',
    'career': '#EF4444',
    'role': '#EF4444',
    'software-dev': '#3B82F6',
    'data-science': '#8B5CF6',
    'business': '#EC4899',
    'domain-skills': '#14B8A6'
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

    // Position nodes
    const levelWidth = 250
    const nodeHeight = 120
    const maxLevel = Math.max(...Object.keys(nodesByLevel).map(Number))

    Object.keys(nodesByLevel).forEach(level => {
      const levelNodes = nodesByLevel[level]
      const levelNum = Number(level)

      // Sort nodes in level by category for better grouping
      levelNodes.sort((a, b) => {
        const catA = a.category || 'general'
        const catB = b.category || 'general'
        return catA.localeCompare(catB)
      })

      levelNodes.forEach((node, index) => {
        positions[node.id] = {
          x: levelNum * levelWidth + 150,
          y: (index + 1) * nodeHeight + 50,
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

        // Draw edge line
        ctx.beginPath()
        ctx.moveTo(sourcePos.x, sourcePos.y)
        ctx.lineTo(targetPos.x, targetPos.y)
        ctx.strokeStyle = isHighlighted ? '#F59E0B' : '#4B5563'
        ctx.lineWidth = isHighlighted ? 3 : 2
        ctx.stroke()

        // Draw arrow
        const angle = Math.atan2(targetPos.y - sourcePos.y, targetPos.x - sourcePos.x)
        const arrowSize = isHighlighted ? 14 : 10
        const nodeRadius = 30
        const distance = Math.sqrt(
          Math.pow(targetPos.x - sourcePos.x, 2) +
          Math.pow(targetPos.y - sourcePos.y, 2)
        )
        const arrowX = sourcePos.x + (distance - nodeRadius - 5) * Math.cos(angle)
        const arrowY = sourcePos.y + (distance - nodeRadius - 5) * Math.sin(angle)

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
        ctx.fillStyle = isHighlighted ? '#F59E0B' : '#6B7280'
        ctx.fill()
      })
    }

    // Draw nodes
    if (graphData.nodes) {
      graphData.nodes.forEach(node => {
        const pos = nodePositions[node.id]
        if (!pos) return

        const isHighlighted = highlightedNodes.includes(node.id)
        const isSelected = selectedNode === node.id
        const isHovered = hoveredNode === node.id

        const nodeRadius = node.type === 'role' ? 35 : 28

        // Draw shadow for hover/select
        if (isHovered || isSelected) {
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, nodeRadius + 5, 0, 2 * Math.PI)
          ctx.fillStyle = 'rgba(59, 130, 246, 0.3)'
          ctx.fill()
        }

        // Draw node circle
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, nodeRadius, 0, 2 * Math.PI)

        const category = node.category || 'general'
        const color = categoryColors[category] || categoryColors.general

        if (isHighlighted) {
          ctx.fillStyle = '#FCD34D'
          ctx.strokeStyle = '#F59E0B'
          ctx.lineWidth = 4
        } else if (isSelected) {
          ctx.fillStyle = color
          ctx.strokeStyle = '#3B82F6'
          ctx.lineWidth = 4
        } else {
          ctx.fillStyle = color
          ctx.strokeStyle = '#1F2937'
          ctx.lineWidth = 2
        }

        ctx.fill()
        ctx.stroke()

        // Draw role icon
        if (node.type === 'role') {
          ctx.fillStyle = '#FFFFFF'
          ctx.font = 'bold 24px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('🎯', pos.x, pos.y)
        }

        // Draw label
        ctx.fillStyle = '#F9FAFB'
        ctx.font = `${isSelected ? 'bold' : 'normal'} 13px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'

        const label = node.label || node.id
        const maxWidth = 120
        const words = label.split(' ')
        let line = ''
        let y = pos.y + nodeRadius + 8

        words.forEach((word, i) => {
          const testLine = line + (line ? ' ' : '') + word
          const metrics = ctx.measureText(testLine)
          if (metrics.width > maxWidth && line) {
            ctx.fillText(line, pos.x, y)
            line = word
            y += 16
          } else {
            line = testLine
          }
        })
        ctx.fillText(line, pos.x, y)
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
    <div ref={containerRef} className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        className="cursor-grab active:cursor-grabbing"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-gray-800 rounded-lg shadow-md hover:bg-gray-700 transition border border-gray-700"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5 text-gray-200" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-gray-800 rounded-lg shadow-md hover:bg-gray-700 transition border border-gray-700"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5 text-gray-200" />
        </button>
        <button
          onClick={handleResetView}
          className="p-2 bg-gray-800 rounded-lg shadow-md hover:bg-gray-700 transition border border-gray-700"
          title="Reset View"
        >
          <Maximize2 className="w-5 h-5 text-gray-200" />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-gray-800 rounded-lg shadow-md p-4 max-w-xs border border-gray-700">
        <h3 className="font-semibold text-sm mb-2 text-white">Legend</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: categoryColors.frontend }}></div>
            <span className="text-gray-300">Frontend</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: categoryColors.backend }}></div>
            <span className="text-gray-300">Backend</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: categoryColors.database }}></div>
            <span className="text-gray-300">Database</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: categoryColors.devops }}></div>
            <span className="text-gray-300">DevOps</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: categoryColors.career }}></div>
            <span className="text-gray-300">🎯 Role</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-gray-400"></div>
            <span className="text-gray-300 text-[10px]">→ Prerequisite</span>
          </div>
        </div>
      </div>

      {/* Hovered Node Info */}
      {hoveredNode && graphData && (
        <div className="absolute top-4 left-4 bg-gray-800 rounded-lg shadow-lg p-4 max-w-md border border-gray-700">
          {(() => {
            const node = graphData.nodes.find(n => n.id === hoveredNode)
            if (!node) return null
            return (
              <>
                <h3 className="font-bold text-lg mb-1 text-white">{node.label}</h3>
                <p className="text-sm text-gray-300 mb-2">{node.description}</p>
                <div className="flex gap-2 text-xs">
                  <span className="px-2 py-1 bg-gray-700 text-gray-200 rounded">{node.category}</span>
                  {node.type === 'role' && (
                    <span className="px-2 py-1 bg-blue-900 text-blue-200 rounded">Career Role</span>
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
