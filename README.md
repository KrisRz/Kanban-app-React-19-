# Kanban Task Management App

A modern task management application built with Next.js 15, React 19, Tailwind CSS, and Shadcn UI components. This app allows you to manage tasks in a Kanban-style board, assign tasks to team members, and track progress with an intuitive drag-and-drop interface.

## Quick Start

To get the application running quickly:

1. Make sure Docker Desktop is running
2. Start the PostgreSQL database:
   ```bash
   docker-compose up -d
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Seed the database with initial data:
   ```bash
   npm run db:seed
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) in your browser

## About This Project

This Kanban Task Management application provides teams with a visual way to manage work. It features:

- **Intuitive Drag-and-Drop Interface**: Easily move tasks between To Do, In Progress, and Done columns with real-time updates
- **Professional UI Design**: Clean, modern interface with visual hierarchy, status indicators, and interactive elements
- **Team Collaboration**: Add team members and assign tasks with visual avatars
- **Task Prioritization**: Visual indicators for task priority levels
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Dark Mode Support**: Full support for light and dark color schemes

The application demonstrates modern web development practices including server components, server actions, optimistic updates, and skeleton loading states.

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **UI:** React 19, Tailwind CSS, Shadcn UI, Lucide Icons
- **Database:** PostgreSQL with Drizzle ORM
- **Features:** 
  - Interactive drag-and-drop functionality (HTML5 Drag and Drop API)
  - Real-time visual feedback during dragging
  - Visual task status tracking
  - Task assignment with avatar visualization
  - Priority level management
  - Responsive design with dark mode support

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- PostgreSQL database (or Docker Desktop)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/KrisRz/Kanban-app-React-19-
cd kris_rz
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up your environment variables:
   
Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/kanban
```

Adjust the connection string according to your PostgreSQL setup.

### Database Setup

#### Option 1: Using Docker Desktop (Recommended for Development)

1. Make sure Docker Desktop is installed and running on your machine.

2. Start the PostgreSQL container:

```bash
docker run --name kanban_postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=kanban -p 5432:5432 -d postgres:16
```

Or if you're using Docker Compose, create a `docker-compose.yml` file:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16
    container_name: kanban_postgres
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: kanban
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  pgadmin:
    image: dpage/pgadmin4
    container_name: kanban_pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@admin.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

Then run:

```bash
docker-compose up -d
```

#### Option 2: Using a Local PostgreSQL Installation

1. Install PostgreSQL on your machine.
2. Create a database named `kanban`.
3. Update the `.env` file with your connection details.

### Running the Development Server

1. Start the Next.js development server:

```bash
npm run dev
# or
yarn dev
```

2. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Database Management

This project uses PostgreSQL with Drizzle ORM. To manage your database:

1. Make sure your PostgreSQL server is running.

2. Run database migrations to set up the schema:

```bash
npm run db:migrate
# or
yarn db:migrate
```

3. (Optional) Seed the database with initial data:

```bash
npm run db:seed
# or
yarn db:seed
```

4. Open the Drizzle Studio to view and edit database records:

```bash
npm run db:studio
# or
yarn db:studio
```

This will start Drizzle Studio at [http://localhost:4000](http://localhost:4000).

5. To check database connectivity:

```bash
npm run db:check
# or
yarn db:check
```

## Project Structure

- `/app` - Next.js App Router pages and layouts
- `/components` - React components
- `/db` - Database schema and configuration
- `/lib` - Utility functions, actions, and types
- `/public` - Static assets

## Features

- **Enhanced Kanban Board:** 
  - Interactive drag-and-drop interface with visual feedback
  - Status-specific column styling (different colors for Todo, In Progress, Done)
  - Visual indicators when dragging over drop targets
  - Automatic server synchronization when moving tasks

- **Professional Task Cards:**
  - Clean, modern design with proper visual hierarchy
  - Status badges with icons (Circle for Todo, Clock for In Progress, Check for Done)
  - Interactive hover effects with action buttons
  - Priority level indicators (Low, Medium, High) with color coding
  - Assignee avatars with initials in colored circles

- **User Management:** 
  - Add and manage team members with detailed profiles
  - Visual avatar system consistent throughout the application
  - Assign users to tasks with drag-and-drop simplicity

- **Task Assignment:** 
  - Easily assign or reassign tasks to team members
  - Visual indication of task ownership
  - Filter tasks by assignee

- **Responsive Design:**
  - Works seamlessly on desktop, tablet, and mobile devices
  - Optimized drag-and-drop experience across device types
  - Full dark mode support for late-night work sessions

## Development Notes

- The application uses server components where possible for optimal performance
- Server actions are used for data mutations with optimistic updates
- Loading states use skeleton components for better UX
- The drag-and-drop functionality uses native HTML5 Drag and Drop API for React 19 compatibility
- Custom styling provides visual feedback during drag operations
- The UI is fully responsive for mobile and desktop devices

### Implementation Details

- **Drag and Drop:** Using native HTML5 Drag and Drop API instead of libraries for better React 19 compatibility
- **Visual Feedback:** Custom styling for drag states with transitions for smooth user experience
- **Server Sync:** Real-time updates with server actions when tasks are moved between columns
- **Error Handling:** Graceful fallbacks if server operations fail
- **Accessibility:** Designed with accessibility in mind for keyboard navigation

### Note on Loading Delays

For demonstration purposes, the application includes artificial 3-second delays in page loading to showcase the skeleton loading states. These can be removed by editing:

- `app/page.tsx` - Remove the `await sleep(3000)` line
- `app/users/page.tsx` - Remove the `await sleep(3000)` line
- `app/users/[id]/page.tsx` - Remove the `await sleep(3000)` line

In a production environment, these artificial delays would be removed, and the skeleton states would only appear during actual data fetching.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Screenshots

![Kanban Board](public/screenshots/kanban-board.png)
*The main Kanban board with drag-and-drop functionality*

![Task Card Design](public/screenshots/task-card.png)
*Professional task card design with status indicators and assignee avatars*

![User Management](public/screenshots/user-management.png)
*User management interface with clean design*
