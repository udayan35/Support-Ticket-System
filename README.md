# Support Ticket System

A full-stack support ticket app with AI-powered categorization.

## Tech Stack

- **Backend** - Django + Django REST Framework
- **Frontend** - React
- **Database** - PostgreSQL
- **AI** - Anthropic Claude Haiku
- **Infrastructure** - Docker + Docker Compose

## Setup

**1. Clone the project**
```bash
git clone <repo-url>
cd support-ticket-system
```

**2. Add your API key (optional)**
```bash
export ANTHROPIC_API_KEY=your_key_here
```

**3. Run**
```bash
docker-compose up --build
```

**4. Open in browser**
- Frontend: http://localhost:3000
- API: http://localhost:8000/api/

## Features

- Submit support tickets
- AI auto-suggests category and priority based on description
- Filter tickets by category, priority, and status
- Search tickets by title or description
- Update ticket status
- Stats dashboard with ticket breakdown

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tickets/` | List all tickets |
| POST | `/api/tickets/` | Create a ticket |
| PATCH | `/api/tickets/<id>/` | Update a ticket |
| GET | `/api/tickets/stats/` | Get statistics |
| POST | `/api/tickets/classify/` | AI classify description |
