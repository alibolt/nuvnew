# Nuvi - Modern E-commerce Platform

A powerful, customizable e-commerce platform built with Next.js, TypeScript, and Prisma.

## Features

- 🛍️ Full e-commerce functionality
- 🎨 Theme Studio with visual editor
- 📱 Mobile-responsive design
- 🔍 Advanced search capabilities
- 🌐 Multi-language support
- 💳 Integrated payment processing
- 📊 Analytics dashboard
- 🚀 High performance

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Payment**: Stripe
- **Email**: Resend
- **Search**: Built-in search engine
- **File Storage**: Local/S3 compatible

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL or SQLite
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/nuvi-saas.git
cd nuvi-saas
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Set up the database:
```bash
npx prisma migrate dev
npx prisma db seed
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
nuvi-saas/
├── app/              # Next.js app directory
├── components/       # React components
├── lib/             # Utility functions and services
├── prisma/          # Database schema and migrations
├── public/          # Static assets
├── themes/          # Theme files
├── types/           # TypeScript type definitions
└── scripts/         # Utility scripts
```

## Theme System

Nuvi uses a fully isolated theme architecture where all frontend components are contained within theme folders:

```
themes/
└── commerce/        # Default commerce theme
    ├── blocks/      # Reusable block components
    ├── sections/    # Page sections
    ├── schemas/     # Section configuration schemas
    └── styles/      # Theme styles
```

## Development

### Creating a New Theme

1. Create a new folder in `/themes`
2. Add required files:
   - `index.ts` - Theme entry point
   - `manifest.json` - Theme configuration
   - `blocks/` - Block components
   - `sections/` - Section components

### Adding a New Section

1. Create component in `themes/[theme]/sections/`
2. Add schema in `themes/[theme]/schemas/`
3. Export from theme index

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

This project is licensed under the MIT License.