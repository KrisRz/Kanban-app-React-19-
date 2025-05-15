'use client'

import { useState } from 'react'
import { 
  DndContext, 
  DragEndEvent, 
  useDraggable, 
  useDroppable, 
  MouseSensor, 
  TouchSensor, 
  useSensor, 
  useSensors 
} from '@dnd-kit/core'

function Draggable() {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: 'draggable',
  })
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-4 bg-blue-500 text-white rounded cursor-grab active:cursor-grabbing"
    >
      Drag me
    </button>
  )
}

function Droppable() {
  const { isOver, setNodeRef } = useDroppable({
    id: 'droppable',
  })
  
  const style = {
    backgroundColor: isOver ? '#e9f5ff' : '#f3f4f6',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-8 border-2 border-dashed border-gray-300 rounded-lg min-h-[200px] flex items-center justify-center"
    >
      Drop here
    </div>
  )
}

export function TestDnd() {
  const [isDropped, setIsDropped] = useState(false)
  
  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 0, // Start dragging immediately
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 0, // No delay
        tolerance: 0, // No tolerance
      },
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { over } = event
    console.log('Drag end:', { over })
    setIsDropped(over?.id === 'droppable')
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">DnD Test</h1>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        {!isDropped && <Draggable />}
        <div className="mt-4">
          <Droppable />
          {isDropped && <div className="mt-4 p-4 bg-green-100 rounded">Item dropped successfully!</div>}
        </div>
      </DndContext>
    </div>
  )
} 