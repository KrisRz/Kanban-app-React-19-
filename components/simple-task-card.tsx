import React, { forwardRef, useState } from 'react';
import { Task } from '@/lib/types';
import { Pencil, Trash2, Clock, CheckCircle2, CircleDashed } from 'lucide-react';

interface SimpleTaskCardProps {
  task: Task;
  onDragStart?: () => void;
}

const SimpleTaskCard = forwardRef<HTMLDivElement, SimpleTaskCardProps>(
  ({ task, onDragStart }, ref) => {
    const [isHovered, setIsHovered] = useState(false);
    
    // Handle onDragStart
    const handleDragStart = (e: React.DragEvent) => {
      e.stopPropagation();
      
      // Set data for drop target to identify this task
      e.dataTransfer.setData('text/plain', task.id.toString());
      e.dataTransfer.effectAllowed = 'move';
      
      // Log for debugging
      console.log('Drag started for task:', task.id);
      
      // Call parent handler if provided
      if (onDragStart) {
        onDragStart();
      }
    };
    
    // Status icon mapping
    const statusIcon = {
      'todo': <CircleDashed className="w-4 h-4 text-gray-500" />,
      'in-progress': <Clock className="w-4 h-4 text-blue-500" />,
      'done': <CheckCircle2 className="w-4 h-4 text-green-500" />
    }[task.status];
    
    // Status color mapping
    const statusColors = {
      'todo': 'bg-gray-100 text-gray-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'done': 'bg-green-100 text-green-800'
    }[task.status];
    
    // Get initials for avatar
    const getInitials = (name: string) => {
      return name.split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    };
    
    // Priority mapping (randomly assign one for visual purposes)
    const priorityMap = {
      1: { text: 'Low', color: 'bg-green-100 text-green-800' },
      2: { text: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
      3: { text: 'High', color: 'bg-red-100 text-red-800' },
    };
    
    // Use task ID to deterministically assign priority (just for demo purposes)
    const priorityId = (task.id % 3) + 1 as 1 | 2 | 3;
    const priority = priorityMap[priorityId];
    
    return (
      <div
        ref={ref}
        draggable
        onDragStart={handleDragStart}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="p-4 bg-white dark:bg-zinc-800 border dark:border-zinc-700 rounded-xl shadow-sm mb-3 cursor-grab hover:shadow-md hover:border-primary dark:hover:border-primary/70 transition-all duration-200"
        data-task-id={task.id}
      >
        <div className="flex flex-col gap-2">
          {/* Header with title and status */}
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{task.title}</h3>
            <div className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusColors}`}>
              {statusIcon}
              <span>
                {task.status === 'todo' ? 'To Do' : 
                 task.status === 'in-progress' ? 'In Progress' : 'Done'}
              </span>
            </div>
          </div>
          
          {/* Description */}
          {task.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{task.description}</p>
          )}
          
          {/* Actions that appear on hover */}
          <div className={`flex justify-end gap-1 ${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
            <button className="p-1 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30">
              <Pencil className="w-4 h-4" />
            </button>
            <button className="p-1 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          {/* Footer with assignee and priority */}
          <div className="flex justify-between items-center text-xs mt-1 pt-3 border-t border-gray-100 dark:border-gray-700">
            {task.assignee ? (
              <div className="flex items-center gap-2">
                <div className={`h-6 w-6 rounded-full bg-blue-${(task.assignee.id % 5) + 1}00 text-white flex items-center justify-center text-xs font-medium`}>
                  {getInitials(task.assignee.name)}
                </div>
                <span className="text-gray-600 dark:text-gray-300">{task.assignee.name}</span>
              </div>
            ) : (
              <div className="text-gray-400 dark:text-gray-500">Unassigned</div>
            )}
            
            <div className={`px-2 py-1 rounded-md text-xs font-medium ${priority.color}`}>
              {priority.text}
            </div>
          </div>
          
          {/* Subtle task ID indicator */}
          <div className="text-[10px] text-gray-400 dark:text-gray-500 text-right -mt-1">
            #{task.id}
          </div>
        </div>
      </div>
    );
  }
);

SimpleTaskCard.displayName = 'SimpleTaskCard';

export default SimpleTaskCard; 