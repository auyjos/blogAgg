# Blog Aggregator (Gator)

A command-line tool for aggregating and following RSS blog feeds, built with TypeScript and PostgreSQL.

## Features

- User Management
  - Register new users
  - Login/logout functionality
  - User session persistence
- Feed Management
  - Add RSS feeds to the system
  - Follow/unfollow feeds
  - List available feeds
  - View followed feeds
- Content Aggregation
  - Fetch and parse RSS feeds
  - Browse posts from followed feeds
  - Auto-updating feed content

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- TypeScript
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd blog-agg
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
- Create a PostgreSQL database
- Update the database connection URL in your `.env` file:
```env
DATABASE_URL=postgres://<username>:<password>@localhost:5432/gator
```

4. Run migrations:
```bash
npm run migrate
```

## Usage

### Available Commands

- `gator register <username>` - Register a new user
- `gator login <username>` - Login as an existing user
- `gator add-feed <url>` - Add a new RSS feed to the system
- `gator list-feeds` - List all available feeds
- `gator follow <feed-id>` - Follow a feed
- `gator following` - List feeds you're following
- `gator unfollow <feed-id>` - Unfollow a feed
- `gator browse` - View posts from followed feeds
- `gator agg` - Manually trigger feed aggregation

### Example Usage

```bash
# Register a new user
npm run start register johndoe

# Login
npm run start login johndoe

# Add a new feed
npm run start add-feed https://example.com/rss

# Follow a feed
npm run start follow 1

# View your feed
npm run start browse
```

## Project Structure

```
blog-agg/
├── src/
│   ├── commands.ts          # Command handlers
│   ├── config.ts            # Configuration management
│   ├── index.ts            # Entry point
│   └── lib/
│       ├── aggregator.ts    # Feed aggregation logic
│       ├── parseDuration.ts # Duration parsing utilities
│       ├── rss.ts          # RSS feed parsing
│       └── db/
│           ├── index.ts     # Database connection
│           ├── schema.ts    # Database schema
│           └── queries/     # Database queries
│               ├── feedFollow.ts
│               ├── feeds.ts
│               ├── posts.ts
│               └── users.ts
```

## Development

### Database Migrations

New migrations can be generated after schema changes:

```bash
npm run generate
```

Apply migrations:

```bash
npm run migrate
```

### Building

```bash
npm run build
```

### Running in Development Mode

```bash
npm run dev
```

## Technologies Used

- TypeScript
- Node.js
- PostgreSQL
- Drizzle ORM
- RSS Parser

## Configuration

The application uses a `.gatorconfig.json` file to store user preferences and database connection details. This file is automatically created and managed by the application.

Example configuration:
```json
{
  "db_url": "postgres://<username>:<password>@localhost:5432/gator",
  "current_user_name": "johndoe"
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
