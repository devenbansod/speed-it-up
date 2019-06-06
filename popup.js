function init() {
    var slider = document.getElementById('playbackSpeed');
    var output = document.getElementById('currentSpeed');
    var resetButton = document.getElementById('resetPlaybackSpeed');

    getFromStorage(null, function (savedData) {
        lastSetSpeed = savedData.lastSetSpeed || 1;

        setValueInner(lastSetSpeed);
    });

    // attach the on-change and on-event handlers
    slider.oninput = setValue;
    resetButton.onclick = onResetClick;

    function setValue() {
        setValueInner(this.value);
    }

    function setValueInner(val) {
        output.innerHTML = val;
        slider.value = val;

        chrome.tabs.executeScript(null, {
            code: getUpdatePlaybackRateFn(val)
        });

        setInStorage('lastSetSpeed', val);
    }

    function onResetClick() {
        setValueInner(1);
    }

    function getFromStorage(key, callback) {
        chrome.storage.sync.get(key, function(data) {
            callback(data);
        });
    }

    function setInStorage(key, data) {
        // Setting
        chrome.storage.sync.set(JSON.parse(`{"${key}": ${data}}`), function() {
            if (chrome.runtime.lastError) {
                console.error(
                    'Error setting ' + key + ' to ' + JSON.stringify(data) + ': ' + chrome.runtime.lastError.message
                );
            }
        });
    }
}

function getUpdatePlaybackRateFn(val) {
    return `document.querySelectorAll('video').forEach((videoElement) => {
        videoElement.playbackRate = ${val};
    });`;
}

document.addEventListener('DOMContentLoaded', init);
