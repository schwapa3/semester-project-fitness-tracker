var pushupCounter = 0;

function handlePushupDone (event) {

    let ev = JSON.parse(event.data);
    let evData = ev.data; 
    let evDeviceId = ev.coreid;
    let evTimestamp = Date.parse(ev.published_at);

    pushupCounter++;

    let data = {
        message: evData,
        counter: pushupCounter,
    }

    sendData("pushupDone", data, evDeviceId, evTimestamp );
}

function handleTrainingStarted (event) {
    let ev = JSON.parse(event.data);
    let evData = ev.data; 
    let evDeviceId = ev.coreid;
    let evTimestamp = Date.parse(ev.published_at); 

    let data = {
        message: evData,
        evTimestamp,
    }

    sendData("trainingStarted", data, evDeviceId, evTimestamp);
}

function handleTrainingEnded (event) {
    let ev = JSON.parse(event.data);
    let evData = ev.data; 
    let evDeviceId = ev.coreid;
    let evTimestamp = Date.parse(ev.published_at);
    pushupCounter = 0;

    let data = {
        message: evData,
        evTimestamp,
    }

    sendData("trainingEnded", data, evDeviceId, evTimestamp );
}

// send data to the clients.
// You don't have to change this function
function sendData(evName, evData, evDeviceId, evTimestamp ) {
    
    // map device id to device nr
    let nr = exports.deviceIds.indexOf(evDeviceId)

    // the message that we send to the client
    let data = {
        eventName: evName,
        eventData: evData,
        deviceNumber: nr,
        timestamp: evTimestamp,
    };

    // send the data to all connected clients
    exports.sse.send(data)
}

exports.deviceIds = [];
exports.sse = null;

// export your own functions here as well
exports.handlePushupDone = handlePushupDone;
exports.handleTrainingStarted = handleTrainingStarted;
exports.handleTrainingEnded = handleTrainingEnded;