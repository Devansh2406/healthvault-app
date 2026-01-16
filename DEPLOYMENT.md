# Deploying Swasthya Sathi

## 1. GitHub Repository
Since the local repository is now initialized, you need to push it to GitHub.

1. **Create a new repository** on GitHub:
   - Go to [github.com/new](https://github.com/new).
   - Name it `swasthya-sathi`.
   - Do **not** initialize with README/gitignore (we already have them).

2. **Push your code**:
   Open your terminal in this project folder and run:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/swasthya-sathi.git
   git branch -M main
   git push -u origin main
   ```

## 2. Vercel Deployment

1. **Sign Up/Login** to [Vercel](https://vercel.com).
2. **Import Project**:
   - Go to "Add New" > "Project".
   - Select "Import from GitHub".
   - Choose the `swasthya-sathi` repository you just created.
3. **Configure**:
   - Framework Preset: `Vite` (should be auto-detected).
   - Build Command: `npm run build`.
   - Output Directory: `dist`.
4. **Deploy**:
   - Click "Deploy".
   - Vercel will build your app and verify it.

## Troubleshooting
- If the build fails on Vercel, ensure your `package.json` build script is `"build": "tsc && vite build"`.
- Provide the Environment Variables in Vercel Settings if you add any backend integration later.
