import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDIsjzhspFRotPHLgV34oHmqrmfy7Ua8Do",
  authDomain: "hirewilliamanalytics.firebaseapp.com",
  projectId: "hirewilliamanalytics",
  storageBucket: "hirewilliamanalytics.firebasestorage.app",
  messagingSenderId: "220009384741",
  appId: "1:220009384741:web:39c009afddbc8f23a5e8cc",
  measurementId: "G-5Q68Y9Z169"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export async function saveQuizSubmission({ email, answers, score }) {
  const payload = {
    email,
    score,
    submittedAt: serverTimestamp(),
    answers: Object.fromEntries(
      Object.entries(answers).map(([qId, answerIndex]) => {
        const questions = {
          outreach: { tag: "Sales & outreach", options: ["Doing it all myself", "Have a tool but babysitting it", "Mostly automated", "Not doing outbound yet"] },
          support:  { tag: "Customer support", options: ["Human help desk in my inbox", "Team answers but slow", "Templates but manual send", "Mostly automated"] },
          ops:      { tag: "Operations & admin", options: ["Lots of manual admin", "Some automated, still busywork", "Mostly autopilot", "Do everything myself"] },
          content:  { tag: "Content & marketing", options: ["Randomly/when I remember", "Couple times a month", "Few times a week", "Almost every day"] },
          crm:      { tag: "CRM & pipeline", options: ["Not at all - in my head", "Sort of - CRM lies to me", "Mostly clean but drifts", "Mostly auto-updated"] },
          capacity: { tag: "Team & capacity", options: ["Hire full-time", "Bring in freelancer/VA", "Add another tool", "Spin up an AI agent"] },
          fire:     { tag: "Founders on fire", options: ["Already slipping", "Very close", "Sometimes", "Mostly on top of things"] },
          stack:    { tag: "Tools & integrations", options: ["Don't connect at all", "I'm the human API", "Most connected, still nudge", "Mostly integrated"] },
        };
        const q = questions[qId];
        return [qId, { area: q?.tag || qId, answer: q?.options[answerIndex] || `Option ${answerIndex}` }];
      })
    ),
  };
  await addDoc(collection(db, "quiz_submissions"), payload);
}
