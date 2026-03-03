import { RoleTree as RoleNode } from "../../../types/accounts.types";
import { ChevronRight, ChevronDown, User, Network } from "lucide-react";
import { useState } from "react";
import { cn } from "../../../lib/utils";

interface RoleTreeProps {
  nodes: RoleNode[];
  level?: number;
}

export const RoleTree = ({ nodes, level = 0 }: RoleTreeProps) => {
  if (!nodes || nodes.length === 0) return null;

  return (
    <div className={cn("flex flex-col gap-2", level > 0 && "pl-6 border-l border-gray-200 ml-3")}>
      {nodes.map((node) => (
        <RoleTreeNode key={node.id} node={node} level={level} />
      ))}
    </div>
  );
};

const RoleTreeNode = ({ node, level }: { node: RoleNode; level: number }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="relative group animate-in fade-in slide-in-from-top-1 duration-200">
      <div className={cn(
        "flex items-center gap-2 p-3 rounded-lg border bg-white transition-all",
        "hover:shadow-md hover:border-blue-200",
        node.is_organizational_position ? "border-l-4 border-l-blue-500" : "border-l-4 border-l-gray-300"
      )}>
        {/* Expand toggle */}
        <button 
           onClick={() => setIsExpanded(!isExpanded)}
           className={cn("p-1 rounded hover:bg-gray-100 text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20", !hasChildren && "invisible")}
        >
           {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {/* Icon */}
        <div className={cn("p-2 rounded-full", node.is_organizational_position ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500")}>
           {node.is_organizational_position ? <Network className="w-4 h-4" /> : <User className="w-4 h-4" />}
        </div>

        {/* Content */}
        <div className="flex-1">
             <h4 className="font-medium text-sm text-gray-900">{node.name}</h4>
             <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-[10px]">{node.code}</span>
                {node.level !== undefined && <span className="text-gray-400">Lvl {node.level}</span>}
             </div>
        </div>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
          <div className="mt-2 text-sm text-gray-500">
            <RoleTree nodes={node.children} level={level + 1} />
          </div>
      )}
    </div>
  );
};
