# Pesticide Scanner

A web-based pesticide product scanner evaluates products based on ingredient risk levels and provides safety scores.

![Pesticide Scanner](https://placehold.co/800x400?text=Pesticide+Scanner+Demo)

## 🌟 Features

- 📱 **Mobile-friendly web app** (PWA-ready)
- 📷 **Barcode scanning** using device camera
- ⌨️ **Manual barcode entry** for desktop/fallback
- 🎯 **Product scoring** based on ingredient risk levels (0-100 scale)
- 📊 **Verdict system**: Good / Moderate / Bad
- 📝 **Scan history** stored locally
- 📄 **Detailed product review pages** with positives, negatives, and recommendations
- 📖 **Scoring methodology page**
- 🐛 **Issue reporting system**

## 🛠 Tech Stack

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router) + React
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Barcode Scanning**: [@zxing/browser](https://github.com/zxing-js/browser)
- **Hosting**: [Vercel](https://vercel.com/)

## 📋 Prerequisites

Before you begin, ensure you have:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A [Supabase](https://supabase.com/) account (free tier is fine)
- A [Vercel](https://vercel.com/) account for deployment (optional)

## 🚀 Getting Started

### 1. Clone the repository

```
git clone https://github.com/yourusername/pesticide-scanner.git
cd pesticide-scanner
```

### 2. Install dependencies
```
npm install
```

### 3. Set up Supabase
1. Go to supabase.com and create a new project
2. Wait for the database to initialize
3. Go to Project Settings → API
4. Copy your:
    - Project URL
    - anon public API key

### 4. Create environment variables
Create a .env.local file in the root directory:
```
env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
Replace with your actual Supabase credentials.
```

### 5. Set up the database
Open your Supabase project → SQL Editor and run the seed script:

```
bash
supabase/seed_demo_data.sql
Or copy the contents of supabase/seed_demo_data.sql and paste into the SQL Editor.
```

This creates:

`ingredients` table
`products` table
`product_ingredients` junction table
`issues` table (for issue reporting)
Sample demo data (8 products, 11 ingredients)

6. Run the development server
```
npm run dev
Open http://localhost:3000 in your browser.
```

## 📱 Testing the App
Sample Barcodes
Use these barcodes to test the scanner:

|Barcode	Product Name	Expected Score	Verdict
|111111111111	NatureSafe Yard Spray	90	Good
|987654321098	BugShield Home	75	Good
|123456789012	WeedClear Pro	65	Moderate
|222222222222	Ultra Weed Destroyer	30	Bad
|666666666666	Heavy Duty Lawn Killer	35	Bad

### Manual Testing
- Go to /scan
- Enter barcode: 111111111111
- Click Search Barcode
- View product details with score

### Camera Testing
- Open on mobile device or allow camera access on desktop
- Click Start Camera Scanner
- Scan a printed barcode or display one on another screen

## 📂 Project Structure
```
text
pesticide-scanner/
├── app/
│   ├── api/
│   │   └── products/
│   │       └── [barcode]/
│   │           └── route.ts          # Product lookup API
│   ├── product/
│   │   └── [barcode]/
│   │       └── page.tsx              # Product review page
│   ├── scan/
│   │   └── page.tsx                  # Scan page (camera + manual)
│   ├── scoring-method/
│   │   └── page.tsx                  # Scoring explanation page
│   ├── report-issue/
│   │   └── page.tsx                  # Issue reporting form
│   ├── page.tsx                      # Home page (history)
│   ├── layout.tsx                    # Root layout
│   └── globals.css                   # Global styles
├── lib/
│   ├── supabase.ts                   # Supabase client
│   ├── score.ts                      # Scoring logic
│   └── history.ts                    # LocalStorage history utility
├── supabase/
│   └── seed_demo_data.sql            # Database seed script
├── .env.local                        # Environment variables (not in repo)
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## 🧮 Scoring Logic
The scoring system works as follows:

- Base score: 100 points
- Deductions based on ingredient risk level:
    - High risk (e.g., carcinogens, neurotoxins): -30 to -35 points
    - Medium risk (e.g., moderate toxicity): -15 to -20 points
    - Low risk (e.g., minimal concern): -5 points
- Final score is capped at minimum 0

### Verdict Ranges
- 70-100: Good (lower concern)
- 40-69: Moderate (use with caution)
- 0-39: Bad (high concern, consider alternatives)


## 📄 License
MIT License - feel free to use this project for educational purposes.

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact
For questions or issues, contact: santosh.mce@gmail.com

## 🙏 Acknowledgments
Inspired by Yuka
Built with Next.js
Database powered by Supabase
Barcode scanning via ZXing