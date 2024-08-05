const audioWrapper = document.querySelector(".audioWrapper");
const controllerWrapper = document.querySelector(".controllers");
const State = ["Initial", "Record", "Download"]; //state of the audio
let stateIndex = 0; //used in switch case
let mediaRecorder, //used in recoding the audio
  chunks = [], //used in recoding the audio
  audioURL = ""; //used in recoding the audio

// mediaRecorder setup for audio
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices
    .getUserMedia({
      audio: true,
    })
    .then((stream) => {
      mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
        chunks = [];
        audioURL = window.URL.createObjectURL(blob);
        document.querySelector("audio").src = audioURL;
        const formData = new FormData();
        formData.append(
          "audio",
          blob,
          "recorded_audio.ogg" /*audio file that was recorded*/
        );
        fetch("" /*add server endpoint here*/, {
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => console.log(data))
          .catch((error) => {
            console.log(error);
          });
      };
    })
    .catch((error) => {
      console.log("Following error has occured : ", error);
    });
} else {
  stateIndex = ""; //restart the application
  application(stateIndex);
}

const clearDisplay = () => {
  //start fresh
  audioWrapper.textContent = "";
};

const clearControls = () => {
  //start fresh
  controllerWrapper.textContent = "";
};

const record = () => {
  //start recording
  stateIndex = 1; //first state of recoding refer back to switch statement
  mediaRecorder.start();
  application(stateIndex);
};

const stopRecording = () => {
  //stop recording
  stateIndex = 2; //second state refer back to switch statement
  mediaRecorder.stop();
  application(stateIndex);
};

const downloadAudio = () => {
  //download the audio if needed
  const downloadLink = document.createElement("a"); //create an a tag element
  downloadLink.href = audioURL; //link of the audio that was recorded
  downloadLink.setAttribute("download", "audio");
  downloadLink.click();
};

const addButton = (id, funString, text) => {
  //create a button
  const btn = document.createElement("button");
  btn.id = id;
  btn.setAttribute("onclick", funString);
  btn.textContent = text;
  controllerWrapper.append(btn);
};

const addMessage = (text) => {
  //status msg
  const msg = document.createElement("p");
  msg.textContent = text;
  audioWrapper.append(msg);
};

const addAudio = () => {
  //import the audio file to review and listen
  const audio = document.createElement("audio");
  audio.controls = true;
  audio.src = audioURL;
  audioWrapper.append(audio);
};

const application = (index) => {
  switch (State[index]) {
    case "Initial":
      clearDisplay();
      clearControls();
      addButton("record", "record()", "Start Recording");
      break;

    case "Record":
      clearDisplay();
      clearControls();

      addMessage("Recording...");
      addButton("stop", "stopRecording()", "Stop Recording");
      break;

    case "Download":
      clearControls();
      clearDisplay();

      addAudio();
      addButton("record", "record()", "Record Again");
      break;

    default:
      clearControls();
      clearDisplay();

      addMessage("Your browser does not support mediaDevices");
      break;
  }
};

application(stateIndex);
