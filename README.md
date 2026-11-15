# Bee Safe

Bee Safe is a mobile-first product scanner that evaluates garden and household products for ingredient safety. Users can scan a barcode or enter it manually, review the product’s ingredients, see a safety score and verdict, and compare the ingredient risk breakdown to identify potentially harmful compounds.

## Features

- Barcode scanning with the device camera
- Manual barcode entry as a fallback
- Product scoring based on ingredient risk and penalty data
- Verdicts: Excellent, Good, Moderate, Poor, and Bad
- Local scan history with summary stats
- Detailed product review pages with warnings, positives, and recommendations
- Issue reporting form backed by Supabase
- Mobile-friendly UI optimized for quick product checks

## Tech stack

- Next.js 16 with App Router
- React 19 + TypeScript
- Tailwind CSS
- Supabase for product and issue data
- ZXing browser barcode scanning
- LocalStorage for scan history

## Project overview

This app looks up a product from the `products` table, loads its linked ingredients from `product_ingredients`, calculates a safety score, and then displays a verdict, risk breakdown, and recommendations. The product review page also surfaces higher-risk ingredients and lower-risk ingredients so the user can judge whether a product is suitable.

## Prerequisites

- Node.js 20+
- npm
- A Supabase project

## Local setup

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/pesticide-scanner.git
cd pesticide-scanner
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root with the following values:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Notes:
- The public environment variables are used by the browser client and product lookup APIs.
- `SUPABASE_SERVICE_ROLE_KEY` is required for the issue reporting API route because it writes to the `issues` table server-side.
- Do not commit `.env.local` to version control.

### 4. Set up the database

Open your Supabase project in the SQL editor and run the seed script from the repository:

```bash
supabase/seed_demo_data.sql
```

You can also use the individual SQL files in `supabase/` if you want to add or update product records incrementally. The app expects tables such as:

- `products`
- `ingredients`
- `product_ingredients`
- `issues`

### 5. Run the app

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser.

## Useful routes

- `/` – home page with scan history and summary stats
- `/scan` – barcode scanner and manual lookup page
- `/product/[barcode]` – detailed product review page
- `/scoring-method` – scoring explanations and methodology
- `/report-issue` – issue submission form
- `/api/products/[barcode]` – product lookup and scoring API
- `/api/products/sample` – returns a random product barcode for demo/testing

## Database and sample data

The repository contains Supabase SQL scripts under `supabase/` to seed the demo data used by the app. These include product and ingredient entries for sample garden and pesticide products.

## Project structure

```text
pesticide-scanner/
├── app/
│   ├── api/
│   │   └── products/
│   │       ├── [barcode]/
│   │       │   └── route.ts
│   │       └── sample/
│   │           └── route.ts
│   ├── components/
│   │   └── BottomNav.tsx
│   ├── product/
│   │   └── [barcode]/
│   │       └── page.tsx
│   ├── report-issue/
│   │   └── page.tsx
│   ├── scan/
│   │   └── page.tsx
│   ├── scoring-method/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── history.ts
│   ├── product-image.ts
│   ├── score.ts
│   ├── supabase-service.ts
│   └── supabase.ts
├── public/
│   └── product images
├── supabase/
│   ├── add_four_products.sql
│   ├── add_ocp_eco_oil.sql
│   ├── add_seasol_natural_pyrethrum.sql
│   ├── ingredients_rows.sql
│   ├── new_products.sql
│   ├── product_ingredients_rows.sql
│   ├── products_rows.sql
│   ├── seed_demo_data.sql
│   └── update_data.sql
├── .env.local
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
├── README.md
└── ...
```

## Scoring logic

The app calculates a base score of 100 and subtracts penalties for ingredient risk:

- High risk ingredients: larger deductions
- Medium risk ingredients: moderate deductions
- Low risk ingredients: small deductions or none

The final score is then mapped to a verdict:

- 80–100: Excellent
- 70–79: Good
- 50–69: Moderate
- 30–49: Poor
- 0–29: Bad

## Verification and linting

Typical project commands:

```bash
npm run lint
npm run build
npm run dev
```

## License

This project is provided for educational and prototype use. Update the license text before production use if you plan to distribute or commercialize the app.

## Contributing

Contributions are welcome. If you’d like to improve the app, add more product data, or improve the scoring model, open a pull request with a clear description of the change.

## Acknowledgements

- Next.js
- Supabase
- ZXing
- The product and ingredient data used for demo coverage