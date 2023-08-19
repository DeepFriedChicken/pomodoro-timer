//SWAPPING MODES AND CYCLES
var timerMode = "Work" //can be "Work", "Break", or "Rest"
var timerCycle = 1; //goes from 1 to 4 then rest, then repeat

//RUNNING THE TIMER
var secLeft = 1500;//working 1500 break 300 rest 900

//If the popup asks for mode, cycle, or secLeft, send them in a reply
chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        if (message === "timer cycle") {
            sendResponse(
                timerCycle
            )
        }
        else if (message === "timer mode") {
            sendResponse(
                timerMode
            )
        }
        else if (message === "sec left") {
            sendResponse(
                secLeft
            )
        }
    }
)

var countdown = function() {
    secLeft--;

    //end the count when it reaches 0
    if (secLeft === 0) {
        endCount();
    }
}

var endCount = function() {
    //create a notification
    chrome.notifications.create(
        {
            type: "basic",
            iconUrl: "Media/icon-32.png",
            title: timerMode+" "+timerCycle+" finished",
            message: "Timer finished",
            priority: 1,
            silent:true
        }
    )

    //Creating an offsceen document and playing the sound there
    chrome.offscreen.createDocument(
        {
            url: chrome.runtime.getURL("audio.html"),
            reasons: ["AUDIO_PLAYBACK"],
            justification: "notification"
        }
    )
    var delayID = setInterval(closeDoc, 2000);
    function closeDoc() {
        chrome.offscreen.closeDocument()//closing it after we're done, since we can only have 1 open at a time
        clearInterval(delayID);//it has to be inside closeDoc to make sure it closes the interval after it has run
    }

    //changing to different cycles and modes when the count ends
    if (timerMode === "Rest") {//if you just finished resting
        timerCycle = 1;
        timerMode = "Work";
        secLeft = 1500;
    }
    else {//if you're in work/break
        if (timerMode === "Work") {//if you finished working
            timerMode = "Break";
            secLeft = 300;
        }
        else if (timerCycle === 4) {//if you're about to go to rest/got off the last break
            timerMode = "Rest";
            secLeft = 900;
        }
        else if (timerMode === "Break") {//if you just got off a middle break
            timerMode = "Work";
            timerCycle++;
            secLeft = 1500;
        }
    }
}

//Pausing and starting the clock
/*starts paused so you need to click a button to start
chrome won't let you play a sound if the user hasn't interacted with a page yet, so we have to make them click something on this html page*/
var paused = true;

var intervalID;

chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        if (message === "pause") {//if you get a message asking about the current pause state
            sendResponse(
                paused
            )
        }

        if (message === "stop clock") {
            clearInterval(intervalID);//stopping the clock
            paused = true;
        }
        else if (message === "start clock") {
            intervalID = setInterval(countdown, 1000);//starting the clock
            paused = false;
        }
    }
)
