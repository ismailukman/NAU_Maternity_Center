# Maternity Care Hospital System

A modern, full-stack web application for maternity hospital management built with Next.js 14, TypeScript, Tailwind CSS, and Prisma.

## Features

- 🏥 **Homepage**: Beautiful maternal-themed landing page with services overview
- 👨‍⚕️ **Doctor Profiles**: Browse OB/GYN specialists and pediatricians
- 📅 **Appointment Booking**: 5-step booking process with date/time selection
- 🤰 **Patient Dashboard**: Track pregnancy progress, appointments, and health reminders
- 💊 **Services**: Comprehensive prenatal, postnatal, and pediatric care
- 📱 **Responsive Design**: Mobile-first design with warm maternal color palette (pink/purple)
- 🎨 **Modern UI**: Built with Tailwind CSS and shadcn/ui components

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: SQLite with Prisma ORM
- **Forms**: React Hook Form + Zod validation
- **Notifications**: Sonner (toast notifications)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
app/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Homepage
│   ├── doctors/           # Doctor profiles
│   ├── appointments/      # Appointment booking
│   ├── dashboard/         # Patient dashboard
│   ├── services/          # Services page
│   ├── about/            # About page
│   ├── contact/          # Contact page
│   └── api/              # API routes
├── components/
│   ├── ui/               # Reusable UI components
│   └── layout/           # Layout components (Navbar, Footer)
├── lib/                  # Utility functions
└── prisma/              # Database schema

```

## Key Features Explained

### Appointment Booking System
A seamless 5-step process:
1. Select service type (Prenatal, Postnatal, Ultrasound, etc.)
2. Choose from available doctors
3. Pick date and time slot
4. Fill in patient details
5. Review and confirm booking

### Patient Dashboard
- Pregnancy progress tracker with week-by-week updates
- Upcoming appointments with status
- Health reminders and tips
- Quick access to medical records

### Doctor Profiles
- Detailed specialist profiles
- Ratings and reviews
- Qualification and experience
- Available time slots
- Direct booking integration

## Color Palette

The maternal theme uses warm, welcoming colors:
- Primary: Pink (#E91E63)
- Secondary: Purple (#9C27B0)
- Light Pink: (#F8BBD0)
- Light Purple: (#BA68C8)

## API Routes

- `GET /api/doctors` - Fetch all doctors
- `GET /api/doctors?specialty=prenatal` - Filter by specialty
- `POST /api/appointments` - Create new appointment
- `GET /api/appointments` - Fetch patient appointments

## Database Schema

Key models:
- **User**: Authentication and base user data
- **Patient**: Patient-specific information with pregnancy tracking
- **Doctor**: Doctor profiles and availability
- **Appointment**: Booking management
- **PregnancyRecord**: Prenatal visit tracking
- **Child**: Postnatal care and vaccination records
- **Vaccination**: Immunization tracking

## Future Enhancements

- [ ] User authentication with NextAuth.js
- [ ] Real-time notifications
- [ ] Telemedicine video consultations
- [ ] AI-powered triage system
- [ ] SMS reminders
- [ ] Payment integration
- [ ] Medical records management
- [ ] Lab results portal

## License

This project is created for educational and demonstration purposes.

## Support

For support, email info@maternitycare.com or call our hotline.
