# AURA OS

### Your personal command center for learning, building, coding, and staying focused.

**AURA OS** is an intelligent personal workspace designed to bring the different parts of a user's growth and work into one connected environment.

> **Everything you're learning. Everything you're building. One intelligent workspace.**

Instead of separating learning, projects, coding, focus sessions, analytics, and AI tools across multiple applications, AURA OS brings them together into a personalized workspace that can evolve with the user.

---

## ✨ What is AURA OS?

AURA OS is built around a simple idea:

**Your tools should understand your workflow, not force your workflow into separate tools.**

AURA connects:

* 📚 **Learning** — structured subjects, topics, questions, attempts, and real progress
* 🛠️ **Projects** — projects, tasks, milestones, architecture, and activity
* 💻 **Coding** — coding sessions, snippets, and execution workflows
* 🎯 **Focus** — focus sessions and productivity tracking
* 🧠 **AI** — an intelligent interface connected to the user's workspace
* 📊 **Analytics** — activity-based insights generated from real usage
* 🐙 **GitHub** — repository connections and project synchronization
* 👤 **Personalization** — workspace configuration based on the user's goals and working style
* 🔐 **Authentication** — account-based experiences backed by Supabase

The goal is not to create another dashboard.

The goal is to create a **personal operating layer for continuous learning and building**.

---

## 🚀 Core Experience

AURA is designed around a connected workflow:

```text
        ┌──────────────────────┐
        │      User Profile    │
        │ Goals • Roles • Style│
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │    AURA Workspace    │
        └──────────┬───────────┘
                   │
      ┌────────────┼─────────────┐
      ▼            ▼             ▼
   Learning     Projects       Coding
      │            │             │
      └────────────┼─────────────┘
                   │
                   ▼
             Focus & Activity
                   │
                   ▼
              Analytics
                   │
                   ▼
             AURA Intelligence
```

The workspace is intended to become more useful as the user actually uses it.

---

# 🧩 Features

## 📚 Learning Workspace

AURA treats learning as an activity rather than a static progress bar.

### Learning flow

```text
Choose Topic
     ↓
Answer Question
     ↓
Evaluate Answer
     ↓
Correct?
 ┌───┴────┐
No       Yes
│         │
Retry   Complete
          │
          ▼
     Update Progress
```

Learning data is designed around:

* Subjects
* Topics
* Questions
* Question attempts
* Topic progress
* Completion state

Progress should be derived from actual learning activity rather than hardcoded percentages.

### Example

A new learner should begin with:

```text
Python Core
0%
```

After successfully completing questions and topics:

```text
Python Core
27%
```

The progress represents activity recorded by the system rather than an artificial starting score.

---

## 🛠️ Project Workspace

AURA provides a project environment for turning ideas into structured work.

Each project can contain:

* Name
* Description
* Category
* Status
* Progress
* Technologies
* Tasks
* Milestones
* Architecture
* Activity
* Creation date
* Last updated date
* Deadline

### Project creation flow

```text
Project
   ↓
Goals
   ↓
Technology
   ↓
Architecture
   ↓
Plan
```

### Project task lifecycle

```text
Backlog → Todo → In Progress → Review → Completed
```

The project workspace is designed to make development progress visible without separating planning from execution.

---

## 🏗️ Architecture Visualization

Projects can represent their technical architecture using components and relationships.

The architecture model supports conceptual layers such as:

```text
┌─────────────────────────────┐
│           Client            │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│            API              │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│             AI              │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│            Data             │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│       Infrastructure        │
└─────────────────────────────┘
```

The project architecture experience is intended to support:

* Components
* Connections
* Layers
* Diagram view
* List view
* Flow view
* Adding components
* Connecting components

---

## 💻 Coding Workspace

AURA includes a dedicated coding environment intended to connect development activity with the rest of the workspace.

The coding system is designed around:

* Code snippets
* Coding sessions
* Language selection
* Execution workflows
* Saved development activity

The architecture is designed so execution results come from an actual execution provider rather than fabricated responses.

---

## 🎯 Focus Mode

AURA includes a focus environment for intentional work sessions.

Users can:

* Start a focus session
* Configure session duration
* Add time
* Track completed sessions
* Persist focus activity

Focus data can contribute to the wider activity and analytics system.

---

## 🧠 AURA Intelligence

AURA Intelligence is designed to operate as an intelligent layer over the user's workspace.

Rather than acting as an isolated chatbot, the system can use authorized workspace context such as:

* Current projects
* Tasks
* Learning activity
* Focus sessions
* User preferences
* Workspace configuration
* Recent activity

This enables context-aware interactions such as:

```text
User
  ↓
AURA Intelligence
  ↓
Authorized Workspace Context
  ↓
AI Model
  ↓
Contextual Response
```

AI conversations are designed to persist through the application data layer.

> AI personalization should be based on actual authorized user data—not invented activity, fabricated achievements, or hardcoded profiles.

---

## 📊 Analytics

AURA analytics are designed to reflect real activity.

Potential activity events include:

* Learning attempts
* Completed questions
* Completed topics
* Coding sessions
* Project activity
* Completed tasks
* Focus sessions
* AI interactions
* GitHub activity when GitHub integration is available

The system should begin with meaningful zero-state data for a new user rather than displaying fake productivity metrics.

---

## 🐙 GitHub Integration

AURA is designed to connect development activity with GitHub.

The integration can support:

* GitHub connection
* Repository discovery
* Repository metadata
* Project-repository relationships
* Repository synchronization
* Development activity

An important design principle is that:

> **AURA project state should remain independent from the existence of a GitHub repository.**

Deleting a GitHub repository should not silently destroy the user's AURA project data.

---

# 👤 Personalization

AURA uses onboarding to understand how a workspace should be configured for the user.

The onboarding model can capture:

* Roles
* Goals
* Preferred modules
* Experience levels
* Primary priority
* Organization style
* Theme
* Focus duration
* Working time

Example profile structure:

```js
{
  id,
  name,
  email,
  roles: [],
  goals: [],
  modules: [],
  experienceLevels: {},
  primaryPriority,
  organizationStyle,
  preferences: {
    theme,
    focusDuration,
    workingTime
  },
  onboardingCompleted
}
```

The important distinction is that personalization changes the **workspace configuration**, not the underlying application into completely separate products.

---

# 🧭 Workspace Profiles

AURA can support configuration-driven workspace profiles such as:

```js
workspaceProfiles = {
  student: {},
  developer: {},
  founder: {}
}
```

Different users can receive different module ordering, labels, recommendations, and dashboard layouts while remaining inside the same AURA system.

Users can also customize their dashboard by:

* Adding modules
* Removing modules
* Reordering modules
* Hiding modules
* Changing layouts

---

# 🔐 Authentication & Security

AURA uses **Supabase** as its backend platform.

Authentication and user data are designed around account-level access and database security.

### Security principles

* Never commit `.env`
* Never commit `.env.local`
* Never expose server-side secrets
* Keep privileged Supabase credentials server-side
* Use the publishable Supabase key for browser-side access
* Protect user-owned data with Row Level Security
* Store only the required user information
* Keep AI provider secrets outside frontend source code

Environment variables should be configured locally:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

AURA intentionally tracks `.env.example` rather than real environment files.

---

# 🗄️ Database

The project includes Supabase migrations under:

```text
supabase/
└── migrations/
    ├── 001_initial_schema.sql
    └── 002_seed_curriculum.sql
```

The current database foundation includes tables for areas such as:

```text
profiles
user_settings

projects
project_tasks
project_milestones
project_activity

learning_subjects
learning_topics
learning_questions
question_attempts
user_topic_progress

coding_sessions
code_snippets

focus_sessions

activity_events

conversations
messages

github_connections
github_repositories
```

The database structure is designed to keep major areas of the application connected while maintaining separate data domains.

---

# 🏗️ Architecture

AURA currently follows a modular frontend architecture.

```text
AURA_OS/
│
├── src/
│   ├── components/
│   │
│   ├── data/
│   │   ├── aiService.js
│   │   ├── analyticsService.js
│   │   ├── authService.js
│   │   ├── codeExecutionService.js
│   │   ├── codingService.js
│   │   ├── conversationService.js
│   │   ├── focusService.js
│   │   ├── githubService.js
│   │   ├── learningService.js
│   │   ├── profileService.js
│   │   ├── projectService.js
│   │   ├── settingsService.js
│   │   ├── supabaseClient.js
│   │   └── timerService.js
│   │
│   ├── modules/
│   │   ├── analyticsVisualizer.js
│   │   ├── codePlayground.js
│   │   ├── commandCenter.js
│   │   ├── coreAnimation.js
│   │   ├── focusMode.js
│   │   ├── intelligenceEngine.js
│   │   ├── projectLab.js
│   │   ├── skillConstellation.js
│   │   └── themeManager.js
│   │
│   ├── pages/
│   │   ├── AIPage.js
│   │   ├── CodingPage.js
│   │   ├── ExperiencePage.js
│   │   ├── HomePage.js
│   │   ├── LoginPage.js
│   │   ├── OnboardingPage.js
│   │   ├── ProductPage.js
│   │   ├── ProjectsPage.js
│   │   ├── WorkspacePage.js
│   │   └── ...
│   │
│   ├── styles/
│   │
│   ├── main.js
│   └── router.js
│
├── supabase/
│   └── migrations/
│
├── tests/
│
├── .env.example
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

### Architectural separation

The project separates:

**Pages**

Application-level screens and routes.

**Modules**

Interactive product capabilities and UI systems.

**Data services**

Application data access and domain logic.

**Styles**

Design system and page-specific styling.

**Supabase**

Persistent backend data and database migrations.

This separation is intended to keep AURA maintainable as more capabilities are introduced.

---

# 🖥️ Application Routes

The application is structured around experiences such as:

| Route                               | Purpose                  |
| ----------------------------------- | ------------------------ |
| `/`                                 | Landing experience       |
| `/product`                          | Product overview         |
| `/experience`                       | Product experience       |
| `/ai`                               | AURA Intelligence        |
| `/workspace`                        | Personalized workspace   |
| `/projects`                         | Project dashboard        |
| `/projects/:projectId`              | Project workspace        |
| `/projects/:projectId/architecture` | Project architecture     |
| `/login`                            | Authentication           |
| `/signup`                           | Account creation         |
| `/onboarding`                       | Initial personalization  |
| `/settings/profile`                 | Profile settings         |
| `/settings/personalization`         | Personalization settings |

---

# 🎨 Design Philosophy

AURA is designed around a premium, focused interface rather than a conventional admin dashboard.

The visual language emphasizes:

* Depth
* Translucency
* Soft spatial layers
* Subtle motion
* Strong typography
* Intelligent information hierarchy
* Responsive layouts
* Minimal visual noise
* Purposeful interaction

The central AURA visual language uses abstract concepts such as:

* A glowing intelligence orb
* Neural structures
* Orbital systems
* Skill constellations
* Activity fields
* Project relationships
* Focus environments
* AI signals

The design system is documented within the project and should be treated as the source of truth for future UI work.

---

# 🛠️ Tech Stack

### Frontend

* JavaScript
* HTML
* CSS
* Vite

### Backend / Data

* Supabase
* PostgreSQL
* Supabase Authentication
* Row Level Security

### Development

* Git
* GitHub
* VS Code
* npm

### AI

AURA is designed with an AI service abstraction so AI providers can be integrated without coupling the entire application to a single model provider.

---

# ⚡ Getting Started

## Prerequisites

Install:

* Node.js
* npm
* Git

Verify:

```bash
node --version
npm --version
git --version
```

---

## 1. Clone the repository

```bash
git clone https://github.com/shreyash-bhosale/AURA_OS.git
cd AURA_OS
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Configure environment variables

Create a local environment file:

```bash
cp .env.example .env.local
```

Add your Supabase configuration:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

Do not commit `.env.local`.

---

## 4. Configure Supabase

Create or use a Supabase project.

Then execute the migrations from:

```text
supabase/migrations/
```

in the appropriate order:

```text
001_initial_schema.sql
002_seed_curriculum.sql
```

Verify that the required tables and curriculum records exist before testing the application.

---

## 5. Start the development server

```bash
npm run dev
```

Vite will provide a local development URL, typically:

```text
http://localhost:5173
```

---

# 🧪 Testing

The repository includes tests under:

```text
tests/
```

Run the project's available test command from `package.json`.

Before submitting a production or hackathon build, validate at minimum:

### Authentication

* Sign up
* Login
* Invalid credentials
* Existing account
* Session persistence
* Logout

### Onboarding

* Complete onboarding
* Refresh page
* Verify profile persistence
* Verify personalized workspace

### Learning

* New user starts at zero
* Answer question
* Correct answer completes progress
* Incorrect answer does not falsely complete progress
* Refresh and verify persistence

### Projects

* Create project
* Create task
* Update task
* Complete task
* Refresh
* Verify persistence

### Focus

* Start session
* Add time
* Complete session
* Verify activity persistence

### AI

* Send message
* Receive response
* Verify conversation persistence
* Verify authorized context only

### Data integrity

Test that:

```text
Create
  ↓
Read
  ↓
Update
  ↓
Refresh
  ↓
Data still exists
```

---

# 📈 Product Principles

AURA follows several important principles.

### 1. No fake progress

The application should never claim a user has learned something they have not actually completed.

### 2. No fake analytics

Analytics should come from real activity.

### 3. No fabricated AI context

AI personalization should use actual authorized workspace information.

### 4. Persistence matters

Important user actions should survive page refreshes and sessions.

### 5. One workspace, many workflows

Learning, projects, coding, focus, analytics, and AI should work together instead of becoming disconnected mini-apps.

### 6. Modular by design

Features should be replaceable and extendable without rewriting the entire application.

### 7. Security by default

Secrets belong in environment variables or secure server-side infrastructure—not frontend source code or Git history.

---

# 🗺️ Roadmap

AURA OS is an evolving project.

### Foundation

* [x] Core application structure
* [x] Vite frontend
* [x] Modular page architecture
* [x] Supabase schema foundation
* [x] Learning curriculum foundation
* [x] GitHub repository
* [x] Environment configuration structure

### Workspace

* [x] Workspace experience
* [x] Project system foundation
* [x] Task management foundation
* [x] Personalization foundation
* [x] Settings foundation

### Intelligence

* [x] AI service abstraction
* [x] Conversation architecture
* [ ] Production AI provider integration
* [ ] Context-aware workspace intelligence
* [ ] Persistent AI memory with explicit user controls
* [ ] Advanced recommendations

### Learning

* [x] Curriculum structure
* [x] Topic/question model
* [x] Progress model
* [ ] Expanded curriculum
* [ ] Adaptive learning
* [ ] Personalized learning plans

### Developer Tools

* [x] Coding workspace foundation
* [x] Code session model
* [x] Code snippet model
* [ ] Production-grade remote code execution
* [ ] More language runtimes
* [ ] GitHub development insights

### Integrations

* [x] GitHub integration foundation
* [ ] Repository synchronization
* [ ] GitHub activity analytics
* [ ] Additional developer integrations

### Analytics

* [x] Activity event foundation
* [x] Analytics architecture
* [ ] Advanced productivity insights
* [ ] Cross-domain progress intelligence

---

# 🔒 Security Notes

Never commit:

```text
.env
.env.local
.env.*.local
```

The repository intentionally tracks:

```text
.env.example
```

with placeholders only.

If a Supabase secret/service-role credential is ever exposed publicly, rotate it immediately.

Frontend applications should use only the appropriate publishable Supabase credential and rely on database security policies for user-level access.

---

# 🤝 Contributing

AURA OS is currently a personal/hackathon project, but the architecture is being developed with maintainability and future collaboration in mind.

If contributing:

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/your-feature
```

3. Make focused changes.
4. Test the affected functionality.
5. Commit your changes.

```bash
git commit -m "feat: add your feature"
```

6. Push the branch.

```bash
git push origin feature/your-feature
```

7. Open a pull request.

Keep changes focused and avoid introducing unrelated UI or architectural changes.

---

# 👨‍💻 Author

## Shreyash Bhosale

AI & Machine Learning Student
India

Building AURA OS as an exploration of:

* AI-powered productivity
* Human-centered software
* Full-stack application architecture
* Personalized learning systems
* Developer tooling
* Intelligent interfaces

### Links

* **GitHub:** https://github.com/shreyash-bhosale
* **AURA OS:** https://github.com/shreyash-bhosale/AURA_OS

---

# 📄 License

Add the project's chosen license here before presenting AURA OS as an open-source project.

---

<div align="center">

### AURA OS

**Learn. Build. Focus. Understand.**

*One intelligent workspace for everything you're becoming.*

</div>
