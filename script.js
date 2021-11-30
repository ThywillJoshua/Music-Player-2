"use strict";

//IMPORT DATA
import chillHop from "./data.js";

//////DOM ELEMENTS//////
const library = document.querySelector(".library");
const libraryBtn = document.querySelector(".library__btn");
const libraryContent = document.querySelector(".library__content");
let librarySong, librarySongName;

const songImg = document.querySelector(".song__img");
const songName = document.querySelector(".song__name");
const artistName = document.querySelector(".artist__name");

const mainSection = document.querySelector(".main__section");
const backwardBtn = document.querySelector(".backward__btn");
const playBtn = document.querySelector(".play__btn");
const forwardBtn = document.querySelector(".forward__btn");

const audio = document.querySelector(".audio");
const progress = document.querySelector(".progress");
const songRange = document.querySelector(".song__range");

const songsArr = chillHop();
let currentSong,
  currentName,
  currentImg,
  currentArtist,
  currentAudio,
  currentColor;

//////FUNCTIONS//////

//Set current song data
function currentSongData(i, num) {
  currentName = i[num].name;
  currentSong = i[num].id;
  currentArtist = i[num].artist;
  currentAudio = i[num].audio;
  currentImg = i[num].cover;
  currentColor = i[num].color;
}
currentSongData(songsArr, 0);

//Update UI
function updateUI() {
  songImg.src = currentImg;
  songName.innerText = currentName;
  artistName.innerText = currentArtist;
  audio.src = currentAudio;
  progress.style.backgroundImage = `linear-gradient(45deg, ${currentColor[0]}, ${currentColor[1]})`;
}
updateUI();

//Fill Library
function fillLibrary(i) {
  i.forEach((song) => {
    const { name, cover, artist } = song;

    const html = `<div class="library__song">
    <img src="${cover}" alt="" class="library__img" />
    <div class="song__name-title">
      <h3 class="song__name">${name}</h3>
      <h4>${artist}</h4>
    </div>
  </div>`;
    libraryContent.insertAdjacentHTML("beforeend", html);
  });
  librarySongName = document.querySelectorAll(".song__name");

  librarySong = document.querySelectorAll(".library__song");
}

fillLibrary(songsArr);

//Play Song
function play() {
  audio.play();
  playBtn.classList.remove("fa-play");
  playBtn.classList.add("fa-pause");

  //remove library highlight
  librarySong.forEach((song) => {
    song.classList.remove("active__song");

    if (currentName === song.lastElementChild.firstElementChild.innerText) {
      song.classList.add("active__song");
    }
  });
}

//Pause Song
function pause() {
  audio.pause();
  playBtn.classList.remove("fa-pause");
  playBtn.classList.add("fa-play");
}

//nextSong
function nextSong() {
  progress.style.width = 0;
  if (currentSong === songsArr.length - 1) {
    currentSongData(songsArr, 0);
    updateUI();
    play();
  } else {
    currentSong += 1;
    songsArr.filter((_, i) => i === currentSong);
    currentSongData(songsArr, currentSong);
    updateUI();
    play();
  }
}

//prevSong
function prevSong() {
  progress.style.width = 0;
  if (currentSong === 0) {
    currentSongData(songsArr, songsArr.length - 1);
    updateUI();
    play();
  } else {
    currentSong -= 1;
    songsArr.filter((_, i) => i === currentSong);
    currentSongData(songsArr, currentSong);
    updateUI();
    play();
  }
}

//library fadeIn
function fadeIn() {
  library.classList.remove("fadeOutLeft");
  library.classList.add("fadeInLeft");
}

//library fadeOut
function fadeOut() {
  library.classList.remove("fadeInLeft");
  library.classList.add("fadeOutLeft");
}

//update music progress
function updateProgress(e) {
  const { duration, currentTime } = e.srcElement;
  const progressPercent = (currentTime / duration) * 100;
  progress.style.width = `${progressPercent}%`;
}

//set music progress
function setProgress(e) {
  const width = this.clientWidth;
  const clickX = e.offsetX;
  const duration = audio.duration;

  audio.currentTime = (clickX / width) * duration;
}

//Touch functionality
(function (window, document) {
  // patch CustomEvent to allow constructor creation (IE/Chrome)
  if (typeof window.CustomEvent !== "function") {
    window.CustomEvent = function (event, params) {
      params = params || {
        bubbles: false,
        cancelable: false,
        detail: undefined,
      };

      var evt = document.createEvent("CustomEvent");
      evt.initCustomEvent(
        event,
        params.bubbles,
        params.cancelable,
        params.detail
      );
      return evt;
    };

    window.CustomEvent.prototype = window.Event.prototype;
  }

  document.addEventListener("touchstart", handleTouchStart, false);
  document.addEventListener("touchmove", handleTouchMove, false);
  document.addEventListener("touchend", handleTouchEnd, false);

  var xDown = null;
  var yDown = null;
  var xDiff = null;
  var yDiff = null;
  var timeDown = null;
  var startEl = null;

  /**
   * Fires swiped event if swipe detected on touchend
   * @param {object} e - browser event object
   * @returns {void}
   */
  function handleTouchEnd(e) {
    // if the user released on a different target, cancel!
    if (startEl !== e.target) return;

    var swipeThreshold = parseInt(
      getNearestAttribute(startEl, "data-swipe-threshold", "20"),
      10
    ); // default 20px
    var swipeTimeout = parseInt(
      getNearestAttribute(startEl, "data-swipe-timeout", "500"),
      10
    ); // default 500ms
    var timeDiff = Date.now() - timeDown;
    var eventType = "";
    var changedTouches = e.changedTouches || e.touches || [];

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      // most significant
      if (Math.abs(xDiff) > swipeThreshold && timeDiff < swipeTimeout) {
        if (xDiff > 0) {
          eventType = "swiped-left";
        } else {
          eventType = "swiped-right";
        }
      }
    } else if (Math.abs(yDiff) > swipeThreshold && timeDiff < swipeTimeout) {
      if (yDiff > 0) {
        eventType = "swiped-up";
      } else {
        eventType = "swiped-down";
      }
    }

    if (eventType !== "") {
      var eventData = {
        dir: eventType.replace(/swiped-/, ""),
        touchType: (changedTouches[0] || {}).touchType || "direct",
        xStart: parseInt(xDown, 10),
        xEnd: parseInt((changedTouches[0] || {}).clientX || -1, 10),
        yStart: parseInt(yDown, 10),
        yEnd: parseInt((changedTouches[0] || {}).clientY || -1, 10),
      };

      // fire `swiped` event event on the element that started the swipe
      startEl.dispatchEvent(
        new CustomEvent("swiped", {
          bubbles: true,
          cancelable: true,
          detail: eventData,
        })
      );

      // fire `swiped-dir` event on the element that started the swipe
      startEl.dispatchEvent(
        new CustomEvent(eventType, {
          bubbles: true,
          cancelable: true,
          detail: eventData,
        })
      );
    }

    // reset values
    xDown = null;
    yDown = null;
    timeDown = null;
  }

  /**
   * Records current location on touchstart event
   * @param {object} e - browser event object
   * @returns {void}
   */
  function handleTouchStart(e) {
    // if the element has data-swipe-ignore="true" we stop listening for swipe events
    if (e.target.getAttribute("data-swipe-ignore") === "true") return;

    startEl = e.target;

    timeDown = Date.now();
    xDown = e.touches[0].clientX;
    yDown = e.touches[0].clientY;
    xDiff = 0;
    yDiff = 0;
  }

  /**
   * Records location diff in px on touchmove event
   * @param {object} e - browser event object
   * @returns {void}
   */
  function handleTouchMove(e) {
    if (!xDown || !yDown) return;

    var xUp = e.touches[0].clientX;
    var yUp = e.touches[0].clientY;

    xDiff = xDown - xUp;
    yDiff = yDown - yUp;
  }

  /**
   * Gets attribute off HTML element or nearest parent
   * @param {object} el - HTML element to retrieve attribute from
   * @param {string} attributeName - name of the attribute
   * @param {any} defaultValue - default value to return if no match found
   * @returns {any} attribute value or defaultValue
   */
  function getNearestAttribute(el, attributeName, defaultValue) {
    // walk up the dom tree looking for attributeName
    while (el && el !== document.documentElement) {
      var attributeValue = el.getAttribute(attributeName);

      if (attributeValue) {
        return attributeValue;
      }

      el = el.parentNode;
    }

    return defaultValue;
  }
})(window, document);

//Close library on screen touch
function mobileCloseLibrary() {
  const x = window.matchMedia("(max-width: 700px)");
  if (x.matches) {
    fadeOut();
  }
}

//////EVENT LISTENERS//////
libraryBtn.addEventListener("click", () => {
  if (library.classList.contains("fadeOutLeft")) {
    fadeIn();
  } else if (library.classList.contains("fadeInLeft")) {
    fadeOut();
  } else {
    fadeOut();
  }
});

//Play audio
playBtn.addEventListener("click", () => {
  if (playBtn.classList.contains("fa-play")) {
    play();
  } else if (playBtn.classList.contains("fa-pause")) {
    pause();
  }
});

//Skip forward
forwardBtn.addEventListener("click", nextSong);

//Skip backward
backwardBtn.addEventListener("click", prevSong);

//Library Click
librarySong.forEach((song) => {
  song.addEventListener("click", () => {
    //Click
    const clicked = song.lastElementChild.firstElementChild.innerText;
    const clickedSong = songsArr.filter((song) => clicked === song.name);
    currentSongData(clickedSong, 0);
    updateUI();
    play();
  });
});

//Time/song update
audio.addEventListener("timeupdate", updateProgress);

//click progress bar
songRange.addEventListener("click", setProgress);

//Song ends
audio.addEventListener("ended", nextSong);

//Space Bar Play/ Pause
document.body.onkeyup = function (e) {
  if (e.keyCode == 32) {
    if (playBtn.classList.contains("fa-play")) {
      play();
    } else if (playBtn.classList.contains("fa-pause")) {
      pause();
    }
  }
};

//Finger swipe to close library
document.addEventListener("swiped-left", () => {
  if (library.classList.contains("fadeInLeft")) {
    fadeOut();
  }
});

//Touch screen to close library
mainSection.addEventListener("click", mobileCloseLibrary);
