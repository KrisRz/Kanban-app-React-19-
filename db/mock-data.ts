/**
 * Mock data for demonstration purposes when database is unavailable
 * Used in production when the real database connection fails
 */

export const mockUsers = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    role: "Designer",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    created_at: new Date("2023-04-15"),
    updated_at: new Date("2023-05-10")
  },
  {
    id: 2,
    name: "Alex Chen",
    email: "alex.chen@example.com",
    role: "Developer",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    created_at: new Date("2023-04-16"),
    updated_at: new Date("2023-05-11")
  },
  {
    id: 3,
    name: "Maria Rodriguez",
    email: "maria.rodriguez@example.com",
    role: "Project Manager",
    avatar: "https://randomuser.me/api/portraits/women/28.jpg",
    created_at: new Date("2023-04-17"),
    updated_at: new Date("2023-05-12")
  },
  {
    id: 4,
    name: "Demo User",
    email: "demo@example.com",
    role: "Developer",
    avatar: "https://ui-avatars.com/api/?name=Demo+User&background=random",
    created_at: new Date("2023-04-10"),
    updated_at: new Date("2023-05-05")
  }
];

export const mockColumns = [
  {
    id: 1,
    name: "To Do",
    order: 1,
    created_at: new Date("2023-04-15"),
    updated_at: new Date("2023-04-15")
  },
  {
    id: 2,
    name: "In Progress",
    order: 2,
    created_at: new Date("2023-04-15"),
    updated_at: new Date("2023-04-15")
  },
  {
    id: 3,
    name: "Done",
    order: 3,
    created_at: new Date("2023-04-15"),
    updated_at: new Date("2023-04-15")
  }
];

export const mockTasks = [
  {
    id: 1,
    title: "Design new landing page",
    description: "Create wireframes and mockups for the new marketing landing page",
    status: "todo",
    assignee_id: 1, // Sarah
    column_id: 1, // To Do
    order: 1,
    created_at: new Date("2023-05-01"),
    updated_at: new Date("2023-05-01")
  },
  {
    id: 2,
    title: "Implement user authentication",
    description: "Set up JWT authentication for the API",
    status: "in-progress",
    assignee_id: 2, // Alex
    column_id: 2, // In Progress
    order: 1,
    created_at: new Date("2023-05-02"),
    updated_at: new Date("2023-05-05")
  },
  {
    id: 3,
    title: "QA testing for release",
    description: "Perform regression testing on all features before next release",
    status: "todo",
    assignee_id: 4, // Demo User
    column_id: 1, // To Do
    order: 2,
    created_at: new Date("2023-05-03"),
    updated_at: new Date("2023-05-03")
  },
  {
    id: 4,
    title: "Database optimization",
    description: "Optimize database queries and add indexes where necessary",
    status: "done",
    assignee_id: 2, // Alex
    column_id: 3, // Done
    order: 1,
    created_at: new Date("2023-04-25"),
    updated_at: new Date("2023-05-04")
  },
  {
    id: 5,
    title: "Project kickoff meeting",
    description: "Schedule and prepare agenda for the project kickoff meeting",
    status: "done",
    assignee_id: 3, // Maria
    column_id: 3, // Done
    order: 2,
    created_at: new Date("2023-04-20"),
    updated_at: new Date("2023-04-28")
  },
  {
    id: 6,
    title: "UI component library",
    description: "Create reusable UI components for the design system",
    status: "in-progress",
    assignee_id: 1, // Sarah
    column_id: 2, // In Progress
    order: 2,
    created_at: new Date("2023-05-05"),
    updated_at: new Date("2023-05-07")
  }
]; 