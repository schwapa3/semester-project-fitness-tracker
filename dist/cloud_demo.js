var rootUrl = window.location.origin; // get the root URL, e.g. https://example.herokuapp.com

var app = new Vue({
    el: "#app",
    data: {
        gender: "unknown",
        weight: "unknown",
        age: "unknown",
        trainingStatus: "inactive",
        pushUpCounter: 0,
        burnedCalories: "unknown",
        trainingStartTime: "unknown",
        trainingEndTime: "unknown",
    },
    // This function is executed once when the page is loaded.
    mounted: function () {
        this.initSse();
    },
    methods: {
        // Initialise the Event Stream (Server Sent Events)
        // You don't have to change this function
        initSse: function () {
            if (typeof (EventSource) !== "undefined") {
                var url = rootUrl + "/api/events";
                var source = new EventSource(url);
                source.onmessage = (event) => {
                    this.updateVariables(JSON.parse(event.data));
                };
            } else {
                this.message = "Your browser does not support server-sent events.";
            }
        },
        // react on events: update the variables to be displayed
        updateVariables(ev) {
            // Event "buttonStateChanged"
            if (ev.eventName === "pushupDone") {
                this.pushUpCounter = ev.eventData.counter;
            }
            // Event "blinkingStateChanged"
            else if (ev.eventName === "trainingStarted") {
               this.trainingStatus = "active";
               this.trainingStartTime = ev.eventData.evTimestamp;
            }else if (ev.eventName === "trainingEnded") {
                this.trainingStatus = "inactive";
                this.trainingEndTime = ev.eventData.evTimestamp;
            }
        },

        remotePushup: function (nr) {
            axios.post(rootUrl + "/api/device/" + nr + "/function/remotePushup")
            .then(response => {
                // Handle the response from the server
                console.log(response.data); // we could to something meaningful with the return value here ... 
            })
            .catch(error => {
                alert("Could not call the function 'remoteBump' of device number " + nr + ".\n\n" + error)
            })          
            
        },
        // call the function "blinkRed" in your backend
        getBurnedCalories: function (nr) {
            axios.get(rootUrl + "/api/device/" + nr + "/variable/heartBeatCounter")
                .then(response => {
                    var heartBeatCounter = response.data.result;
                    if(this.gender === "unknown" || this.age === "unknown" || this.weight === "unknown") {
                        alert("Please register User Information first!")
                    }else if(this.trainingStartTime === "unknown") {
                        this.burnedCalories = 0;
                    }else {
                        if(this.trainingStatus === "active"){
                            alert("The Training is not over yet!")
                        }else{
                            var time = (this.trainingEndTime - this.trainingStartTime);
                            var bpm = heartBeatCounter / (time/60000);
                            if(this.gender === "male") {
                                this.burnedCalories = ((-55.0969 + (0.6309 * bpm) + (0.1988 * this.weight) + (0.2017 * this.age))/4.184) * 60 * (time/3600000);
                            }else if(this.gender === "female"){
                                this.burnedCalories = ((-20.4022 + (0.4472 * bpm) - (0.1263 * this.weight) + (0.074 * this.age))/4.184) * 60 * (time/3600000);
                            }else{
                                alert("No valid gender was found!")
                            }
                        }
                    }
                    // Handle the response from the server
                    console.log(response.data); // we could to something meaningful with the return value here ... 
                })
                .catch(error => {
                    alert("Could not call the function 'getBurnedCalories' of device number " + nr + ".\n\n" + error)
                })
        },
        getUserInformation: function() {
            this.gender = document.getElementById("genders").value;
            this.weight = document.getElementById("weight").value;
            this.age = document.getElementById("age").value;
        }
    }
})
