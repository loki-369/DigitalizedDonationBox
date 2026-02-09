# 🚀 DEPLOYMENT GUIDE - Digital Donation Box

## 🎯 **Best Free & Fast Hosting Options**

Your project has **2 parts** that need hosting:
1. **Frontend** (React Dashboard) → Vercel/Netlify
2. **Backend** (Node.js API Server) → Render/Railway

---

## ⭐ **RECOMMENDED SETUP (100% FREE)**

### **Frontend:** Vercel (BEST for React)
### **Backend:** Render (BEST free Node.js hosting)

**Why this combo?**
- ✅ Both are 100% free
- ✅ Automatic deployments from GitHub
- ✅ Fast global CDN
- ✅ HTTPS included
- ✅ Easy setup (5 minutes each)

---

## 📦 **STEP-BY-STEP DEPLOYMENT**

### **PART 1: Prepare Your Code**

#### **1.1 Update API URL in Frontend**

Create an environment variable file:

**File:** `dashboard_website/.env`
```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

**Update Dashboard.jsx, LoginPage.jsx, WithdrawalsPage.jsx:**

Replace:
```javascript
const API_BASE = 'http://localhost:3000/api'
```

With:
```javascript
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
```

#### **1.2 Create Production Environment Files**

**File:** `dashboard_website/.env.production`
```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

**File:** `dashboard_website/.env.development`
```env
VITE_API_URL=http://localhost:3000/api
```

#### **1.3 Update server.js for Production**

Add this at the top of `server.js`:

```javascript
// Allow frontend URL
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Update CORS
app.use(cors({
    origin: [FRONTEND_URL, 'http://localhost:5173'],
    credentials: true
}));
```

#### **1.4 Add .gitignore**

**File:** `dashboard_website/.gitignore`
```
node_modules/
dist/
.env
.env.local
donations.json
withdrawals.json
*.log
```

---

### **PART 2: Deploy Backend to Render**

#### **2.1 Create GitHub Repository**

```powershell
# In project root
git init
git add .
git commit -m "Initial commit - Digital Donation Box"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/digital-donation-box.git
git push -u origin main
```

#### **2.2 Deploy to Render**

1. **Go to:** https://render.com
2. **Sign up** with GitHub
3. **Click "New +"** → **"Web Service"**
4. **Connect** your GitHub repository
5. **Configure:**
   - **Name:** `donation-box-api`
   - **Root Directory:** `dashboard_website`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** `Free`

6. **Add Environment Variables:**
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = `https://your-frontend-url.vercel.app`

7. **Click "Create Web Service"**

8. **Wait 2-3 minutes** → Your backend is live! 🎉

**Your API URL:** `https://donation-box-api.onrender.com`

---

### **PART 3: Deploy Frontend to Vercel**

#### **3.1 Update Environment Variable**

In `dashboard_website/.env.production`:
```env
VITE_API_URL=https://donation-box-api.onrender.com/api
```

#### **3.2 Deploy to Vercel**

**Option A: Vercel CLI (Fastest)**

```powershell
# Install Vercel CLI
npm install -g vercel

# Navigate to dashboard folder
cd dashboard_website

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name? donation-box-dashboard
# - Directory? ./
# - Override settings? No

# Deploy to production
vercel --prod
```

**Option B: Vercel Dashboard**

1. **Go to:** https://vercel.com
2. **Sign up** with GitHub
3. **Click "Add New"** → **"Project"**
4. **Import** your GitHub repository
5. **Configure:**
   - **Framework Preset:** Vite
   - **Root Directory:** `dashboard_website`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   
6. **Environment Variables:**
   - `VITE_API_URL` = `https://donation-box-api.onrender.com/api`

7. **Click "Deploy"**

8. **Wait 1-2 minutes** → Your dashboard is live! 🎉

**Your Dashboard URL:** `https://donation-box-dashboard.vercel.app`

---

### **PART 4: Update Backend with Frontend URL**

1. **Go to Render Dashboard**
2. **Select your backend service**
3. **Environment** tab
4. **Update `FRONTEND_URL`:**
   ```
   FRONTEND_URL=https://donation-box-dashboard.vercel.app
   ```
5. **Save** → Service will redeploy

---

## 🎯 **ALTERNATIVE OPTIONS**

### **Option 2: All-in-One on Railway**

**Railway** can host both frontend and backend:

1. **Go to:** https://railway.app
2. **Sign up** with GitHub
3. **New Project** → **Deploy from GitHub**
4. **Add services:**
   - Service 1: Backend (Node.js)
   - Service 2: Frontend (Static Site)

**Pros:**
- ✅ Everything in one place
- ✅ $5 free credit monthly
- ✅ Fast deployments

**Cons:**
- ⚠️ Free tier limited to $5/month usage

---

### **Option 3: Netlify + Render**

Same as Vercel + Render, but using Netlify for frontend.

**Netlify is better if:**
- You want form handling
- You need serverless functions
- You prefer Netlify's UI

---

## 📊 **HOSTING COMPARISON**

| Service | Best For | Free Tier | Speed | Ease |
|---------|----------|-----------|-------|------|
| **Vercel** | Frontend | Unlimited | ⚡⚡⚡ | ⭐⭐⭐ |
| **Netlify** | Frontend | 100GB/month | ⚡⚡⚡ | ⭐⭐⭐ |
| **Render** | Backend | 750 hrs/month | ⚡⚡ | ⭐⭐⭐ |
| **Railway** | Both | $5/month | ⚡⚡⚡ | ⭐⭐ |
| **Heroku** | Backend | Paid only | ⚡⚡ | ⭐⭐ |

---

## ⚠️ **IMPORTANT: Data Persistence**

### **Problem:**
Free hosting services **restart** periodically, which will **delete** your `donations.json` and `withdrawals.json` files!

### **Solutions:**

#### **Option 1: Use MongoDB (FREE)**

**Best solution for production!**

1. **Create free MongoDB database:**
   - Go to: https://www.mongodb.com/cloud/atlas
   - Sign up → Create free cluster
   - Get connection string

2. **Update server.js to use MongoDB:**

```javascript
// Install: npm install mongodb
import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI;
const client = new MongoClient(MONGO_URI);

// Replace file operations with MongoDB operations
async function saveDonation(donation) {
    await client.db('donationbox').collection('donations').insertOne(donation);
}

async function getDonations() {
    return await client.db('donationbox').collection('donations').find().toArray();
}
```

3. **Add to Render environment variables:**
   - `MONGO_URI` = `mongodb+srv://username:password@cluster.mongodb.net/`

#### **Option 2: Use Render Persistent Disk (Paid)**

Render offers persistent storage for $1/month.

#### **Option 3: Keep JSON Files (Development Only)**

⚠️ **Warning:** Data will be lost on restart. Only use for testing!

---

## 🚀 **QUICK START DEPLOYMENT**

### **Fastest Way (5 Minutes):**

```powershell
# 1. Install Vercel CLI
npm install -g vercel

# 2. Navigate to dashboard
cd dashboard_website

# 3. Deploy frontend
vercel --prod

# 4. Note the URL (e.g., https://donation-box-xyz.vercel.app)

# 5. Update .env.production with backend URL (after step 6)

# 6. Deploy backend to Render (use web interface)
# - Go to render.com
# - New Web Service
# - Connect GitHub
# - Deploy!

# 7. Update Vercel environment variable
vercel env add VITE_API_URL production
# Enter: https://your-backend.onrender.com/api

# 8. Redeploy frontend
vercel --prod
```

**Done! Your app is live!** 🎉

---

## 📝 **POST-DEPLOYMENT CHECKLIST**

- [ ] Frontend loads at Vercel URL
- [ ] Backend responds at Render URL
- [ ] Login works with admin credentials
- [ ] Donations can be added
- [ ] Withdrawal works
- [ ] History page shows data
- [ ] CORS is configured correctly
- [ ] HTTPS is working
- [ ] Environment variables are set
- [ ] Database is connected (if using MongoDB)

---

## 🔧 **TROUBLESHOOTING**

### **"CORS Error"**
- Check `FRONTEND_URL` in Render environment variables
- Ensure CORS is configured in `server.js`

### **"API Not Found"**
- Check `VITE_API_URL` in Vercel environment variables
- Ensure it ends with `/api`

### **"Data Lost After Restart"**
- Implement MongoDB (see above)
- Or use Render persistent disk

### **"Backend Slow to Wake Up"**
- Free Render services sleep after 15 min inactivity
- First request takes 30-60 seconds
- Upgrade to paid plan ($7/month) for always-on

---

## 💰 **COST BREAKDOWN**

### **100% Free Setup:**
- Vercel (Frontend): **FREE**
- Render (Backend): **FREE** (with sleep)
- MongoDB Atlas: **FREE** (512MB)
- **Total: $0/month**

### **Recommended Production Setup:**
- Vercel (Frontend): **FREE**
- Render (Backend): **$7/month** (always-on)
- MongoDB Atlas: **FREE**
- **Total: $7/month**

---

## 🎯 **RECOMMENDED NEXT STEPS**

1. **Deploy to Vercel + Render** (follow guide above)
2. **Set up MongoDB** for data persistence
3. **Test thoroughly** with all 4 admin accounts
4. **Add custom domain** (optional, ~$10/year)
5. **Set up monitoring** (UptimeRobot - free)

---

## 📚 **HELPFUL RESOURCES**

- **Vercel Docs:** https://vercel.com/docs
- **Render Docs:** https://render.com/docs
- **MongoDB Atlas:** https://www.mongodb.com/docs/atlas/
- **Vite Environment Variables:** https://vitejs.dev/guide/env-and-mode.html

---

**🎊 Ready to deploy? Follow the steps above and your app will be live in minutes!**

**Need help? Check the troubleshooting section or ask me!** 🚀
