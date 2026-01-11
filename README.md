# NoHesitate – Question Without Hesitation 🧠🎓

NoHesitate is a real-time classroom interaction platform that enables students to ask doubts anonymously without hesitation and provides teachers with live insights into classroom understanding.

---

## 🚀 Getting Started

### Backend Setup (Express + MongoDB)

cd backend  
npm install  

Create a `.env` file (refer `.env.example`) and configure MongoDB URI and server settings.

npm run dev  

---

### Frontend Setup (React + Tailwind)

Open a new terminal:

cd frontend  
npm install  

Create a `.env` file (refer `.env.example`) and configure API and Socket URLs.

npm start  

---

### Open Application

http://localhost:3000

---

## 🧩 Project Structure

### Backend (Express + MongoDB)

server.js – Main Express server with Socket.IO  
models/Session.model.js – Session database schema  
models/Doubt.model.js – Doubt schema with merging support  
models/Confusion.model.js – Confusion tracking schema  
controllers/doubt.controller.js – Doubt business logic  
controllers/confusion.controller.js – Confusion logic  
routes/session.routes.js – Session API endpoints  
routes/doubt.routes.js – Doubt API endpoints  
routes/confusion.routes.js – Confusion API endpoints  
routes/analytics.routes.js – Analytics endpoints  
utils/nlp.utils.js – Lightweight NLP for question merging  
package.json – Backend dependencies  
.env.example – Environment template  
.gitignore  

---

### Frontend (React + Tailwind)

src/App.jsx – Application routing  
src/index.js – React entry point  
src/index.css – Global styles  
src/pages/HomePage.jsx – Landing page  
src/pages/SessionSetup.jsx – Teacher session setup  
src/pages/JoinSession.jsx – Student session join  
src/pages/StudentDashboard.jsx – Student interface  
src/pages/TeacherDashboard.jsx – Teacher dashboard  
src/components/ConfusionMeter.jsx – Emoji-based confusion meter  
src/components/DoubtSubmission.jsx – Doubt submission form  
src/components/DoubtCard.jsx – Doubt display component  
src/components/ConfusionStats.jsx – Confusion statistics  
src/services/api.service.js – API abstraction  
src/services/socket.service.js – Socket abstraction  
src/contexts/SessionContext.jsx – Global session state  
package.json – Frontend dependencies  
tailwind.config.js – Tailwind configuration  
postcss.config.js – PostCSS setup  
.env.example  
.gitignore  

---

## 🏗️ Architecture Highlights

Backend  
• MVC-based architecture  
• MongoDB with Mongoose ODM  
• RESTful API design  
• Socket.IO for real-time communication  
• Indexed queries for performance  
• Lightweight NLP-based doubt merging  

Frontend  
• Component-based React architecture  
• React Router for navigation  
• Context API for state management  
• Service-layer abstraction  
• Tailwind CSS for responsive UI  

Real-Time System  
• Bidirectional WebSocket communication  
• Room-based sessions  
• Event-driven updates  
• Automatic reconnection handling  

---

## 🔮 Future Enhancements

Advanced NLP models  
User authentication (JWT)  
Email notifications  
PDF / CSV export  
Mobile application  
Video classroom integration  
Advanced analytics dashboard  
LMS integration  

---

## 📌 Summary

NoHesitate converts silent classroom confusion into actionable teaching insights by enabling anonymous participation, real-time feedback, and adaptive learning.

Ask freely. Learn clearly.
