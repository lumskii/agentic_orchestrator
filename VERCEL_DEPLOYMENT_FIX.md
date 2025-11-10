# Vercel Deployment Configuration

## 🚀 Vercel Project Settings

### Build & Development Settings:
```
Framework Preset: Next.js
Root Directory: frontend
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Development Command: npm run dev
```

### Environment Variables:
```
NEXT_PUBLIC_API_URL = https://your-railway-app.up.railway.app
```

---

## 📋 Step-by-Step Vercel Setup

### 1. **Go to Vercel Dashboard**
- Visit [vercel.com/dashboard](https://vercel.com/dashboard)
- Click "Add New..." → "Project"

### 2. **Import GitHub Repository**
- Select your `lumskii/agentic_orchestrator` repository
- Click "Import"

### 3. **Configure Project Settings**
Before deploying, click "Configure Project" and set:

**Framework Preset:** Next.js
**Root Directory:** `frontend` ⚠️ IMPORTANT
**Build Command:** `npm run build`
**Output Directory:** `.next`
**Install Command:** `npm install`

### 4. **Add Environment Variables**
Click "Environment Variables" and add:
- **Name:** `NEXT_PUBLIC_API_URL`
- **Value:** `https://your-railway-app.up.railway.app`

### 5. **Deploy**
Click "Deploy" - should work now! ✨

---

## 🔧 Alternative: Create vercel.json

If the above doesn't work, create this file in your repo root:

```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/.next",
  "installCommand": "cd frontend && npm install",
  "framework": "nextjs",
  "functions": {},
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-railway-app.up.railway.app/api/$1"
    }
  ]
}
```

---

## 🎯 What This Fixes

- ✅ **Root Directory Issue**: Vercel only looks in `frontend/` folder
- ✅ **Build Command**: Only runs `next build` (not server build)
- ✅ **Dependencies**: Only installs frontend dependencies
- ✅ **API Proxy**: Routes API calls to your Railway backend

## 🚀 Expected Result

After deployment:
- **Frontend**: `https://your-app.vercel.app` (full UI)
- **API calls**: Automatically routed to Railway backend
- **Full functionality**: Upload files, search, run workflows, view results