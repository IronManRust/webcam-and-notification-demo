/* eslint-env browser */

document.addEventListener("DOMContentLoaded", function () {

    var input = document.getElementById("input");
    var video = document.getElementById("video");
    var canvas = document.getElementById("canvas");
    var output = document.getElementById("output");

    document.getElementById("action-enable").addEventListener("click", function () {
        navigator.getUserMedia = navigator.getUserMedia ||
                                 navigator.webkitGetUserMedia ||
                                 navigator.mozGetUserMedia ||
                                 navigator.msGetUserMedia ||
                                 navigator.oGetUserMedia;
        if (navigator.getUserMedia) {
            navigator.getUserMedia({
                "video": {
                    "height": {
                        "min": 240,
                        "ideal": 480,
                        "max": 1080
                    },
                    "width": {
                        "min": 320,
                        "ideal": 640,
                        "max": 1920
                    }
                },
                "audio": false
            }, function (stream) {
                if (video.srcObject === null) {
                    notifyCamera("Enabled");
                } else {
                    notifyCamera("Re-Enabled");
                }
                input.style.display = "none";
                video.style.display = "inline";
                video.pause();
                video.srcObject = stream;
                video.load();
                video.onloadedmetadata = function () {
                    video.play();
                };
            }, function (error) {
                if (error && error.name === "NotAllowedError") {
                    notifyCamera("Blocked");
                } else {
                    notifyCamera("Error - " + error.name);
                }
            });
        } else {
            notifyCamera("Not Supported");
        }
    });

    document.getElementById("action-disable").addEventListener("click", function () {
        if (video.srcObject !== null) {
            notifyCamera("Disabled");
            input.style.display = "inline";
            video.style.display = "none";
            video.pause();
            video.srcObject = null;
            video.load();
        } else {
            notifyCamera("Already Disabled");
        }
    });

    document.getElementById("action-capture").addEventListener("click", function () {
        if (video.srcObject !== null) {
            notifyImage("Captured");
            canvas.width = video.clientWidth;
            canvas.height = video.clientHeight;
            var context = canvas.getContext("2d");
            context.drawImage(video, 0, 0, video.clientWidth, video.clientHeight);
            output.setAttribute("src", canvas.toDataURL("image/png"));
        } else {
            notifyImage("Cleared");
            output.setAttribute("src", "placeholder.png");
        }
    });

    var notifyCamera = function (message) {
        notify("Camera: " + message, "notification-camera.png");
    };

    var notifyImage = function (message) {
        notify("Image: " + message, "notification-image.png");
    };

    var notify = function (message, icon) {
        var title = document.getElementsByTagName("Title")[0].text;
        var permissionGranted = "granted";
        var permissionDenied = "denied";
        if ("Notification" in window) {
            if (Notification.permission === permissionGranted) {
                // Notifications Allowed Previously
                displayPopup(title, message, icon);
            } else if (Notification.permission !== permissionDenied) {
                Notification.requestPermission(function (permission) {
                    if (permission === permissionGranted) {
                        // Notifications Allowed After Asking
                        displayPopup(title, message, icon);
                    } else {
                        // Notifications Denied After Asking
                        displayLog(title, message);
                    }
                });
            } else {
                // Notifications Denied Previously
                displayLog(title, message);
            }
        } else {
            // Notifications Not Supported
            displayLog(title, message);
        }
    };

    var displayPopup = function (title, message, icon) {
        var notification = new Notification(title, { "body": message, "icon": icon });
        window.setTimeout(function () {
            notification.close();
        }, 2000);
    };

    var displayLog = function (title, message) {
        window.console.log(title + " - " + message);
    };

}, false);