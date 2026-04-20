# Frontend - Task Management System

Modern React 19 + Vite frontend for Task Management System. Built with TailwindCSS, shadcn/ui components, and React Router for a seamless task management experience.

## Stack

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

## Written in

![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)

## Getting Started

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** 9+ (comes with Node.js)
- **Backend API** running on `http://localhost:8080`

### Installation & Setup


### API Endpoints & Contracts

The frontend communicates with the backend via the following REST API endpoints. All endpoints are prefixed with `/api`. All protected endpoints require a valid JWT Bearer token in the `Authorization` header.

#### Authentication (`src/api/auth.api.js`)

| Endpoint | Method | Request Body | Description |
|----------|--------|--------------|-------------|
| `/auth/register` | POST | `{ "username": string, "email": string, "password": string }` | Register new user |
| `/auth/login` | POST | `{ "username": string, "password": string }` | Login user |
| `/auth/refresh` | POST | `{ "refreshToken": string }` | Refresh JWT access token |
| `/auth/otp/request` | POST | `{ "username": string }` | Request OTP for login |
| `/auth/otp/verify` | POST | `{ "username": string, "otp": string }` | Verify OTP and login |
| `/auth/register/otp/request` | POST | `{ "username": string, "email": string, "password": string }` | Request OTP for registration |
| `/auth/register/otp/verify` | POST | `{ "username": string, "email": string, "password": string, "otp": string }` | Verify OTP and register |

**Auth Response Example:**
```json
{
  "message": "string",
  "userId": "string",
  "username": "string",
  "email": "string",
  "tokenType": "Bearer",
  "accessToken": "string",
  "refreshToken": "string",
  "accessTokenExpiresIn": 900,
  "refreshTokenExpiresIn": 604800
}
```

#### User Profile

| Endpoint | Method | Request Body | Description |
|----------|--------|--------------|-------------|
| `/users/{userId}` | GET | – | Get user profile |
| `/users/{userId}` | PUT | `{ "username"?: string, "email"?: string, "avatar"?: string }` | Update user profile |
| `/users/{userId}/avatar` | POST | `multipart/form-data` | Upload avatar image |
| `/users/{userId}/avatar` | DELETE | – | Remove avatar |
| `/users/{userId}/password` | PUT | `{ "oldPassword": string, "newPassword": string }` | Change password |

#### Projects (`src/api/projects.api.js`)

| Endpoint | Method | Request Body | Description |
|----------|--------|--------------|-------------|
| `/projects` | GET | – | Get all projects (optionally filtered) |
| `/projects/paginated` | GET | – | Get paginated projects (query params: page, size, sort, status, search, date ranges) |
| `/projects/status/{status}` | GET | – | Get projects by status |
| `/projects/{projectId}` | GET | – | Get project by ID |
| `/projects` | POST | `{ "name": string, "description": string, "status"?: string, "startDate"?: string, "dueDate"?: string }` | Create project |
| `/projects/{projectId}` | PUT | `{ "name"?: string, "description"?: string, "status"?: string, "startDate"?: string, "dueDate"?: string }` | Update project |
| `/projects/{projectId}` | DELETE | – | Delete project |

#### Tasks (`src/api/tasks.api.js`)

| Endpoint | Method | Request Body | Description |
|----------|--------|--------------|-------------|
| `/tasks` | GET | – | Get all tasks (optionally filtered by userId, projectId, status, priority, search, date ranges) |
| `/tasks/paginated` | GET | – | Get paginated tasks (query params: userId, projectId, status, priority, search, date ranges, page, size, sort) |
| `/tasks/status` | GET | – | Get tasks by status (query params: userId, projectId, status, date ranges) |
| `/tasks/priority` | GET | – | Get tasks by priority (query params: userId, projectId, priority, date ranges) |
| `/tasks/{taskId}` | GET | – | Get task by ID |
| `/tasks` | POST | `{ "title": string, "description"?: string, "priority"?: string, "dueDate"?: string, "projectId"?: string }` | Create task |
| `/tasks/{taskId}` | PUT | `{ "title"?: string, "description"?: string, "priority"?: string, "dueDate"?: string, "status"?: string }` | Update task |
| `/tasks/{taskId}` | DELETE | – | Delete task |

**Task Response Example:**
```json
{
  "id": "string",
  "userId": "string",
  "projectId": "string",
  "title": "string",
  "description": "string",
  "dueDate": "2024-06-01",
  "status": "TODO",
  "priority": "LOW",
  "createdAt": "2024-06-01T12:00:00Z",
  "updatedAt": "2024-06-01T12:00:00Z"
}
```

**Error Response Example:**
```json
{
  "timestamp": "2024-06-01T12:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed: ...",
  "path": "/api/tasks"
}
```

---
## Project Structure

```
src/
├── api/
│   ├── auth.api.js              # Authentication & user endpoints
│   ├── projects.api.js          # Project CRUD operations
│   ├── tasks.api.js             # Task CRUD & filtering
│   └── axios.js                 # Axios instance with JWT interceptor
│
├── components/
│   ├── common/
│   │   └── Navbar.jsx
│   ├── dashboard/
│   │   ├── DashboardSidebar.jsx # Main navigation
│   │   ├── PriorityBadge.jsx    # Priority display (LOW/MEDIUM/HIGH)
│   │   └── StatusBadge.jsx      # Status display (TODO/IN_PROGRESS/DONE)
│   └── ui/                      # shadcn/ui components
│       ├── button.jsx
│       ├── card.jsx
│       ├── input.jsx
│       ├── label.jsx
│       ├── badge.jsx
│       ├── select.jsx
│       ├── pagination-controls.jsx
│       ├── tabs.jsx
│       ├── toggle.jsx
│       ├── tooltip.jsx
│       ├── alert.jsx
│       └── separator.jsx
│
├── context/
│   └── AuthContext.jsx          # Global auth state management
│
├── hooks/
│   ├── useAuth.js               # Access auth context
│   ├── useTheme.js              # Dark/light theme management
│   └── use-mobile.js            # Responsive design helper
│
├── layouts/
│   ├── AppLayout.jsx            # Main layout with sidebar
│   └── AuthLayout.jsx           # Auth pages layout
│
├── pages/
│   ├── LandingPage.jsx          # / - Public landing page
│   ├── LoginPage.jsx            # /login - User login
│   ├── RegisterPage.jsx         # /register - User registration
│   ├── DashboardPage.jsx        # /dashboard - Dashboard overview
│   ├── ProjectsPage.jsx         # /projects - All projects (grid & table)
│   ├── ProjectTasksPage.jsx     # /projects/:id - Project tasks board
│   ├── TaskPage.jsx             # /tasks - All tasks board
│   ├── ProfilePage.jsx          # /profile - User profile & avatar
│   └── NotFoundPage.jsx         # 404 - Not found
│
├── routes/
│   ├── ProtectedRoute.jsx       # Private route wrapper
│   └── PublicOnlyRoute.jsx      # Public-only route wrapper
│
├── constants/
│   └── routes.js                # Route definitions
│
├── lib/
│   ├── authSession.js           # Session/token management
│   └── utils.js                 # Utility functions
│
├── assets/
│   ├── logo.svg                 # App logo
│   └── dashboard-preview.png    # Landing page preview
│
├── App.jsx                       # Root component
├── App.css                       # Global app styles
├── index.css                     # TailwindCSS & theme variables
└── main.jsx                      # App entry point
```

## Pages & Routes

### Public Routes (No Authentication Required)

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `LandingPage.jsx` | Marketing landing page with hero section |
| `/login` | `LoginPage.jsx` | User login form |
| `/register` | `RegisterPage.jsx` | User registration form |
| `*` | `NotFoundPage.jsx` | 404 - Page not found |

### Protected Routes (Authentication Required)

| Route | Component | Description |
|-------|-----------|-------------|
| `/dashboard` | `DashboardPage.jsx` | Dashboard overview with stats |
| `/projects` | `ProjectsPage.jsx` | All projects (grid & table view) |
| `/projects/:id` | `ProjectTasksPage.jsx` | Project tasks with Kanban & list view |
| `/tasks` | `TaskPage.jsx` | All tasks across projects |
| `/profile` | `ProfilePage.jsx` | User profile & settings |

## Authentication

### Auth Flow

1. User registers/logs in with email & password
2. Backend returns JWT token & refresh token
3. Tokens stored in localStorage
4. Axios interceptor auto-adds Authorization header to requests
5. Token auto-refreshed when near expiration
6. Logout clears tokens from localStorage

### Auth Context (`AuthContext.jsx`)

Available in all components via `useAuth()` hook:

```javascript
const { user, isAuthenticated, login, register, logout, updateUser, uploadAvatar, removeAvatar } = useAuth()
```

**Properties:**
- `user` - Current user object with profile info
- `token` - JWT access token
- `isAuthenticated` - Boolean authentication status

**Methods:**
- `login(email, password)` - User login
- `register(email, username, password, firstName, lastName)` - Create account
- `logout()` - Clear auth state
- `updateUser(updates)` - Update profile
- `uploadAvatar(userId, file)` - Upload profile picture
- `removeAvatar(userId)` - Delete profile picture

### Protected Routes

Routes wrapped with `<ProtectedRoute>` require authentication:
```jsx
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>
```

## Pages Overview

### Landing Page (`/`)
- Hero section with greeting
- Dashboard preview image
- "Get Started" call-to-action
- Theme toggle
- Responsive design

### Login Page (`/login`)
- Email & password inputs
- Error handling
- Link to register page
- Input validation

### Register Page (`/register`)
- Email, username, password, first name, last name inputs
- Password validation
- Link to login page
- Form validation

### Dashboard Page (`/dashboard`)
- Welcome message with user name
- Project overview cards
- Recent tasks list
- Quick action buttons
- Total project/task stats

### Projects Page (`/projects`)

**Features:**
- Create new project button
- Two view modes:
  - **Grid View** - Cards with project info, completion %, task count
  - **Table View** - Tabular format with sortable columns
- Edit project dialog
- Delete project (with confirmation)

**Per-Project Stats:**
- Total tasks count
- Completed tasks count
- Completion percentage
- Status badge (ACTIVE, ARCHIVED, COMPLETED)

**Project Card Displays:**
- Project name & description
- Status badge
- Task statistics
- Completion percentage
- Action buttons (Edit, Delete, View Tasks)

### Project Tasks Page (`/projects/:id`)

**Two View Modes:**

1. **Kanban Board View**
   - Three columns: To Do | In Progress | Done
   - Drag & drop tasks between statuses
   - Task cards with title, description, priority, due date
   - Color-coded priority badges
   - Real-time task count badges (showing API totals, not just loaded)
   - Load More button for pagination (6 tasks per column)
   - Task actions: Edit, Delete, View

2. **List View**
   - Table format with columns: Title, Status, Priority, Due Date, Actions
   - Sortable columns
   - Pagination (8 tasks per page)
   - Edit inline or open detail view
   - Delete with confirmation

**Features:**
- Filter by status (To Do, In Progress, Done)
- Filter by priority (Low, Medium, High)
- Date range filter
- Search by title or description
- Create new task button
- Project completion percentage tracker
- Progress bar
- Task statistics

### Global Tasks Page (`/tasks`)
- All tasks across all projects
- Similar Kanban board & list views as ProjectTasksPage
- Filter by project, status, priority
- Search functionality
- Real-time task count badges

### User Profile Page (`/profile`)

**Avatar Section:**
- Current avatar display (circular)
- Upload button with file input
- Avatar preview before upload
- Remove avatar button (destructive action)
- Confirmation dialog before deletion

**Avatar Features:**
- Supported formats: PNG, JPG, JPEG, GIF, WebP
- Max file size: 5MB
- File type & size validation
- Base64 encoding for storage
- Instant preview after upload

**Profile Information:**
- First name & last name display
- Email address
- Username
- Account creation date
- Last updated date
- Edit profile button
- Change password section

## UI Components

### shadcn/ui Components Used
- `Button` - Action buttons with variants
- `Card` - Content containers
- `Input` - Text input fields
- `Label` - Form labels
- `Badge` - Status, priority, tag display
- `Select` - Dropdown selectors
- `Pagination` - Pagination controls
- `Tooltip` - Hover tooltips
- `Tabs` - Tab navigation
- `Alert` - Alert messages
- `Toggle` - Toggle switches
- `Separator` - Visual dividers

### Custom Components
- `StatusBadge` - Displays task status with color coding
- `PriorityBadge` - Displays priority level (Low, Medium, High)
- `DashboardSidebar` - Main navigation sidebar
- `PaginationControls` - Custom pagination component

## State Management

### Context API
- **AuthContext** - Global authentication state
  - User profile
  - JWT tokens
  - Auth methods (login, logout, register)

### Local Component State
- React `useState` for form inputs
- React `useEffect` for data fetching
- `useMemo` for expensive calculations (task counts, completion %)

### Custom Hooks
- `useAuth()` - Access auth context
- `useTheme()` - Access theme state & toggle
- `use-mobile()` - Detect mobile viewport

## 📡 API Integration

### Axios Configuration
File: `src/api/axios.js`

```javascript
const api = axios.create({
  baseURL: 'http://localhost:8080/api'
})

// Auto-inject JWT token in Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

### API Services

#### Authentication (`src/api/auth.api.js`)
- `register(userData)` - Create new account
- `login(credentials)` - User login
- `refreshToken()` - Refresh JWT token
- `getUser(userId)` - Get user profile
- `updateUser(userId, updates)` - Update profile
- `uploadAvatar(userId, file)` - Upload profile picture
- `removeAvatar(userId)` - Delete avatar
- `updatePassword(userId, passwords)` - Change password

#### Projects (`src/api/projects.api.js`)
- `getProjects()` - Get all user projects
- `getProjectById(projectId)` - Get project details
- `createProject(data)` - Create new project
- `updateProject(projectId, data)` - Update project
- `deleteProject(projectId)` - Delete project

#### Tasks (`src/api/tasks.api.js`)
- `getTasks(filters)` - Get tasks with pagination & filtering
- `getTasksPaginated(status, page, size)` - Get paginated tasks
- `getTaskById(taskId)` - Get task details
- `createTask(data)` - Create new task
- `updateTask(taskId, data)` - Update task
- `deleteTask(taskId)` - Delete task

## Theming

### Dark/Light Mode
- Automatic detection based on system preference
- Manual toggle via `useTheme()` hook
- Theme preference persisted to localStorage
- CSS variables for color switching

### Available Themes
- **Light** - Light background with dark text
- **Dark** - Dark background with light text

## Available Scripts

```bash
# Start development server with hot module reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run ESLint to check code quality
npm run lint
```

## Key Features

### Task Management
- Create, read, update, delete tasks
- Drag & drop between statuses (Kanban board)
- Filter by multiple criteria (status, priority, date range)
- Search functionality (title, description)
- Pagination support
- Real-time UI updates
- Task priority levels (Low, Medium, High)
- Due date tracking

### Project Management
- Create, update, delete projects
- Track project completion percentage
- View all project tasks
- Organize by status (Active, Archived, Completed)
- Project statistics (task counts, completion rate)

### User Profile
- View profile information
- Edit profile (name, email)
- Upload profile avatar (PNG, JPG, JPEG, GIF, WebP)
- Remove avatar
- Change password
- Account creation/update timestamps

### UI/UX
- Dark/light theme toggle
- Fully responsive (mobile, tablet, desktop)
- Real-time UI updates
- Smooth animations & transitions
- Accessible components (ARIA labels, keyboard navigation)
- Loading states
- Error handling & validation messages

## 🛠️ Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19+ | UI library |
| **Vite** | 8+ | Build tool & dev server |
| **React Router** | 7+ | Client-side routing |
| **TailwindCSS** | 4+ | Utility-first CSS |
| **shadcn/ui** | Latest | Pre-built components |
| **Axios** | Latest | HTTP client |
| **Lucide React** | Latest | Icon library |
| **js-cookie** | Latest | Cookie management |

## Environment Configuration

### Backend Connection
The frontend is configured to connect to backend at:
```
http://localhost:8080/api
```

To change this, edit `src/api/axios.js`:
```javascript
const api = axios.create({
  baseURL: 'http://your-backend-url/api'
})
```

## Troubleshooting

### API Connection Error
**Problem:** "Failed to connect to backend"

**Solutions:**
- Ensure backend is running on `http://localhost:8080`
- Check backend is properly started (`npm run dev` in backend folder)
- Open DevTools (F12) → Network tab → check failed requests
- Look for CORS errors in browser console
- Verify Axios baseURL is correct in `src/api/axios.js`

### Login Issues
**Problem:** "Invalid credentials" or "User not found"

**Solutions:**
- Verify user is registered in backend
- Check email & password are correct
- Ensure backend database (MongoDB) is running
- Clear browser localStorage and retry
- Check backend logs for errors

### Build Errors
**Problem:** `npm run build` fails

**Solutions:**
```bash
# Clear dependencies and reinstall
rm -rf node_modules package-lock.json
npm install

# Try build again
npm run build

# Check for syntax errors in code
npm run lint
```

### Styling Issues
**Problem:** TailwindCSS classes not applying

**Solutions:**
- Ensure Vite dev server is running (`npm run dev`)
- Check class names are valid Tailwind classes
- Rebuild with `npm run build`
- Clear browser cache (Ctrl+Shift+Delete)

### Token Expiration
**Problem:** "Unauthorized" errors after some time

**Solutions:**
- Token refresh is automatic via axios interceptor
- Clear localStorage and login again if issues persist
- Check backend's JWT configuration
- Verify token expiration times in backend

## Development Tips

### Adding a New Page
1. Create component in `src/pages/PageName.jsx`
2. Add route in `App.jsx`
3. Add navigation link in `DashboardSidebar.jsx` or other navigation
4. Wrap with `<ProtectedRoute>` if authentication required

### Adding a New Component
1. Create in `src/components/ComponentName.jsx`
2. Import and use in pages
3. Follow existing patterns for props & state
4. Use Tailwind classes for styling

### Adding a New API Call
1. Create function in `src/api/service.api.js`
2. Use axios instance: `api.get(), api.post(), etc.`
3. Import in component/context
4. Add proper error handling

### Debugging
- Use browser DevTools (F12)
- Check Network tab for API requests/responses
- Use React DevTools extension for component inspection
- Add `console.log()` for debugging
- Check browser console for errors

## Best Practices

### Performance
- Use React.memo for expensive components
- Implement pagination for large lists
- Optimize images (PNG, WebP)
- Lazy load routes with React.lazy()

### Security
- Never store sensitive data in localStorage (except tokens)
- Always validate user input
- Use HTTPS in production
- Keep dependencies updated

### Code Quality
- Follow existing code style
- Use meaningful variable/function names
- Add comments for complex logic
- Run linter: `npm run lint`

## Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [React Router](https://reactrouter.com)
- [TailwindCSS Documentation](https://tailwindcss.com)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Axios Documentation](https://axios-http.com)

---

**Version:** 0.0.1-SNAPSHOT  
**Last Updated:** April 2026  
**Node:** 18+ | **npm:** 9+ | **React:** 19+
