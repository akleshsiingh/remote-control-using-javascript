document.addEventListener("DOMContentLoaded", () => {
  // alert("dom loaded")
  const wsController = window.wsController;

  const inputUrl = document.querySelector("#inputUrl");
  const btnConnect = document.querySelector(".btn-connect");
  const throttle = document.querySelector(".throttle input");
  const uptime = document.querySelector(".uptime");
  const xCordinate = document.querySelector("#xCordinate");
  const yCordinate = document.querySelector("#yCordinate");

  const lightSwitch = document.querySelector(".switch input");

  const host = location.hostname;
  if (host == "127.0.0.1") {
    inputUrl.value = `ws://192.168.0.100:81`;
  } else {
    inputUrl.value = `ws://${host}:81`;
  }

  var isConnected = false;

  onconnect = () => {
    console.log("Connected");
    btnConnect.innerText = "disconnect";
    isConnected = true;
  };

  ondisconnect = () => {
    console.log("disconnect");
    btnConnect.innerText = "connect";
    isConnected = false;
  };

  wsController.uptimeListner(({ time }) => {
    const timeInSeconds = Math.floor(time / 1000);
    // console.log(timeInSeconds);
    const min = Math.floor((timeInSeconds / 60) % 60);
    const sec = timeInSeconds % 60;
    uptime.innerText = `${("0" + min).slice(-2)} : ${("0" + sec).slice(-2)}`;
  });

  btnConnect.addEventListener("click", () => {
    if (isConnected) {
      ondisconnect();
      wsController.disconnect();
      return;
    }
    const url = inputUrl.value;
    console.log("enteredurl", url, inputUrl);
    btnConnect.innerText = "connecting";
    wsController.connect(url, onconnect, ondisconnect);
  });

  console.log("throttle", throttle);
  throttle.addEventListener("input", (e) => {
    var value = Number(e.target.value);
    console.log(value);

    wsController.send({
      sensor: "servo",
      value: value,
      time: Date.now() / 1000,
      data: [0, 0],
    });
  });
  var direction = 0,
    speed = 0,
    lightStatus = 0;

  lightSwitch.addEventListener("change", (e) => {
    // console.log(e);
    console.log(lightSwitch.checked);
    lightStatus = lightSwitch.checked === true ? 1 : 0;

    sendtoReciver();
  });

  // console.log(controller1.getCoordinates((data) => console.log(data)));

  controllerMaker("#controller1").getCoordinates((data) => {
    console.log(data);
    speed = data.vSpeed;
    yCordinate.innerText = speed;

    sendtoReciver();
  });

  const controllerRight = controllerMaker("#controller2");
  controllerRight.getCoordinates((data) => {
    console.log(data);
    direction = data.vDirection;
    xCordinate.innerText = direction;
    sendtoReciver();
  });

  function sendtoReciver() {
    if (isConnected) {
      const speedObj = {
        sensor: "speed",
        time: Date.now() / 1000,
        data: [speed, direction, lightStatus],
      };
      wsController.send(speedObj);
    } else {
      //console.error('server not connected');
    }
  }

  /* 
   controller.connect("someurl");
   console.log(controller.getWsUrl()) 
   */
});
