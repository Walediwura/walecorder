'use strict'
let mediaRecorder;
let recordedBlobs;
const errorMsgElement = document.querySelector('.errormessage');
const recordedVideo = document.querySelector('.recorded');
const recordBtn = document.querySelector('.record');
const playBtn = document.querySelector('.play');
const downloadBtn = document.querySelector('.download');

document.querySelector('.start').addEventListener('click', async () =>{
    const hasEchoCancellation = document.querySelector('.echoCancellation').checked;

    const constraints = {
        audio:{
            echoCancellation:{exact: hasEchoCancellation}
        }, video:{
            width: 1280, height : 720
        }
    };
    console.log('Using media constraints:', constraints);

    await init(constraints);
});

function handleSuccess (stream){
    recordBtn.disabled = false;
    console.log('getUserMedia() got streamed:', stream)
    window.stream = stream;

    const gumVideo = document.querySelector('.gum');
    gumVideo.srcObject = stream;
};

async function init(constraints) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      handleSuccess(stream);
    } catch (e) {
      console.error('navigator.getUserMedia error:', e);
      errorMsgElement.innerHTML = `navigator.getUserMedia error:${e.toString()}`;
    }
  }


  recordBtn.addEventListener('click', () =>{
      if(recordBtn.textContent === 'Record'){
          startRecording();
      }else{
          stopRecording();
          recordBtn.textContent = 'Record';
          playBtn.disabled = false;
          downloadBtn.disabled = false;

      }
  })

  function stopRecording(){
      mediaRecorder.stop();
  }

  function startRecording() {
    recordedBlobs = [];
    let options = {mimeType: 'video/webm;codecs=vp9,opus'};
    try {
      mediaRecorder = new MediaRecorder(window.stream, options);
    } catch (e) {
      console.error('Exception while creating MediaRecorder:', e);
      errorMsgElement.innerHTML = `Exception while creating MediaRecorder: ${JSON.stringify(e)}`;
      return;
    }
  
    console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
    recordBtn.textContent = 'Stop Recording';
    playBtn.disabled = true;
    downloadBtn.disabled = true;
    mediaRecorder.onstop = (event) => {
      console.log('Recorder stopped: ', event);
      console.log('Recorded Blobs: ', recordedBlobs);
    };
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start();
    console.log('MediaRecorder started', mediaRecorder);
  }

  function handleDataAvailable(event) {
    console.log('handleDataAvailable', event);
    if (event.data && event.data.size > 0) {
      recordedBlobs.push(event.data);
    }
  }

  playBtn.addEventListener('click', ()=>{
      const superBuffer = new Blob(recordedBlobs, {type:'video/webm'})
      recordedVideo.src = null;
      recordedVideo.srcObject = null;

      recordedVideo.src = window.URL.createObjectURL(superBuffer)
      recordedVideo.controls = true;
      recordedVideo.play()
  })

  downloadBtn.addEventListener('click', () => {
    const blob = new Blob(recordedBlobs, {type: 'video/mp4'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'test.mp4';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  });
