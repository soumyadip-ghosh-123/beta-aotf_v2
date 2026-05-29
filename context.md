# AOTF (Academy of Tutors and Freelancers) - Project Context

## 1. Project Purpose & Vision
AOTF is a comprehensive platform acting as an intermediary (middleman) connecting **Providers** (Tutors and Freelancers) with **Consumers** (Students, Parents, and Clients). 

The platform is designed to digitize and streamline the gig matching process for an educational and freelancing agency (led by Soumyadip Ghosh). It acts as a centralized hub where gig requirements are posted, applications are submitted, and profiles are reviewed, bridging the gap between demand and supply in the tutoring and freelancing markets.

## 2. Core Business Workflow
The platform supports a semi-automated, admin-moderated workflow to ensure quality and control:
1. **Requirement Gathering**: Gig requirements (tuitions or freelance projects) come to the agency/admins.
2. **Posting**: Admins post these requirements (Jobs/Tuitions) on the platform.
3. **Application**: Providers (Tutors/Freelancers) browse available gigs and apply directly through the platform.
4. **Review**: Consumers (Students/Parents/Clients) can view the detailed profiles of the providers who applied.
5. **Selection & Contact**: Consumers make a selection and communicate their choice to the admins via call or text (off-platform).
6. **Admin Assignment**: Admins use the platform's backend to formally select the provider, noting the gig details and managing the assignment.
7. **Feedback Loop**: Providers receive feedback via the platform indicating whether they were selected for the gig, including reasons if they were rejected.

## 3. User Personas & Roles

### Non-Admin Personas
*   **Providers (Tutors/Freelancers)**: Users looking for work. They maintain rich profiles and apply to open job/tuition posts.
*   **Consumers (Students/Parents/Clients)**: Users with requirements. They review provider profiles and finalize selections in coordination with the admins.

### Admin Roles (RBAC)
The platform features a robust, 3-tier Role-Based Access Control (RBAC) system (detailed in `ADMIN_SYSTEM.md`):
*   **Super Admin**: Full system access, admin management, password resets, and audit log viewing.
*   **Sub-Superadmin**: Can manage support admins, handle content management (posts, jobs), and view audit logs.
*   **Support (Moderator)**: Handles customer enquiries, updates enquiry statuses, and manages feedback/calls. (No access to admin/user management).

## 4. Technical Architecture

### Tech Stack
*   **Framework**: Next.js 14+ (App Router) for both frontend UI and backend API routes.
*   **Styling & UI**: Tailwind CSS coupled with HeroUI (v2) for a rich, modern, and accessible user interface. Framer Motion is used for animations.
*   **Database**: MongoDB, interacted with via Mongoose ORM.
*   **Authentication**: Clerk for secure authentication (Username/Password), utilizing `publicMetadata` to distinguish between regular users and various admin roles.
*   **Payments**: Razorpay integration for handling financial transactions.
*   **Media Management**: Cloudinary for image and media uploads.
*   **Emails**: Resend for transactional email notifications.
*   **Monitoring**: Sentry for error tracking and performance monitoring.

### Directory Structure & Key Modules
*   **`/app`**: Contains the Next.js application routes.
    *   `/admin`: Protected routes for admin dashboards, user management, and gig assignments.
    *   `/jobs` & `/posts`: Public/user-facing routes for viewing and applying to gigs.
    *   `/api`: Backend API routes for interacting with MongoDB and third-party services.
    *   `/u`: User profile pages for consumers to review provider details.
*   **`/lib/models`**: Mongoose schemas defining the data layer:
    *   `User.ts`, `Profile.ts`, `Admin.ts`: Identity and profile management.
    *   `Post.ts`, `Job.ts`: Gig definitions.
    *   `Application.ts`, `ApplicationEvent.ts`: Tracking the application and feedback lifecycle.
    *   `Enquiry.ts`, `Feedback.ts`: Customer support and lead generation.
    *   `Invoice.ts`, `Payment.ts`: Financial tracking.
    *   `CalendarEvent.ts`, `TodoEvent.ts`: Scheduling and task management.
*   **`/components`**: Reusable React components, largely wrapping HeroUI elements.
*   **`/lib` & `/utils`**: Shared business logic, database connection helpers, and utility functions.

## 5. Key System Features
*   **End-to-End Gig Management**: From posting to application, review, and feedback.
*   **Admin Data Entry & Assignment**: A specialized admin panel allowing the middleman to finalize selections and track gig details manually.
*   **Feedback Mechanism**: Automated transparent feedback delivery to providers post-selection.
*   **Security & Auditing**: Automatic account lockouts for failed logins, forced password resets for admins, and comprehensive audit logging (`AuditLog.ts`) for all admin actions.
*   **Scalable Architecture**: Uses serverless API routes with a document database, making it highly flexible to changing requirements in both the education and freelance sectors.
