# BeetleBase - Insect Management Hub

BeetleBase is a comprehensive application for insect breeders to manage individuals, track lineage, upload photos, and generate pedigree certificates.

## Quick Start (Local Development)

Follow these steps to get the development environment running.

### 1. Prerequisites

-   Node.js (v18 or later)
-   npm, yarn, or pnpm
-   A running PostgreSQL instance

### 2. Clone the Repository

```bash
git clone <repository_url>
cd beetle-base
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Environment Variables

Create a `.env` file in the root of the project by copying the example file. This file contains all the necessary environment variables for the application to run.

```bash
cp .env.example .env
```

Open the new `.env` file and fill in the required values, especially `API_KEY` for Gemini features and `DATABASE_URL` for your local PostgreSQL instance.

### 5. Database Setup

Apply the initial schema to your database. Make sure your `DATABASE_URL` in the `.env` file is correctly configured.

You can apply the schema using a PostgreSQL client like `psql`:
```bash
psql -d your_database_name -a -f db/schema.sql
```

### 6. Running the Application

Once the setup is complete, you can start the development server.

```bash
npm run dev
```

The application should now be running on `http://localhost:5173` (or another port if specified).

---

## Developer's Runbook

### How to Import CSV

1.  Click the "CSVインポート" (CSV Import) button in the header.
2.  Select the desired import mode (e.g., Skip, Overwrite).
3.  Choose or drag-and-drop your `individuals_template.csv` or `measurements_template.csv` file.
4.  Click "インポート実行" (Run Import). The application will simulate the job processing.

### How to Generate QR Labels

1.  Navigate to an individual's detail page.
2.  In the "AIブリーダーレポート & 各種出力" section, click "QRラベルを生成" (Generate QR Label).
3.  A job will be simulated to generate a printable PDF/PNG label with the individual's QR code.

### How to Generate Pedigree PDF

1.  On an individual's detail page, click "血統書PDFを出力" (Export Pedigree PDF).
2.  A background job will be simulated to create a PDF certificate from the individual's lineage data.

### Running Backend Workers

In a real-world scenario, background jobs (for CSV imports, image processing, PDF generation) are handled by workers. To run them locally, you would typically use a command like:

```bash
# Example command for a BullMQ worker
npm run start:worker
```
*(This is for guidance; the actual worker implementation is backend-dependent.)*

---

## Contributing Guide

Please follow these conventions to contribute to the project.

-   **Branches**: Use `feature/<short-description>` or `hotfix/<issue-id>`.
-   **Pull Requests**: Use the provided `.github/PULL_REQUEST_TEMPLATE.md`. Ensure all checks pass before requesting a review.
-   **Commit Messages**: Follow a conventional commit format (e.g., `feat(import): ...`, `fix(ui): ...`, `docs: ...`).

## License

This project is proprietary.
