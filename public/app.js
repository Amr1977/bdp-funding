import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA3algpcRUAYj6qNNyYo7Do146Ublb96qU",
  authDomain: "bdp-fund.firebaseapp.com",
  databaseURL: "https://bdp-fund-default-rtdb.firebaseio.com",
  projectId: "bdp-fund",
  storageBucket: "bdp-fund.firebasestorage.app",
  messagingSenderId: "536026435831",
  appId: "1:536026435831:web:09842d7f7f731f0daf03f2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Character counter for description
function updateCharCount() {
  const desc = document.getElementById("description");
  const counter = document.getElementById("char-count");
  desc.addEventListener("input", () => {
    let len = desc.value.length;
    if (len > 500) {
      desc.value = desc.value.slice(0, 500);
      len = 500;
    }
    counter.textContent = `${len} / 500`;
  });
}

async function loadFeatures() {
  const featureList = document.getElementById("featureList");
  featureList.innerHTML = '<li class="list-group-item text-muted">Loading features...</li>';

  try {
    const q = query(collection(db, "featureRequests"), orderBy("createdAt", "desc"));
    const qSnap = await getDocs(q);
    
    if (qSnap.empty) {
      featureList.innerHTML = '<li class="list-group-item text-muted">No feature requests yet. Be the first!</li>';
      return;
    }

    featureList.innerHTML = "";
    qSnap.forEach(docSnap => {
      const f = docSnap.data();
      const li = document.createElement("li");
      li.classList.add("list-group-item", "feature-fade");

      // Role badge
      const role = f.persona ? f.persona.toLowerCase() : "";
      const badge = role
        ? `<span class="role-badge ${role}">${role.charAt(0).toUpperCase() + role.slice(1)}</span>`
        : "";

      li.innerHTML = `<strong>${f.name || "Anonymous"}</strong> ${badge}: ${f.description.replace(/</g, "&lt;")}`;
      featureList.appendChild(li);
    });
  } catch (err) {
    console.error("Error loading features:", err);
    featureList.innerHTML = '<li class="list-group-item text-danger">⚠ Unable to load feature requests. Please try again later.</li>';
  }
}

async function submitFeature(e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const persona = document.getElementById("persona").value;
  const description = document.getElementById("description").value.trim();
  const confirmation = document.getElementById("confirmation");

  if (!persona) {
    confirmation.className = "text-danger fw-bold mt-2";
    confirmation.innerText = "❌ Please select your role.";
    return;
  }
  if (description.length < 10) {
    confirmation.className = "text-danger fw-bold mt-2";
    confirmation.innerText = "❌ Description must be at least 10 characters.";
    return;
  }

  try {
    await addDoc(collection(db, "featureRequests"), {
      name: name || "Anonymous",
      persona,
      description,
      createdAt: new Date()
    });
    confirmation.className = "text-success fw-bold mt-2 show";
    confirmation.innerText = "✅ Thank you! Your feature request has been submitted.";
    e.target.reset();
    document.getElementById("char-count").textContent = "0 / 500";
    loadFeatures();
    setTimeout(() => confirmation.classList.remove("show"), 3000);

    // Smooth scroll to features list
    document.getElementById("features").scrollIntoView({ behavior: "smooth" });
  } catch (err) {
    console.error("Error adding feature request:", err);
    confirmation.className = "text-danger fw-bold mt-2 show";
    confirmation.innerText = `❌ Failed to submit: ${err.message || "Unknown error"}`;
    setTimeout(() => confirmation.classList.remove("show"), 3000);
  }
}

function setupCopyButtons() {
  const feedback = document.getElementById("copy-feedback");
  
  document.querySelectorAll(".copy-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const targetId = btn.getAttribute("data-target");
      const targetElement = document.getElementById(targetId);
      const text = targetElement.innerText;

      try {
        await navigator.clipboard.writeText(text);
        feedback.className = "text-success fw-bold text-center mt-2 show";
        feedback.innerText = `✅ Copied ${targetId.replace("wallet-", "").toUpperCase()}!`;
        setTimeout(() => {
          feedback.classList.remove("show");
          feedback.innerText = "";
        }, 2000);
      } catch (err) {
        console.error("Copy failed:", err);
        feedback.className = "text-danger fw-bold text-center mt-2 show";
        feedback.innerText = "❌ Failed to copy. Please try again.";
        setTimeout(() => {
          feedback.classList.remove("show");
          feedback.innerText = "";
        }, 2000);
      }
    });

    btn.addEventListener("keydown", async (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        btn.click();
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadFeatures();
  updateCharCount();
  document.getElementById("featureForm").addEventListener("submit", submitFeature);
  setupCopyButtons();
});