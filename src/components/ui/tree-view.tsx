"use client"

import * as React from "react"
import { ChevronDown, ChevronRight, Folder, File } from "lucide-react"
import { cn } from "@/lib/utils"

interface TreeNodeProps {
  id: string
  name: string
  level: number
  isOpen?: boolean
  isSelected?: boolean
  hasChildren?: boolean
  icon?: React.ReactNode
  onClick?: () => void
  onToggle?: () => void
  className?: string
}

interface TreeProps {
  children: React.ReactNode
  className?: string
}

const TreeContext = React.createContext<{
  expandedNodes: Set<string>
  selectedNode: string | null
  toggleNode: (id: string) => void
  selectNode: (id: string) => void
}>({
  expandedNodes: new Set<string>(),
  selectedNode: null,
  toggleNode: () => {},
  selectNode: () => {},
})

export function useTreeView() {
  const context = React.useContext(TreeContext)
  if (!context) {
    throw new Error("useTreeView must be used within a TreeProvider")
  }
  return context
}

export function TreeView({
  children,
  className,
  defaultExpandedNodes = [],
  defaultSelectedNode = null,
  onNodeSelect,
}: {
  children: React.ReactNode
  className?: string
  defaultExpandedNodes?: string[]
  defaultSelectedNode?: string | null
  onNodeSelect?: (id: string) => void
}) {
  const [expandedNodes, setExpandedNodes] = React.useState<Set<string>>(
    new Set(defaultExpandedNodes)
  )
  const [selectedNode, setSelectedNode] = React.useState<string | null>(
    defaultSelectedNode
  )

  const toggleNode = React.useCallback((id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const selectNode = React.useCallback(
    (id: string) => {
      setSelectedNode(id)
      onNodeSelect?.(id)
    },
    [onNodeSelect]
  )

  // Lưu trữ giá trị context để tránh render lại không cần thiết
  const contextValue = React.useMemo(() => ({
    expandedNodes,
    selectedNode,
    toggleNode,
    selectNode,
  }), [expandedNodes, selectedNode, toggleNode, selectNode])

  return (
    <TreeContext.Provider value={contextValue}>
      <div
        className={cn("select-none rounded-md border p-2", className)}
        role="tree"
        aria-multiselectable="false"
      >
        {children}
      </div>
    </TreeContext.Provider>
  )
}

// TreeNode đã được memo hóa để tránh render lại không cần thiết
export const TreeNode = React.memo(function TreeNodeComponent({
  id,
  name,
  level = 0,
  hasChildren = false,
  icon,
  onClick,
  onToggle,
  className,
  children,
}: TreeNodeProps & { children?: React.ReactNode }) {
  const { expandedNodes, selectedNode, toggleNode, selectNode } = useTreeView()
  const isOpen = expandedNodes.has(id)
  const isSelected = selectedNode === id
  
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleNode(id)
    onToggle?.()
  }
  
  const handleClick = () => {
    selectNode(id)
    onClick?.()
  }

  return (
    <div 
      role="treeitem" 
      aria-expanded={hasChildren ? isOpen : undefined}
      aria-selected={isSelected}
      aria-level={level + 1}
    >
      <div
        className={cn(
          "flex items-center py-1 px-2 rounded-sm cursor-pointer",
          isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted",
          className
        )}
        style={{ paddingLeft: `${level * 16 + 4}px` }}
        onClick={handleClick}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          } else if (e.key === 'ArrowRight' && hasChildren && !isOpen) {
            e.preventDefault()
            toggleNode(id)
          } else if (e.key === 'ArrowLeft' && hasChildren && isOpen) {
            e.preventDefault()
            toggleNode(id)
          }
        }}
      >
        {hasChildren ? (
          <span 
            className="mr-1 h-4 w-4" 
            onClick={handleToggle}
            role="button"
            aria-label={isOpen ? "Collapse" : "Expand"}
          >
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>
        ) : (
          <span className="mr-1 w-4" />
        )}
        {icon || (hasChildren ? <Folder className="h-4 w-4 mr-2" /> : <File className="h-4 w-4 mr-2" />)}
        <span className="truncate">{name}</span>
      </div>
      {isOpen && hasChildren && (
        <div role="group" className="pl-2">
          {children}
        </div>
      )}
    </div>
  )
})

export function TreeGroup({ children, className }: TreeProps) {
  return (
    <div role="group" className={cn("", className)}>
      {children}
    </div>
  )
} 