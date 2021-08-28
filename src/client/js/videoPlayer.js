import fetch from "node-fetch";

const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const backBtn = document.getElementById("back");
const forwardBtn = document.getElementById("forward");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const volumeRange = document.getElementById("volume");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenIcon = fullScreenBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");

let controlsTimeout = null;
let controlsMovementTimeout = null;
let volumeValue = 0.5;
video.volume = volumeValue;

const handlePlayClick = (e) => {
    if(video.paused){
        video.play();
    } else {
        video.pause();
    }
    playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
};

const handleBackClick = () => {
    video.currentTime = video.currentTime - 5;
};

const handleForwardClick = () => {
    video.currentTime = video.currentTime + 5;
};

const handleMute = (e) => {
    if(video.muted) {
        video.muted = false;
    } else {
        video.muted = true;
    }
    muteBtnIcon.classList = video.muted ? "fas fa-volume-mute" : "fas fa-volume-up";
    volumeRange.value = video.muted ? 0 : volumeValue;
};

const handleVolumeChange = (event) => {
    const { target: { value } } = event;
    if(video.muted) {
        video.muted = false;
    }
    volumeValue = value;
    video.volume = value;
    muteBtnIcon.classList = volumeValue == 0 ? "fas fa-volume-mute" : "fas fa-volume-up";
};

const formatTime = (seconds) => new Date(seconds * 1000).toISOString().substr(11, 8);

const handleLoadedMetadata = () => {
    totalTime.innerText = formatTime(Math.floor(video.duration));
    timeline.max = Math.floor(video.duration);
};

const handleTimeUpdate = () => {
    currentTime.innerText = formatTime(Math.floor(video.currentTime));
    timeline.value = Math.floor(video.currentTime);
};

const handleTimelineChange = (event) => {
    const { target: {value}, } = event;
    video.currentTime = value;
};

const handleFullscreen = () => {
    const fullscreen = document.fullscreenElement;
    if(fullscreen) {
        document.exitFullscreen();
        fullScreenIcon.classList = "fas fa-expand";
        videoControls.classList.remove("fullScreen");
    } else {
        videoContainer.requestFullscreen();
        fullScreenIcon.classList = "fas fa-compress";
        videoControls.classList.add("fullScreen");
    }
};

const handleFullscreenChange = () => {
    const fullscreen = document.fullscreenElement;
    if (!fullscreen) {
        fullScreenIcon.classList = "fas fa-expend";
        videoControls.classList.remove("fullScreen");
    }
}

const hideControls = () => videoControls.classList.remove("showing");

const handleMouseMove = () => {
    if(controlsTimeout) {
        clearTimeout(controlsTimeout);
        controlsTimeout = null;
    };
    if(controlsMovementTimeout) {
        clearTimeout(controlsMovementTimeout);
        controlsMovementTimeout = null;
    };
    videoControls.classList.add("showing");
    controlsMovementTimeout = setTimeout(() => hideControls, 2000);
};

const handleMouseLeave = () => {
    videoControls.classList.remove("showing");
};

const handleKeydown = (event) => {
    if (event.code == "KeyF") {
        handleFullscreen();
    } else if (event.code == "ArrowLeft") {
        event.preventDefault();
        handleBackClick();
    } else if (event.code == "ArrowRight") {
        event.preventDefault();
        handleForwardClick();
    } else if (event.comde == "KeyM") {
        handleMute();
    }
}

const handleEnded = () => {
    const { id } = videoContainer.dataset;
    fetch(`/api/videos/${id}/view`, {
        method: "POST",
    });
};

playBtn.addEventListener("click", handlePlayClick);
backBtn.addEventListener("click", handleBackClick);
forwardBtn.addEventListener("click", handleForwardClick);
muteBtn.addEventListener("click", handleMute);
volumeRange.addEventListener("input", handleVolumeChange);
video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("click", handlePlayClick);
video.addEventListener("ended", handleEnded);
videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
timeline.addEventListener("input", handleTimelineChange);
fullScreenBtn.addEventListener("click", handleFullscreen);
document.addEventListener("fullscreenChange", handleFullscreenChange);
window.addEventListener("keydown", handleKeydown);
