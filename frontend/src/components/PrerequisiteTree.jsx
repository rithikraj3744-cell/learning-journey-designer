import { useEffect, useState } from 'react';
import { ChevronRight, CheckCircle } from 'lucide-react';

const PrerequisiteTree = ({ competencyId }) => {
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, fetch the prerequisite tree from Firestore
    // For now, using mock data
    fetchPrerequisiteTree();
  }, [competencyId]);

  const fetchPrerequisiteTree = async () => {
    setLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock tree data
    const mockTree = {
      id: competencyId,
      name: 'Current Competency',
      prerequisites: [
        {
          id: 'prereq-1',
          name: 'Foundation Skill 1',
          completed: true,
          prerequisites: [
            {
              id: 'prereq-1-1',
              name: 'Basic Skill 1.1',
              completed: true,
              prerequisites: []
            },
            {
              id: 'prereq-1-2',
              name: 'Basic Skill 1.2',
              completed: false,
              prerequisites: []
            }
          ]
        },
        {
          id: 'prereq-2',
          name: 'Foundation Skill 2',
          completed: false,
          prerequisites: [
            {
              id: 'prereq-2-1',
              name: 'Basic Skill 2.1',
              completed: true,
              prerequisites: []
            }
          ]
        }
      ]
    };

    setTreeData(mockTree);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!treeData || treeData.prerequisites.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
        No prerequisite chain to display
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        This diagram shows the learning path dependencies. Complete items from bottom to top.
      </div>

      {/* Tree Visualization */}
      <div className="relative">
        <TreeNode node={treeData} isRoot={true} />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-gray-600 dark:text-gray-400">In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-600"></div>
          <span className="text-gray-600 dark:text-gray-400">Not Started</span>
        </div>
      </div>
    </div>
  );
};

// Tree Node Component
const TreeNode = ({ node, isRoot = false, level = 0 }) => {
  const [expanded, setExpanded] = useState(true);

  const hasPrerequisites = node.prerequisites && node.prerequisites.length > 0;

  const getStatusColor = () => {
    if (isRoot) return 'bg-blue-500';
    if (node.completed) return 'bg-green-500';
    return 'bg-gray-400 dark:bg-gray-600';
  };

  const getNodeBgColor = () => {
    if (isRoot) return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    if (node.completed) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
  };

  return (
    <div className="relative">
      {/* Node */}
      <div className={`flex items-center gap-3 p-3 rounded-lg border ${getNodeBgColor()} ${level > 0 ? 'ml-8' : ''}`}>
        {/* Status Indicator */}
        <div className="relative flex-shrink-0">
          <div className={`w-4 h-4 rounded-full ${getStatusColor()}`}>
            {node.completed && (
              <CheckCircle className="w-4 h-4 text-white" />
            )}
          </div>
        </div>

        {/* Node Content */}
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-medium truncate ${
            isRoot
              ? 'text-blue-900 dark:text-blue-100'
              : 'text-gray-900 dark:text-white'
          }`}>
            {node.name}
            {isRoot && ' (Target)'}
          </h4>
        </div>

        {/* Expand/Collapse Button */}
        {hasPrerequisites && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-shrink-0 p-1 hover:bg-white dark:hover:bg-gray-700 rounded transition-colors"
          >
            <ChevronRight
              className={`h-4 w-4 text-gray-600 dark:text-gray-400 transition-transform ${
                expanded ? 'rotate-90' : ''
              }`}
            />
          </button>
        )}
      </div>

      {/* Connector Line */}
      {hasPrerequisites && level > 0 && (
        <div className="absolute left-4 top-0 w-px h-full bg-gray-300 dark:bg-gray-600 -z-10"></div>
      )}

      {/* Prerequisites */}
      {hasPrerequisites && expanded && (
        <div className="mt-3 space-y-3 relative">
          {/* Horizontal connector */}
          <div className="absolute left-4 top-0 w-4 h-px bg-gray-300 dark:bg-gray-600"></div>

          {node.prerequisites.map((prereq, index) => (
            <div key={prereq.id} className="relative">
              {/* Vertical connector for multiple prerequisites */}
              {index > 0 && (
                <div className="absolute left-4 -top-3 w-px h-3 bg-gray-300 dark:bg-gray-600"></div>
              )}
              <TreeNode node={prereq} level={level + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrerequisiteTree;
