# 🚀 START HERE - The JERK Tracker X Setup

Welcome! Your development environment is ready. Follow this guide to get started.

---

## ⚡ 5-Minute Quick Start

```powershell
# 1. Verify everything is installed
.\verify-setup.ps1

# 2. Run automated setup (includes Lambda deployment)
.\setup-complete.ps1

# 3. Start development
npm run dev
```

Open http://localhost:3100 in your browser.

---

## 📋 Setup Phases

### Phase 1: Prerequisites ✅
- Node.js 18+
- npm 9+
- AWS SAM CLI
- AWS Toolkit for VS Code

**Check:** `.\verify-setup.ps1`

### Phase 2: Deploy Lambda Functions 🚀
- 4 Lambda functions for backend
- API Gateway for REST endpoints
- DynamoDB for data storage

**Run:** `.\setup-complete.ps1` (automated) or `cd aws-lambda && .\deploy-to-aws.ps1` (manual)

### Phase 3: Configure Mobile App 📱
- Update `.env.local` with API URL
- Build mobile app
- Deploy to Android

**Commands:**
```powershell
npm run build:mobile
npx cap sync android
npx cap open android
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `setup-complete.ps1` | **Run this first** - Automates entire setup |
| `verify-setup.ps1` | Check prerequisites |
| `SETUP-COMPLETE.md` | Detailed setup guide |
| `SETUP-SUMMARY.md` | Quick reference |
| `aws-lambda/DEPLOYMENT-CHECKLIST.md` | Track progress |
| `aws-lambda/BEGINNER-DEPLOYMENT-GUIDE.md` | Lambda detailed guide |
| `README.md` | Project overview |
| `docs/QUICK-REFERENCE.md` | Developer quick start |

---

## 🎯 Development Commands

### Web Development
```powershell
npm run dev          # Start dev server (port 3100)
npm run build        # Build for production
npm run lint         # Run linter
```

### Mobile Development
```powershell
npm run build:mobile # Build mobile app
npx cap sync android # Sync to Android
npx cap open android # Open in Android Studio
npm run android:run  # Run on device/emulator
```

### Lambda Development
```powershell
cd aws-lambda
.\deploy-to-aws.ps1  # Deploy functions
sam logs -n jerktracker-userSignup --tail  # View logs
sam delete           # Delete stack
```

---

## 🔐 Environment Setup

Your `.env.local` is configured with:
- ✅ NextAuth credentials
- ✅ AWS credentials
- ✅ DynamoDB settings
- ⏳ Mobile API URL (set after Lambda deployment)

**Important:** Never commit `.env.local` to Git (already in .gitignore)

---

## 📊 Project Structure

```
thejerktrackerX_SDK35/
├── app/              # Next.js pages & API routes
├── components/       # React components
├── mobile-android/   # Android-specific code
├── aws-lambda/       # Lambda backend functions
├── docs/             # Documentation
├── public/           # Static assets
├── styles/           # Styled components
├── lib/              # Utilities
├── .vscode/          # VS Code settings
└── .env.local        # Environment variables
```

---

## 🧪 Testing

### Web App
1. `npm run dev`
2. Visit http://localhost:3100
3. Sign in: admin@thejerktracker.com / admin123

### Mobile App
1. `npm run build:mobile`
2. `npx cap open android`
3. Run on emulator/device

### Lambda Functions
1. Check AWS Console: https://console.aws.amazon.com/lambda/
2. View CloudWatch logs
3. Test API endpoints

---

## 🆘 Troubleshooting

### "Command not found"
- Node.js: Install from https://nodejs.org/
- SAM CLI: `choco install aws-sam-cli`
- AWS CLI: `choco install awscli`

### "Build failed"
```powershell
rm -r .next
npm run build
```

### "Mobile app shows network error"
1. Check `.env.local` has correct API URL
2. Verify URL ends with `/prod`
3. Rebuild: `npm run build:mobile`

### "CORS errors"
```powershell
cd aws-lambda
sam build && sam deploy
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `README.md` | Project overview & features |
| `SETUP-COMPLETE.md` | Detailed setup instructions |
| `docs/QUICK-REFERENCE.md` | Quick start guide |
| `docs/PROJECT-STATUS.md` | Complete project status |
| `aws-lambda/BEGINNER-DEPLOYMENT-GUIDE.md` | Lambda setup guide |
| `docs/deployment/google-play/GOOGLE-PLAY-RELEASE-GUIDE.md` | App Store deployment |

---

## 💡 Pro Tips

1. **Use Amazon Q:** Press `Ctrl+I` for AI assistance
2. **Monitor Lambda:** https://console.aws.amazon.com/lambda/
3. **View Logs:** `sam logs -n jerktracker-userSignup --tail`
4. **Hot Reload:** Dev server auto-reloads on file changes
5. **Format Code:** `Ctrl+Shift+F` in VS Code

---

## ✅ Checklist

- [ ] Run `.\verify-setup.ps1`
- [ ] Run `.\setup-complete.ps1`
- [ ] Deploy Lambda functions
- [ ] Update `.env.local` with API URL
- [ ] Start dev server: `npm run dev`
- [ ] Build mobile app: `npm run build:mobile`
- [ ] Test in Android Studio
- [ ] Check AWS Console

---

## 🎉 Ready to Build!

Your environment is fully configured. Start developing:

```powershell
npm run dev
```

For detailed instructions, see `SETUP-COMPLETE.md` or `aws-lambda/BEGINNER-DEPLOYMENT-GUIDE.md`.

Need help? Use Amazon Q (Ctrl+I) or check the docs folder.

Happy coding! 🚀
