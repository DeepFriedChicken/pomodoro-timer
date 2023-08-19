//Every time the extension is reopened, the timerMode, timerCycle, secLeft, and paused are reset
//we need to store these var and run the clock in the service worker

//all we need in this page is receive that information and change the html

//SETTING THE DEFAULT POPUP TO THIS PAGE WHEN ITS OPEN, SO IT GOES BACK TO THIS PAGE WHEN ITS REOPENED
chrome.action.setPopup (
    {
        popup: "clock.html"
    }
)

//CONVERSION FUNCTIONS
var secToMin = function(seconds) {//convenience method for converting between (sec) format and (min:sec) format
    if (Math.floor(seconds/60) < 10) {//makes the clock 0X:XX instead of X:XX for single digit minutes
        if (seconds%60 < 10) {//makes the clock XX:0X instead of XX:X for single digit seconds
            return "0"+Math.floor(seconds/60)+":0"+seconds%60;
        }
        else {
            return "0"+Math.floor(seconds/60)+":"+seconds%60;
        }
    }
    else {
        if (seconds%60 < 10) {
            return Math.floor(seconds/60)+":0"+seconds%60;
        }
        else {
            return Math.floor(seconds/60)+":"+seconds%60;
        }
    }
}
var minToSec = function(minutesSeconds) {//convert form (min:sec) to (sec)
    var colonIndex = minutesSeconds.indexOf(":");

    var minuteString = minutesSeconds.substring(0,colonIndex);
    var minutes = parseInt(minuteString)

    var secString = minutesSeconds.substring(colonIndex+1);
    var seconds = parseInt(secString);

    return 60*minutes + seconds;
}

//SWAPPING MODES AND CYCLES
//setting up the popup every time you open it
var timerCycle;
var timerMode;
var secLeft;

//getting the title and timer html elements
var titleElement = document.getElementById("title");
var timerElement = document.getElementById("timer");

//sending messages to get the values from the service worker when you open the popup
chrome.runtime.sendMessage(
    "timer cycle",
    function(response) {
        timerCycle = response;
    }
)
chrome.runtime.sendMessage(
    "timer mode",
    function(response) {
        timerMode = response;
    }
)
chrome.runtime.sendMessage(
    "sec left",
    function(response) {
        secLeft = response;

        //updating the actual html in this message because it's the last message being sent
        //that means that the popup has retrieved all the values from the service worker at this point, so there won't be a NaN problem
        titleElement.innerHTML = timerMode+" Time "+timerCycle;
        timerElement.innerHTML = secToMin(secLeft);
    }
)

//RUNNING THE TIMER
var intervalID = setInterval(checkTime, 1000);
/*check for new time changes every second - this means that the timer will only update every second on popup side, so it may not perfectly match the timer
on the service worker side, but it's close enough for this program*/

function checkTime() {//sending messages to the service worker every second on popup side to check for changes in secLeft, cycle, or mode
    chrome.runtime.sendMessage(
        "timer cycle",
        function(response) {
            timerCycle = response;
        }
    )
    chrome.runtime.sendMessage(
        "timer mode",
        function(response) {
            timerMode = response;
        }
    )
    chrome.runtime.sendMessage(
        "sec left",
        function(response) {
            secLeft = response;

            //updating the actual html in this message because it's the last message being sent
            //that means that the popup has retrieved all the values from the service worker at this point, so there won't be a NaN problem
            titleElement.innerHTML = timerMode+" Time "+timerCycle;
            timerElement.innerHTML = secToMin(secLeft);
        }
    )
}

//Pausing and starting the clock
/*commented out so it doesn't auto-start the timer; you need to click a button to start
chrome won't let you play a sound if the user hasn't interacted with a page yet, so we have to make them click something on this html page*/
var pauseElement = document.getElementById("pause");

chrome.runtime.sendMessage(//ask about current pause state when the popup is initialized
    "pause",
    function(response) {
        if (response) {
            pauseElement.innerHTML = "Start";
        }
        else {
            pauseElement.innerHTML = "Pause";
        }
    }
)

pauseElement.onclick = function() {//onclick in the script file instead of html bcs chrome won't allow it in extensions
    chrome.runtime.sendMessage(//ask the service worker about the current pause state
        "pause",
        //the response is the current pause state
        function(response) {
            if (response) {//if it's currently paused
                //send a message to the service worker to start the clock
                chrome.runtime.sendMessage(
                    "start clock",
                )
                //change the button html to pause
                pauseElement.innerHTML = "Pause";
            }
            else {//if it's current unpaused
                //send a message to the service worker to stop the clock
                chrome.runtime.sendMessage(
                    "stop clock",
                )
                //change the button html to start
                pauseElement.innerHTML = "Start";
            }
        }
    )
}