// ===== VARIABLES (Our Version) =====
let hunger = 50, energy = 50, hygiene = 50, happy = 50, money = 2500;
let charIndex = 1;
let playerName = "Traveler";
let currentLoc = "homebase";
let gameOver = false;
let gameHour = 6, gameMinute = 0;
let gameLoopInterval = null;

// === 🟢 NEW: Team's Map Variables 🟢 ===
const mapLocations = {
  Beach: { x: 15, y: 80 },
  Village: { x: 25, y: 30 },
  Temple: { x: 45, y: 20 },
  Mountain: { x: 80, y: 20 },
  Lake: { x: 70, y: 70 },
};
let mapChar = null;
let mapCharPos = { x: 50, y: 60 };
let nearLocation = null;
// ======================================

// ===== ON LOAD (Corrected) =====
window.onload = () => {
  // === SCREEN NAVIGATION ===
  document.getElementById("startBtn").onclick = () => show("character-select");
  document.getElementById("prevChar").onclick = () => changeChar(-1);
  document.getElementById("nextChar").onclick = () => changeChar(1);
  document.getElementById("startGameBtn").onclick = startGame;
  document.getElementById("restartBtn").onclick = restartGame;
  document.getElementById("returnHomeBtn").onclick = returnHome;

  // === 🟢 THIS IS THE FIX 🟢 ===
  // This makes your homebase buttons work
  document.querySelectorAll("#task-menu .task-btn").forEach(btn => {
    btn.onclick = () => handleHomeTask(btn.dataset.task);
  });
  // =================================

  // === MOVEMENT (Our in-game movement) ===
  document.querySelectorAll("#mobile-controls .ctrl, #mobile-controls-loc .ctrl").forEach(btn => {
    btn.onclick = () => moveCharacter(btn.dataset.dir);
  });
  
  document.addEventListener("keydown", e => {
    const map = { w: "up", a: "left", s: "down", d: "right" };
    // This now checks if map-screen is NOT active
    if (map[e.key] && !document.getElementById("map-screen").classList.contains("active")) {
      moveCharacter(map[e.key]);
    }
  });
  
  // === Init Team's Map Controls ===
  initMapControls();
};

// ===== SCREEN SWITCH (Merged) =====
function show(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");

  // 🟢 NEW: Logic when entering map screen
  if (id === "map-screen") {
    // Set map char sprite to our chosen 'charhead' sprite
    const char = document.getElementById("characterMap");
    if (char) char.src = `assets/charhead${charIndex}.png`;
    
    // Reset position
    mapCharPos = { x: 50, y: 60 };
    if (mapChar) {
      mapChar.style.top = mapCharPos.y + "%";
      mapChar.style.left = mapCharPos.x + "%";
    }
    
    // Team's energy cost for opening map
    energy -= 2; 
    
    // Our time-of-day map background
    updateMapScreen();
    updateStats();
  }
}

// ===== CHARACTER SELECT (Our Version) =====
function changeChar(direction) {
  charIndex += direction;
  if (charIndex < 1) charIndex = 4;
  if (charIndex > 4) charIndex = 1;
  document.getElementById("charPreview").src = `assets/charhead${charIndex}.png`;
}

// ===== START GAME (Our Version) =====
function startGame() {
  playerName = document.getElementById("playerName").value || "Traveler";
  document.getElementById("character").src = `assets/charmove${charIndex}.png`;
  document.getElementById("characterLoc").src = `assets/charmove${charIndex}.png`;
  
  updateBackground();
  updateGreeting();
  updateGameTimeUI();
  updateStats();
  show("homebase-screen");

  if (gameLoopInterval) clearInterval(gameLoopInterval);
  gameLoopInterval = setInterval(gameTick, 1000);
}

// ===== GAME TICK (Our Clock & Stat Decay) =====
function gameTick() {
  if (gameOver) return;

  // 1. ADVANCE TIME
  gameMinute++;
  let hourChanged = false;
  if (gameMinute >= 60) {
    gameMinute = 0;
    gameHour++;
    hourChanged = true;
    if (gameHour >= 24) {
      gameHour = 0;
    }
  }

  // 2. UPDATE TIME-BASED UI
  if (hourChanged) {
    updateBackground();
    updateGreeting();
  }
  updateGameTimeUI();

  // 3. STAT DECAY (with faster happiness decay)
  if (gameMinute % 5 === 0) hunger = Math.max(0, hunger - 2);
  if (gameMinute % 10 === 0) energy = Math.max(0, energy - 1);
  if (gameMinute % 10 === 0) happy = Math.max(0, happy - 5);

  // 4. UPDATE STATS UI
  updateStats();
}

// ===== TIME UI & HELPERS (Our Version) =====
function updateGameTimeUI() {
  const displayHour = String(gameHour).padStart(2, '0');
  const displayMinute = String(gameMinute).padStart(2, '0');
  const timeString = `${displayHour}:${displayMinute}`;
  
  const timeEl = document.getElementById('game-time');
  const timeElLoc = document.getElementById('game-time-loc');
  if (timeEl) timeEl.innerText = timeString;
  if (timeElLoc) timeElLoc.innerText = timeString;
}

function getTimeSuffix(isHomebase = false) {
  const h = gameHour;
  if (h >= 6 && h < 12) {
    return isHomebase ? "Pagi" : ""; // Day
  } else if (h >= 12 && h < 18) {
    return "Sore"; // Afternoon
  } else {
    return "Malam"; // Night
  }
}

function updateBackground() { // For Homebase
  const suffix = getTimeSuffix(true);
  const homeBg = document.getElementById("home-bg");
  if (homeBg) homeBg.src = `assets/homebase${suffix}.png`;
}

function updateMapScreen() { // For World Map
  const suffix = getTimeSuffix(false);
  const mapScreen = document.getElementById("map-screen");
  if (mapScreen) {
    mapScreen.style.backgroundImage = `url('assets/worldwide${suffix}.png')`;
  }
  const mapBg = document.getElementById("map-bg"); // Also update the img
  if (mapBg) {
    // Check if the asset exists before setting, or just set it
    // Note: this assumes worldwide.png, worldwideSore.png, etc. exist
    mapBg.src = `assets/worldwide${suffix}.png`;
  }
}

function updateGreeting() {
  const h = gameHour;
  let greet;
  if (h >= 5 && h < 12) greet = "Selamat Pagi";
  else if (h >= 12 && h < 17) greet = "Selamat Siang";
  else if (h >= 17 && h < 21) greet = "Selamat Sore";
  else greet = "Selamat Malam";
  
  const greetingEl = document.getElementById("greeting");
  if (greetingEl) greetingEl.innerText = `${greet}, ${playerName}`;
}

// ===== STATS (Our Stat Bar Version - FIXES "NaN") =====
function updateStats() {
  let statsToUpdate = ["hunger", "energy", "hygiene", "happy"];

  statsToUpdate.forEach(stat => {
    let value;
    switch(stat) {
      case 'hunger': value = hunger; break;
      case 'energy': value = energy; break;
      case 'hygiene': value = hygiene; break;
      case 'happy': value = happy; break;
    }
    value = Math.max(0, Math.min(100, value));
    
    switch(stat) {
      case 'hunger': hunger = value; break;
      case 'energy': energy = value; break;
      case 'hygiene': hygiene = value; break;
      case 'happy': happy = value; break;
    }

    const barColor = value < 20 ? '#ff0000' : (value < 50 ? '#ffcc00' : '#00ff00');
    const roundedValue = Math.round(value); // Show rounded number

    // Homebase Screen
    const homeBar = document.getElementById(`${stat}-bar`);
    const homeVal = document.getElementById(`${stat}-val`); // This ID is in your new HTML
    if (homeBar) {
      homeBar.style.width = value + '%';
      homeBar.style.backgroundColor = barColor;
    }
    if (homeVal) homeVal.innerText = roundedValue; // This fixes the "NaN"

    // Location Screen
    const locBar = document.getElementById(`${stat}-bar-loc`);
    const locVal = document.getElementById(`${stat}-val-loc`); // This ID is in your new HTML
    if (locBar) {
      locBar.style.width = value + '%';
      locBar.style.backgroundColor = barColor;
    }
    if (locVal) locVal.innerText = roundedValue; // This fixes the "NaN"
  });

  // Update Money
  money = Math.max(0, money); // Clamp money
  const moneyEl = document.getElementById("money");
  const moneyElLoc = document.getElementById("money-loc");
  if (moneyEl) moneyEl.innerText = money;
  if (moneyElLoc) moneyElLoc.innerText = money;

  checkGameOver();
}

// ===== HOME TASKS (Our Version, 4-hour sleep, "Buy" removed) =====
function handleHomeTask(task) {
  if (gameOver) return;
  
  if (task === "eat") {
    hunger = Math.min(100, hunger + 5);
    money -= 100;
  }
  else if (task === "bath") {
    hygiene = Math.min(100, hygiene + 25);
    energy -= 5;
  }
  else if (task === "sleep") {
    energy = Math.min(100, energy + 30);
    hunger -= 10;
    gameHour += 4; // Our 4-hour time skip
    if (gameHour >= 24) gameHour -= 24;
    updateBackground();
    updateGreeting();
  }
  else if (task === "chores") {
    money += 300;
    energy -= 10;
    hygiene -= 10;
  }
  // "buy" task is removed
  else if (task === "exit") {
    show("map-screen"); // This now calls our modified show()
    return;
  }

  updateStats(); // Update stats immediately
}


// ===== 🟢 NEW: Team's Free Roam Map Functions 🟢 =====
function initMapControls() {
  mapChar = document.getElementById("characterMap");

  // Analog map controls
  document.querySelectorAll("#mobile-controls-map .ctrl").forEach(btn => {
    btn.onclick = () => {
      handleFreeRoam({ key: btn.dataset.dir }); // Use 'w,a,s,d'
    };
  });

  // Keyboard map controls
  document.addEventListener("keydown", handleFreeRoam);

  // Enter button
  document.getElementById("enterBtn").onclick = () => {
    if (nearLocation) enterLocation(nearLocation);
  };
}

function handleFreeRoam(e) {
  // Only run if map-screen is active
  if (!document.getElementById("map-screen").classList.contains("active")) return;
  
  const step = 1.8;
  // Use w,a,s,d for keys
  if (e.key === "w" || e.key === "ArrowUp") mapCharPos.y -= step;
  if (e.key === "s" || e.key === "ArrowDown") mapCharPos.y += step;
  if (e.key === "a" || e.key === "ArrowLeft") mapCharPos.x -= step;
  if (e.key === "d" || e.key === "ArrowRight") mapCharPos.x += step;

  mapCharPos.x = Math.max(10, Math.min(85, mapCharPos.x));
  mapCharPos.y = Math.max(10, Math.min(85, mapCharPos.y));

  if (mapChar) {
    mapChar.style.left = mapCharPos.x + "%";
    mapChar.style.top = mapCharPos.y + "%";
  }

  checkProximity();
}

function checkProximity() {
  const enterBtn = document.getElementById("enterBtn");
  if (!enterBtn) return; // Safety check
  
  nearLocation = null;

  for (const loc in mapLocations) {
    const { x, y } = mapLocations[loc];
    const dx = mapCharPos.x - x;
    const dy = mapCharPos.y - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < 8) {
      enterBtn.classList.remove("hidden");
      enterBtn.innerHTML = `ENTER ${loc.toUpperCase()}`;
      nearLocation = loc;
      return;
    }
  }
  enterBtn.classList.add("hidden");
}
// ================================================


// ===== 🟢 NEW: Location Activity Handler 🟢 =====
function handleLocationActivity(action) {
  if (gameOver) return;

  // Handle universal actions
  if (action === 'return') {
    show("map-screen");
    return;
  }

  if (action === 'buy') {
    // This action is only added for the Village
    showPopup(
      "<img src='assets/hunger.png' class='popup-title-icon'> Buy Food",
      "Buy Nasi Goreng for 300 coins? (+25 Hunger)", 
      () => {
        if (money >= 300) {
          money -= 300;
          hunger = Math.min(100, hunger + 25);
        }
      }
    );
    return; // Popup handles stats update
  }

  // Handle new specific activities
  if (action === 'pickupTrash') {
    showPopup(
      "<img src='assets/trash.png' class='popup-title-icon'> Pickup Trash",
      "Pickup trash on the beach? (-10 Energy, -5 Hygiene, +15 Happy)",
      () => {
        energy -= 10;
        hygiene -= 5;
        happy += 15;
      }
    );
    return;
  }
  if (action === 'mine') {
    showPopup(
      "<img src='assets/mine.png' class='popup-title-icon'> Mine",
      "Go mining for gems? (-20 Energy, +5 Happy, +500 Money)",
      () => {
        energy -= 15;
        happy += 10;
        money += 500;
      }
    );
    return;
  }
  if (action === 'feedFish') {
    showPopup(
      "<img src='assets/fish.png' class='popup-title-icon'> Feed Fish",
      "Feed the fish? (-100 Money, +10 Happy)",
      () => {
        if (money >= 100) {
          money -= 100;
          happy += 10;
        } else {
          // You could add an "not enough money" popup here
        }
      }
    );
    return;
  }
  if (action === 'offering') {
    showPopup(
      "<img src='assets/offer.png' class='popup-title-icon'> Make Offering",
      "Make a large offering to the spirits? (-5000 Money, +50 ALL STATS)",
      () => {
        if (money >= 5000) {
          money -= 5000;
          happy += 50;
          energy += 50;
          hunger += 50;
          hygiene += 50;
        } else {
          // You could add an "not enough money" popup here
        }
      }
    );
    return;
  }
  
  // Handle the original "Do Activity"
  if (action === 'activity') {
    const activityData = {
      Beach: { text: "Swim in the ocean? (-10 Energy, +10 Hygiene, +10 Happy)", effect: () => { energy -= 10; hygiene += 10; happy += 10; }},
      Village: { text: "Help the merchant? (+300 Money, -5 Energy)", effect: () => { money += 300; energy -= 5; }},
      Temple: { text: "Meditate for peace? (+10 Happy, -10 Hunger, +10 Energy)", effect: () => { happy += 10; hunger -= 10; energy += 10; }},
      Mountain: { text: "Go hiking? (-15 Energy, +10 Happy)", effect: () => { energy -= 15; happy += 10; }},
      Lake: { text: "Go fishing? (-10 Energy, +10 Hunger, +5 Happy)", effect: () => { energy -= 10; hunger += 10; happy += 5; }},
    };

    if (activityData[currentLoc]) {
      const { text, effect } = activityData[currentLoc];
      showPopup(`<img src='assets/activity.png' class='popup-title-icon'> ${currentLoc} Activity`, text, effect);
    }
    return;
  }
}

// ===== ENTER LOCATION (Our Merged Version, with new button builder) =====
function enterLocation(loc) {
  if (gameOver) return;
  currentLoc = loc;
  
  document.getElementById("loc-name").innerText = loc;
  
  // Set background based on time
  const locBgEl = document.getElementById("location-bg");
  if (locBgEl) {
    const suffix = getTimeSuffix(false); // false = for map
    locBgEl.src = `assets/${loc.toLowerCase()}${suffix}.png`;
  }

  // Set character size based on location
  const charEl = document.getElementById("characterLoc");
  if (charEl) {
    if (loc === "Village") {
      charEl.classList.add("char-village");
    } else {
      charEl.classList.remove("char-village");
    }
  }

  // --- NEW: DYNAMICALLY BUILD BUTTONS ---
  const menu = document.getElementById('task-menu-loc');
  menu.innerHTML = ''; // Clear old buttons

  // Helper function to create a button
  function createLocButton(text, icon, action) {
    const btn = document.createElement('button');
    btn.className = 'task-btn';
    btn.dataset.action = action;
    btn.innerHTML = `<img src="assets/${icon}" class="btn-icon"> ${text}`;
    btn.onclick = () => {
      handleLocationActivity(action); // Use our new handler
    };
    menu.appendChild(btn);
  }

  // --- Define buttons for each location ---
  if (loc === 'Village') {
    createLocButton('Help Merchant', 'activity.png', 'activity');
    createLocButton('Buy Food', 'hunger.png', 'buy');
  }
  else if (loc === 'Beach') {
    createLocButton('Swim', 'activity.png', 'activity');
    createLocButton('Pickup Trash', 'trash.png', 'pickupTrash');
  }
  else if (loc === 'Mountain') {
    createLocButton('Go Hiking', 'activity.png', 'activity');
    createLocButton('Mine', 'mine.png', 'mine');
  }
  else if (loc === 'Lake') {
    createLocButton('Go Fishing', 'activity.png', 'activity');
    createLocButton('Feed Fish', 'fish.png', 'feedFish');
  }
  else if (loc === 'Temple') {
    createLocButton('Meditate', 'activity.png', 'activity');
    createLocButton('Offering', 'offer.png', 'offering');
  }

  // Add the "Return" button to all locations
  createLocButton('Return to Map', 'exit.png', 'return');
  // --- END OF NEW BUTTON LOGIC ---
  
  show("location-screen");
}

// ===== POPUP SYSTEM (Our Version with Icons) =====
function showPopup(title, text, onConfirm) {
  const popup = document.getElementById("popup-task");
  document.getElementById("popup-title").innerHTML = title; // Use innerHTML
  document.getElementById("popup-text").innerText = text;

  popup.classList.remove("hidden");

  const yes = document.getElementById("popup-yes");
  const no = document.getElementById("popup-no");

  yes.onclick = () => {
    onConfirm();
    popup.classList.add("hidden");
    updateStats();
  };
  no.onclick = () => popup.classList.add("hidden");
}

// ===== CHARACTER MOVEMENT (Our Version with Flipping) =====
function moveCharacter(dir) {
  if (gameOver) return;
  let activeChar;
  if (document.getElementById("location-screen").classList.contains("active"))
    activeChar = document.getElementById("characterLoc");
  else if (document.getElementById("homebase-screen").classList.contains("active"))
    activeChar = document.getElementById("character");

  if (!activeChar) return;

  let top = parseFloat(activeChar.style.top || 60);
  let left = parseFloat(activeChar.style.left || 50);
  
  let currentScale = activeChar.style.transform.includes("scaleX(-1)") ? "scaleX(-1)" : "scaleX(1)";

  if (dir === "up" && top > 10) {
    top -= 2;
  } else if (dir === "down" && top < 85) {
    top += 2;
  } else if (dir === "left" && left > 5) {
    left -= 2;
    currentScale = "scaleX(1)"; // Face left (normal)
  } else if (dir === "right" && left < 95) {
    left += 2;
    currentScale = "scaleX(-1)"; // Face right (flipped)
  }

  activeChar.style.top = top + "%";
  activeChar.style.left = left + "%";
  activeChar.style.transform = `translate(-50%, -50%) ${currentScale}`;
}

// ===== RETURN HOME (Our Version) =====
function returnHome() {
  if (gameOver) return;
  updateBackground();
  show("homebase-screen");
}

// ===== GAME OVER (Our Version) =====
function checkGameOver() {
  if (!gameOver && (hunger <= 0 || energy <= 0 || happy <= 0)) {
    gameOver = true;
    if (gameLoopInterval) clearInterval(gameLoopInterval);
    document.getElementById("gameover-popup").classList.remove("hidden");
  }
}

// ===== RESTART GAME (Our Version) =====
function restartGame() {
  if (gameLoopInterval) clearInterval(gameLoopInterval);

  hunger = 50; energy = 50; hygiene = 50; happy = 50; money = 2500;
  gameHour = 6; gameMinute = 0;
  gameOver = false;
  
  document.getElementById("gameover-popup").classList.add("hidden");
  show("start-screen");
}