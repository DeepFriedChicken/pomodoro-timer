//sends a message to the extension service worker every 15 sec to keep it alive - I don't think they run on chrome:// pages
var intervalID = setInterval(renewServiceWorker, 10000);

function renewServiceWorker() {
    chrome.runtime.sendMessage(
        "renew message"
    )
}