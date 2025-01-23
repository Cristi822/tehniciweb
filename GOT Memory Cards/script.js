const cards = document.querySelectorAll(".card"),
  timeTag = document.querySelector(".time b"),
  flipsTag = document.querySelector(".flips b"),
  refreshBtn = document.querySelector(".details button");

let maxTime = 40;
let timeLeft = maxTime;
let flips = 0;
let matchedCard = 0;
let disableDeck = false;
let isPlaying = false;
let cardOne, cardTwo, timer;

function isLeaderboardEmpty() {
  const leaderboard = JSON.parse(localStorage.getItem("leaderboard"));
  return !leaderboard || leaderboard.length === 0;
}


function loadLeaderboardFromJSON() {
  if (isLeaderboardEmpty()) {
    fetch("leaderboard.json")
      .then(response => {
        if (!response.ok) {
          throw new Error("Eroare la incarcarea leaderboard-ului din JSON.");
        }
        return response.json();
      })
      .then(data => {
        localStorage.setItem("leaderboard", JSON.stringify(data)); 
        updateLeaderboard(); 
      })
      .catch(error => {
        console.error("Eroare la incarcarea leaderboard-ului din JSON:", error);
      });
  } else {
    updateLeaderboard();
  }
}

function addPlayerToLeaderboard(name, attempts) {
  let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
  leaderboard.push({ name, attempts });
  leaderboard.sort((a, b) => a.attempts - b.attempts);
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  updateLeaderboard();
}

function updateLeaderboard() {
  const leaderboardList = document.getElementById("leaderboardList");
  leaderboardList.innerHTML = "";

  const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

  leaderboard.forEach(player => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `${player.name} <span>${player.attempts}</span>`;
    leaderboardList.appendChild(listItem);
  });
}

function checkGameOver() {
  if (matchedCard === 6 && timeLeft > 0) {
    clearInterval(timer);

    const playerName = prompt("Introdu numele tau pentru leaderboard (doar litere):");
    if (!/^[a-zA-Z]+$/.test(playerName)) {
      alert("Numele este invalid!");
    } else {
      addPlayerToLeaderboard(playerName, flips);
    }
  }
}

function initTimer() {
  if (timeLeft <= 0) {
    return clearInterval(timer);
  }
  timeLeft--;
  timeTag.innerText = timeLeft;
}

function flipCard({ target: clickedCard }) {
  if (!isPlaying) {
    isPlaying = true;
    timer = setInterval(initTimer, 1000);
  }
  if (clickedCard !== cardOne && !disableDeck && timeLeft > 0) {
    flips++;
    flipsTag.innerText = flips;
    clickedCard.classList.add("flip");
    if (!cardOne) {
      return cardOne = clickedCard;
    }
    cardTwo = clickedCard;
    disableDeck = true;
    let cardOneImg = cardOne.querySelector(".back-view img").src,
      cardTwoImg = cardTwo.querySelector(".back-view img").src;
    matchCards(cardOneImg, cardTwoImg);
  }
}

function matchCards(img1, img2) {
  if (img1 === img2) {
    matchedCard++;
    if (matchedCard === 6) {
      setTimeout(checkGameOver, 500);
    }

    cardOne.removeEventListener("click", flipCard);
    cardTwo.removeEventListener("click", flipCard);
    cardOne = cardTwo = null;
    disableDeck = false;

    return;
  }

  setTimeout(() => {
    cardOne.classList.add("shake");
    cardTwo.classList.add("shake");
  }, 400);

  setTimeout(() => {
    cardOne.classList.remove("shake", "flip");
    cardTwo.classList.remove("shake", "flip");
    cardOne = cardTwo = null;
    disableDeck = false;
  }, 1200);
}

function shuffleCard() {
  timeLeft = maxTime;
  flips = matchedCard = 0;
  cardOne = cardTwo = "";
  clearInterval(timer);
  timeTag.innerText = timeLeft;
  flipsTag.innerText = flips;
  disableDeck = isPlaying = false;

  let arr = [1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6];
  arr.sort(() => Math.random() > 0.5 ? 1 : -1);

  cards.forEach((card, index) => {
    card.classList.remove("flip");
    let imgTag = card.querySelector(".back-view img");
    setTimeout(() => {
      imgTag.src = `images/img-${arr[index]}.png`;
    }, 500);
    card.addEventListener("click", flipCard);
  });
}

shuffleCard();

const resetBtn = document.getElementById("resetLeaderboard");

resetBtn.addEventListener("click", () => {
  if (confirm("Esti sigur ca vrei sa resetezi leaderboard-ul?")) {
    localStorage.setItem("leaderboard", JSON.stringify([]));
    updateLeaderboard();
    alert("Leaderboard-ul a fost resetat!");
  }
});

loadLeaderboardFromJSON();

refreshBtn.addEventListener("click", shuffleCard);
cards.forEach(card => {
  card.addEventListener("click", flipCard);
});
