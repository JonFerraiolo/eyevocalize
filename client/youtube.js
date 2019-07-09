
import { showPopup, hidePopup } from './popup.js';
import { addToHistory } from './History.js';
import { TextEntryRowSetText } from './TextEntryRow.js';

// from https://developers.google.com/youtube/iframe_api_reference
let youtubeScriptElement = document.createElement('script');
youtubeScriptElement.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(youtubeScriptElement);
let youtubeAPIReady = false;
window.onYouTubeIframeAPIReady = function() {
  youtubeAPIReady = true;
};

let youtubePlayer;

function invokeYoutubePlayAPI(params) {
  let { playerDivId, width, height, videoId, startAt, endAt, doneCallback } = params;
  if (!youtubeAPIReady) {
    console.error('YouTube API not ready when attempting to play video: '+videoId);
    return;
  }
  let done = false;
  youtubePlayer = new YT.Player(playerDivId, {
    height: height.toString(),
    width: width.toString(),
    videoId,
    events: { onReady, onStateChange },
  });
  function onReady(event) {
    if (typeof startAt == 'number' && startAt > 0) {
      youtubePlayer.seekTo(startAt, true);
    } else {
      startAt = 0;
    }
    if (typeof endAt == 'number' && endAt > startAt) {
      setTimeout(() => {
        youtubePlayer.stopVideo();
        done = true;
        doneCallback();
      }, (endAt-startAt)*1000);
    }
    event.target.playVideo();
  }
  function onStateChange(event) {
    if (event.data == YT.PlayerState.ENDED && !done) {
      done = true;
      doneCallback();
    }
  }
}

// play YouTube video from a videoId
export function playYoutubeVideo(phrase) {
  let { videoId, startAt, endAt } = phrase;
  let cleanupAlreadyDone = false;
	if (videoId && videoId.length > 0) {
    let params = {
      content: `<div id="youtubePlayerDiv"></div>`,
      refNode: document.querySelector('.main'),
      hideCallback: () => {
        if (!cleanupAlreadyDone) {
          stopYoutubeVideo();
          popupRootElement.innerHTML = '';
          cleanupAlreadyDone = true;
        }
      }
    };
    let popupRootElement = showPopup(params);
    let youtubeParams = {
      playerDivId: 'youtubePlayerDiv',
      width: 300,
      height: 300,
      videoId,
      startAt,
      endAt,
      doneCallback: function() {
        popupRootElement.innerHTML = '';
        cleanupAlreadyDone = true;
        hidePopup();
      }
    };
    invokeYoutubePlayAPI(youtubeParams);
		TextEntryRowSetText('');
		addToHistory(Object.assign({}, phrase));
	}
}

export function stopYoutubeVideo(params) {
  if (youtubePlayer) {
    youtubePlayer.stopVideo();
  }
}
