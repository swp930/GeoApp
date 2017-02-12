/*
 * Copyright 2016 Sony Corporation
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions, and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE REGENTS AND CONTRIBUTORS ``AS IS'' AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
 * OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
 * SUCH DAMAGE.
 */

var currentAddress;
var currentLocality;
var isPositionAnnounced;
var synthesis = da.SpeechSynthesis.getInstance();
var speechText;
var locations = [{locations:36.9914,longitude:122.0609},
{locations:34.0689,latitude:118.4452},{locations:5,longitude:6},
{locations:7,longitude:8},{locations:9,longitude:10}];

/**
 * The callback to prepare a segment for play.
 * @param  {string} trigger The trigger type of a segment.
 * @param  {object} args    The input arguments.
 */
da.segment.onpreprocess = function (trigger, args) {
    speechText = "";
    da.startSegment(null, null);
    
    //Check the trigger type.
    if (trigger === 'launchRule' || trigger === 'voice') {
      // Fethch the segment configuration options from the server.
        getSegmentConfig().then(function (result) {
            isPositionAnnounced = result.isPositionAnnounced;
            if (isPositionAnnounced) {
                // Get current address and locality data.
                getCurrentLocationData().then(function (address, locality) {
                    if (address !== 'error') {
                        currentAddress = address;
                        currentLocality = locality;
                        // Start the segment with the defult values.
                        da.startSegment(null, null);
                    } else {
                        da.cancelSegment();
                    }
                });
            } else {
                da.startSegment(null, null);
            }
        });
    } else if (trigger === 'worker') {
        // The args already holds the current locality data that is passed from requestStartSegment method in the worker.
        if (args === null) {
            da.cancelSegment();
            return;
        }
        currentLocality = args;
        da.startSegment(null, null);
    }
    
};

/**
 * The callback to start a segment.
 * @param  {string} trigger The trigger type of a segment.
 * @param  {object} args    The input arguments.
 */
da.segment.onstart = function (trigger, args) {
    if (da.getApiLevel === undefined) {
        // API_LEVEL = 1;
        synthesis.speak('This device software is not available for speech to text function.', {
            onstart: function () {
                console.log('[SpeechToText] speak start');
            },
            onend: function () {
                da.stopSegment();
            },
            onerror: function (error) {
                da.stopSegment();
            }
        });
    } else {
        // API_LEVEL = 2 or later;

    }
    
    //console.log('onstart', {trigger: trigger, args: args});

    var currentTime = new Date();
    var storage = new da.Storage();
    var speakData = {
        currentTime: convertTimeFormat(currentTime.getHours(), currentTime.getMinutes()),
        currentSec: currentTime.getSeconds(),
        address: currentAddress
    };
    var stringKey;

    if (trigger === 'worker') {
        // Speak the current location when the location has been changed.
        speak(da.getString('localityChange', {locality: currentLocality})).then(function () {
            da.stopSegment();
        });
        return;
    }

    if (args === 'start' || trigger === 'voice') {
        // Store the current time and location in local storage.
        storage.clear();
        storage.setItem('startTime', String(currentTime.getTime()));

        // Update the stored location in the local storage.
        if (isPositionAnnounced) {
            storage.setItem('locality', currentLocality);
            // Prepare the string to generate TTS speech synthesis.
            stringKey = 'startTimerWithPosition';
        } else {
            // Prepare the string to generate TTS speech synthesis.
            stringKey = 'startTimer';
        }
        // Speak the text.
        //var speechToText = new da.SpeechToText();
        //speechToText.startSpeechToText(callbackobject);
        speechToText = "where am i";
        if(args == "where am i")
        {
          /*synthesis.speak("You are at "+currentAddress, {
          onstart: function () {
              console.log('[SpeechToText] speak start');
          },
          onend: function () {
              console.log('[SpeechToText] speak onend');
              da.stopSegment();
          },
          onerror: function (error) {
              console.log('[SpeechToText] speak cancel: ' + error.message);
              da.stopSegment();
          }
      });*/
          speak("You are at "+currentAddress);
        }
        else if(args =="date")
        {
          speak("February 12");
        }
        else if(args =="time")
        {
          speak(speakData.currentTime+ "");
        }
        else
        {
          speak("Goodbye");
        }
        
        //speak(da.getString(stringKey, speakData)).then(function () {
            //da.stopSegment();
        //});
    } else if (args === 'count') {
        // Get start time from local stroge.
        var startTime = storage.getItem('startTime');
        if (!startTime) {
            speak(da.getString('noStartTimer')).then(function () {
                da.stopSegment();
            });
        } else {
            // Calculate elapsed time from the start time.
            var elapsedTime = currentTime.getTime() - startTime;
            speakData.elapsedMinutes = Math.floor(elapsedTime / 1000 / 60);
            speakData.elapsedSeconds = Math.ceil(elapsedTime / 1000 % 60);

            if (isPositionAnnounced) {
                // Speak the current time, the address and the elapsed time　from the launch.
                stringKey = 'countTimerWithPosition';
            } else {
                // Speak the current time and the elapsed time from the launch.
                stringKey = 'countTimer';
            }

            speak(da.getString(stringKey, speakData)).then(function () {
                da.stopSegment();
            });
        }
    } else if (args === 'stop') {
        storage.clear();
        speak(da.getString('stopTimer')).then(function () {
            da.stopSegment();
        });
    } else {
        da.stopSegment();
    }
    
};
da.segment.onstop = function () {
    console.log('onstop() start');
};
da.segment.onpause = function () {
    console.log('onpause() start');
};
da.segment.onresume = function () {
    var synthesis = da.SpeechSynthesis.getInstance();
    if(speechText == "where am i")
    {
      speechText = "Potatoes";
    }
    synthesis.speak('The result is ' + speechText, {
        onstart: function () {
            console.log('[SpeechToText] speak start');
        },
        onend: function () {
            console.log('[SpeechToText] speak onend');
            da.stopSegment();
        },
        onerror: function (error) {
            console.log('[SpeechToText] speak cancel: ' + error.message);
            da.stopSegment();
        }
    });

    if (speechText != "") {
        var entry = {
            domain: "Input Speech Text",
            extension: {},
            title: speechText,
            url: "https://translate.google.co.jp/?hl=ja#en/ja/" + speechText,
            imageUrl: "http://www.sony.net/SonyInfo/News/Press/201603/16-025E/img01.gif",
            date: new Date().toISOString()
        };
        da.addTimeline({entries: [entry]});
    }
    console.log('onresume() start');
};
da.segment.oncommand = function (commandObject) {
    console.log('oncommand() start');
    return true;
};

var callbackobject = {
    onsuccess: function (results) {
        console.log('[SpeechToText] : SpeechToText process has finished successfully');
        console.log('[SpeechToText] : Results = ' + results);

        var strResults = results.join(" ");
        speechText = strResults;
    },
    onerror: function (error) {
        console.log('[SpeechToText] : SpeechToText error message = ' + error.message)
        console.log('[SpeechToText] : SpeechToText error code = ' + error.code)

        var synthesis = da.SpeechSynthesis.getInstance();
        synthesis.speak('The speech to text API could not recognize what you said. Reason is ' + error.message, {
            onstart: function () {
                console.log('[SpeechToText] error message speak start');
            },
            onend: function () {
                console.log('[SpeechToText] error message speak onend');
                da.stopSegment();
            },
            onerror: function (error) {
                console.log('[SpeechToText] error message speak cancel: ' + error.message);
                da.stopSegment();
            }
        });
    }

};