# 🎓 College FixIt

A modern, responsive **college complaint management system** built for FOSSHACK V1.0.  
Students can submit complaints, and admins can manage, resolve, and track them easily — all in real time.

[!WARNING]
As This Is a Demo You Can also Register As Admin in the actual web app admin registration shouldn't be allowed

---

## 🚀 Features

### 👩‍🎓 For Students
- Submit complaints with title, department & description  
- Track complaint status (pending / resolved)  
- Receive email updates  

### 🧑‍💼 For Admins
- View and manage all complaints  
- Update statuses instantly  
- Receive alerts for new submissions  

### ⚙️ System
- Role-based access (Student / Admin)  
- Firebase + EmailJS integration  
- Offline support via localStorage  
- Light/Dark theme toggle  

---

## 🧩 Tech Stack
- **Frontend:** React + TypeScript + Vite  
- **UI:** Tailwind CSS + shadcn/ui  
- **Backend:** Firebase (Auth + Firestore)  
- **Email:** EmailJS  
- **Validation:** Zod + React Hook Form  

---

## 📁 Project Structure

```
src/
├── components/ # UI components
├── contexts/ # Auth, Theme, Notifications
├── services/ # Firebase & EmailJS logic
├── pages/ # App pages
├── utils/ # Local storage & helpers
└── App.tsx
```

---

## ⚡ Setup


# Clone repo
```
git clone https://github.com/CorruptedPhysco/College-FixIt-Final.git
cd college-fixit
```
# Install dependencies
```
npm install
```
# Run locally
```
npm run dev
```

Create a .env.local file:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=your-emailjs-service-id
VITE_EMAILJS_PUBLIC_KEY=your-emailjs-public-key
VITE_ADMIN_EMAIL=admin@example.com
```
---

## 📜 License

This project is licensed under the MIT License.
See the LICENSE
 file for details.




