# EducaSys: Open-Source School Assessment Management System

EducaSys is a modern, web-based platform designed to help municipal education departments manage schools, classes, students, and standardized tests (provões) efficiently. This open-source tool streamlines the entire assessment process, from creating exams and recording student answers to analyzing performance data in detail.

## ✨ Features

- **🏫 Administrative Dashboard**: Centrally manage schools, grades, classes, teachers, and students.
- **📝 Exam Management**: Easily create new exams ("provões"), define questions, set answer keys (gabaritos), and associate exams with multiple classes.
- **📊 Data Entry**: A streamlined interface for quickly inputting student answers for each assessment.
- **📈 Results & Analysis**: Instantly view detailed results, including student rankings per class, overall performance metrics, and in-depth statistics for each question to identify learning gaps.
- **🔒 Secure**: Built on Supabase with authentication and row-level security to protect student data.
- **🌐 Web-Based**: Accessible from any modern web browser.

## 💻 Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend & Database**: Supabase (PostgreSQL)
- **Routing**: React Router
- **Icons**: Lucide React

---

## 🚀 Getting Started

Follow these instructions to set up and run your own instance of EducaSys.

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A free [Supabase](https://supabase.com/) account

### 1. Set Up Supabase Backend

1.  **Create a New Supabase Project**:
    - Go to your [Supabase Dashboard](https://app.supabase.com/) and click "New project".
    - Give your project a name (e.g., `educasys-municipio`) and create a strong database password. Save this password securely.
    - Choose a region close to your users and click "Create project".

2.  **Set up the Database Schema**:
    - Once your project is ready, navigate to the **SQL Editor** in the Supabase dashboard sidebar.
    - Click **"+ New query"**.
    - Open the `schema.sql` file from this repository, copy its entire content, and paste it into the Supabase SQL Editor.
    - Click **"RUN"**. This will create all the necessary tables, relationships, and security policies for the application to work correctly.

3.  **Get Your API Credentials**:
    - In the Supabase dashboard, go to **Project Settings** (the gear icon).
    - Click on the **API** section.
    - You will find your **Project URL** and your **Project API Keys**. You only need the `anon` `public` key.
    - Keep this page open; you will need these two values in the next step.

### 2. Configure the Frontend Application

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/your-username/educasys.git
    cd educasys
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Supabase Credentials**:
    - Open the file `src/services/supabaseClient.ts`.
    - You will see two placeholder variables: `supabaseUrl` and `supabaseAnonKey`.
    - Replace `'YOUR_SUPABASE_URL'` with the **Project URL** from your Supabase settings.
    - Replace `'YOUR_SUPABASE_ANON_KEY'` with the `anon` `public` **Project API Key** from your Supabase settings.

    Your `supabaseClient.ts` file should now look like this:

    ```typescript
    // src/services/supabaseClient.ts

    import { createClient } from '@supabase/supabase-js';

    const supabaseUrl = 'https://xxxxxx.supabase.co'; // <-- YOUR URL HERE
    const supabaseAnonKey = 'ey...'; // <-- YOUR ANON KEY HERE

    // ... rest of the file
    ```

4.  **Run the Development Server**:
    - This project is set up to run directly in a modern browser that supports import maps. To serve it locally, you can use any simple static server. If you have Node.js, `serve` is a great option.
    - Install `serve`:
      ```bash
      npm install -g serve
      ```
    - Run the server from the root of the project directory:
      ```bash
      serve .
      ```
    - Open your browser and navigate to the URL provided by the `serve` command (usually `http://localhost:3000`).

### 3. First Login

The application is now running! The first user to sign up will be the initial administrator.
*Note: The SQL schema does not create any default users. You need to create an account through Supabase Auth or your application's sign-up flow (if implemented).*

To create your first user:
1.  Go to your Supabase project's **Authentication** section.
2.  Click **"Add user"** and create a user with an email and password.
3.  You can now use these credentials to log into the application.

## 🏗️ Project Structure

```
/
├── public/
│   └── ...
├── src/
│   ├── components/    # Reusable React components (Button, Card, etc.)
│   ├── hooks/         # Custom React hooks (useAuth, useNotification)
│   ├── pages/         # Top-level page components for each route
│   ├── services/      # API/DB services (dbService.ts, supabaseClient.ts)
│   ├── App.tsx        # Main application component with routing
│   ├── index.tsx      # Entry point of the React application
│   └── types.ts       # Centralized TypeScript types and interfaces
└── README.md
```

## 🤝 Contributing

Contributions are welcome! If you'd like to improve EducaSys, please follow these steps:

1.  **Fork** the repository on GitHub.
2.  **Clone** your forked repository to your local machine.
3.  Create a new **branch** for your feature or bug fix.
4.  Make your changes and **commit** them with clear, descriptive messages.
5.  **Push** your changes to your fork.
6.  Create a **Pull Request** to the `main` branch of the original repository.

## 📄 License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.
