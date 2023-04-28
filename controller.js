(function (window) {
    let wsUrl = "";
    let socket;
    let isConnected = false;
    let uptimeCallback;

    function parser(data) {
        switch (data.sensor) {
            case "uptime":
                if (uptimeCallback)
                    uptimeCallback(data);
                break;
        }
    }

    function pong(ws, callback) {
        ws.send('__PONG__');
        //  ws.send('/< %x9');
        // ws.send('test');
        console.log('sending ping')
        return setTimeout(function () {
            /// ---connection closed ///
            console.error('connection closed');
            callback();
        }, 6000);
    }

    function ping(tm) {
        clearTimeout(tm);
        console.log('clear interval');
    }

    const wsController = {
        connect: function (url, onconnect, ondisconnect) {
            isConnected = false;
            wsUrl = url
            socket = new WebSocket(wsUrl);

            socket.onopen = function (e) {
                let timerPong = setInterval(() => tm = pong(socket, () => {
                    clearInterval(timerPong);
                    ondisconnect();
                }), 5 * 1000);
                onconnect();
                isConnected = true;
                console.log("[open] Connection established");
                console.log("Sending to server");
                console.log(socket);
            };

            socket.onmessage = function (event) {

                try {
                    const msg = event.data;
                    //  console.log(msg)
                    if (msg === '__PING__') {
                        ping(tm);
                        return;
                    }
                    const json = JSON.parse(msg);
                    parser(json);
                } catch (error) {
                    console.error('unabel to parse response');
                }

            };

            socket.onclose = function (event) {
                console.error(event);
                isConnected = false;
                socket = null;
                ondisconnect();
                if (event.wasClean) {
                    console.error(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
                } else {
                    console.error('[close] Connection died');
                }
            };

            socket.onerror = function (error) {
                console.error(`[error] ${error.message}`);
                isConnected = false;
                socket = null;
                ondisconnect();
            };
        },
        getWsUrl: () => wsUrl,
        send: function (data) {
            if (isConnected) {
                // const speedObj = { "sensor": "speed", "time": Date.now() / 1000, "data": [x, y] };
                socket.send(JSON.stringify(data));
            }
        },
        uptimeListner: function (callback) {
            uptimeCallback = callback;
        },
        disconnect: () => {
            socket?.close(1000, 'disconnected by user');
        }
    }
    window.wsController = wsController;
})(window)


/* const controller1 = (function (elIdName) {

    var funCoordinates;
    var el = document.querySelector(`#${elIdName}`);
    el.classList.add('controlPad');

    var stick = document.createElement("div");
    stick.classList.add('stick');

    el.appendChild(stick);


    controllerHeight = el.offsetHeight;
    controllerWidth = el.offsetWidth;
    stickRadius = stick.offsetWidth / 2;
    var boundingRect = el.getBoundingClientRect();

    reCenterStick();
    console.log(`boundingRect ${boundingRect}`)
    //controls
    function map(x, in_min, in_max, out_min, out_max) {
        return Math.floor((x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min);
    }

    function setStickPosition(x, y) {
        stick.style.left = `${x - stickRadius}px`;
        stick.style.top = `${y - stickRadius}px`;
        console.log('set position')
    }

    function isStickInside(x, y, circleX, circleY, circleRadius) {

        var absX = Math.pow(Math.abs(x - circleX), 2.0)
        var absY = Math.pow(Math.abs(y - circleY), 2.0)
        return Math.sqrt(absX + absY) < circleRadius
    }

    function reCenterStick() {
        setStickPosition(controllerWidth / 2, controllerHeight / 2);
    }

    el.addEventListener('mousemove', (e) => {

        console.log(e);
        var rect = boundingRect;
        var x = e.clientX - rect.left; //x position within the element.
        var y = e.clientY - rect.top;  //y position within the element.
        //   console.log("Left? : " + x + " ; Top? : " + y + ".");

        const speed = y - controllerHeight / 2;
        const direction = x - controllerWidth / 2;
        //   console.log(`speed ${speed} direction ${ direction}`);
        let vSpeed = -1 * map(speed, 0, Math.floor(controllerHeight / 2), 0, 100);
        let vDirection = map(direction, 0, Math.floor(controllerWidth / 2), 0, 100);

        console.log(`v is ${vSpeed} vDirection is ${vDirection}`);

        if (isStickInside(x, y, controllerWidth / 2, controllerHeight / 2, (controllerWidth / 2 - stickRadius))) {
            setStickPosition(x, y);
        }
    });

    ontouchend = (e) => {
        setTimeout(() => {
            reCenterStick();
        }, 50);
    }
    el.addEventListener('mouseleave', ontouchend);

    onTouchMove = (e) => {
        var clientX, clientY = 0;
        if (e.changedTouches.length > 1) {
            const touchIndex = Array.from(e.changedTouches).findIndex(r => r.target === e.target);
            clientX = e.changedTouches[touchIndex].clientX;
            clientY = e.changedTouches[touchIndex].clientY;
        } else {
            clientX = e.changedTouches[0].clientX;
            clientY = e.changedTouches[0].clientY;
        }
        // const { clientX, clientY } = e.changedTouches[0];
        var x = clientX - boundingRect.left; //x position within the element.
        var y = clientY - boundingRect.top;  //y position within the element.
        // console.log("Left? : " + x + " ; Top? : " + y + ".");
        if (isStickInside(x, y, controllerWidth / 2, controllerHeight / 2, (controllerWidth / 2 - stickRadius))) {
            setStickPosition(x, y);
            funCoordinates({ x, y });
        }
    }
    el.addEventListener('touchmove', onTouchMove);
    el.addEventListener('touchend', ontouchend);


    return {
        getCoordinates: function (callback) {
            funCoordinates = callback;
        }
    }
})('controller1')
 */

const controllerMaker = (function (elIdName) {
    console.log(`init controller for ${elIdName}`)
    var funCoordinates;
    let touchStart = false;
    var el = document.querySelector(elIdName);
    el.classList.add('controlPad');

    var stick = document.createElement("div");
    stick.classList.add('stick');
    /* var node = document.createTextNode("hellow world");
    stick.appendChild(node); */

    el.appendChild(stick);

   const controllerHeight = el.offsetHeight;
   const controllerWidth = el.offsetWidth;
   const stickRadius = stick.offsetWidth / 2;
    var boundingRect = el.getBoundingClientRect();
    console.log(`boundingRect ${boundingRect}`)
    reCenterStick();
    //controls
    function map(x, in_min, in_max, out_min, out_max) {
        return Math.floor((x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min);
    }

   function debounce(func, timeout = 100) {
        let timer;
        return (...args) => {
            clearInterval(timer);
            timer = setTimeout(() => func.apply(this, args), timeout);
        }
    }

    function setStickPosition(x, y) {
        stick.style.left = `${x - stickRadius}px`;
        stick.style.top = `${y - stickRadius}px`;

        calculateCordinates(x, y);
        //  console.log('set position')
    }

    function isStickInside(x, y, circleX, circleY, circleRadius) {

        var absX = Math.pow(Math.abs(x - circleX), 2.0)
        var absY = Math.pow(Math.abs(y - circleY), 2.0)
        return Math.sqrt(absX + absY) < circleRadius
    }

    function reCenterStick() {
        setStickPosition(controllerWidth / 2, controllerHeight / 2);
    }

    function calculateCordinates(x, y) {
        const speed = y - controllerHeight / 2;
        const direction = x - controllerWidth / 2;
        //  console.log(`speed ${speed} direction ${ direction}`);
        let vSpeed = -1 * map(speed, 0, Math.floor(controllerHeight / 2) - stickRadius, 0, 100);
        let vDirection = map(direction, 0, Math.floor(controllerWidth / 2) - stickRadius, 0, 100);

        if (funCoordinates != null)
            funCoordinates({ vDirection, vSpeed }); // emit data to controller caller
    }

   /*  el.addEventListener('mousemove', (e) => {
       // e.preventDefault()

        // console.log(e);
        var rect = boundingRect;
        var x = e.clientX - rect.left; //x position within the element.
        var y = e.clientY - rect.top;  //y position within the element.
        if (isStickInside(x, y, controllerWidth / 2, controllerHeight / 2, (controllerWidth / 2 - stickRadius))) {
            setStickPosition(x, y);
        }
    });
 */
    
    

    onTouchMove = (e) => {
        e.preventDefault();
        e.stopPropagation();
        var clientX, clientY = 0;
        if (e.changedTouches.length > 1) {
            const touchIndex = Array.from(e.changedTouches).findIndex(r => r.target === e.target);
            clientX = e.changedTouches[touchIndex].clientX;
            clientY = e.changedTouches[touchIndex].clientY;
        } else {
            clientX = e.changedTouches[0].clientX;
            clientY = e.changedTouches[0].clientY;
        }
        // const { clientX, clientY } = e.changedTouches[0];
        var x = clientX - boundingRect.left; //x position within the element.
        var y = clientY - boundingRect.top;  //y position within the element.
        // console.log("Left? : " + x + " ; Top? : " + y + ".");
        if (isStickInside(x, y, controllerWidth / 2, controllerHeight / 2, (controllerWidth / 2 - stickRadius))) {
            setStickPosition(x, y);
        }
    }

    ontouchend = (e) => {
       /*  setTimeout(() => {
            reCenterStick();
        }, 50); */
        if (touchStart) {
            touchStart = false

            setTimeout(() => {
                reCenterStick();
            }, 50);
        } else {
            console.log('not touvhing element');
          //  return;
        }
    }

   // var touchDebounce = debounce(onTouchMove,0);
   // d = this.debounce((e) => this.onMouseMove(e), 10);
   el.ontouchmove = onTouchMove;
   // el.addEventListener('touchmove', touchDebounce);
//    el.addEventListener('mouseleave', ontouchend);
   el.addEventListener('touchend', ontouchend);
   
   el.addEventListener('touchstart', function (e) {
       e.preventDefault();
       touchStart = true;

   });

    return {
        getCoordinates: function (callback) {
            funCoordinates = callback;
        }
    }
});