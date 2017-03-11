/*jslint browser: true*/
/*global Promise, chrome*/
"use strict";

chrome.extension.sendMessage({}, function () {
    if (window.location.hostname !== 'www.bidrl.com') {
        return;
    }

    var localConfig = null,
        currUrl = document.location.href,

        getLocalConfig = function () {
            return new Promise(function (resolve) {
              /*
                chrome.storage.sync.get(["chamberCount", "override"], function (data) {
                    localConfig = data;
                    resolve();
                });
              */
            });
        },

        rickRoll = function () {
            //document.getElementsByTagName("video")[0].setAttribute("src", serverConfig.rickRollURL);
            console.log('test');
        },

        fireTrigger = function () {
            console.log('hi!');
            return;
            currUrl = document.location.href;
            // check to see if this page contains a video
            if (document.getElementsByTagName("video").length > 0) {
                // spin the chamber...
                var chamberCount = localConfig.override ? localConfig.chamberCount : serverConfig.chamberCount,
                    pinHit = Math.floor(Math.random() * chamberCount),
                    bulletChamber = Math.floor(Math.random() * chamberCount);

                console.log("Chamber count (server): " + serverConfig.chamberCount);
                console.log("Chamber count (local): " + localConfig.chamberCount);
                console.log("Chamber count: " + chamberCount);
                console.log("Bullet in chamber: " + bulletChamber);
                console.log("Fired a " + pinHit);
                // fire!
                if (pinHit !== bulletChamber) {
                    // click...
                    console.log("Click...");
                } else {
                    // BANG!
                    console.log("BANG!");
                    setTimeout(rickRoll, rollDelay);
                }
            }
        },

        watchUrl = function () {
            if (currUrl !== document.location.href) {
                fireTrigger();
            }
        },

		retrieveWindowVariables = function (variables) {
			var ret = {};

			var scriptContent = "";
			for (var i = 0; i < variables.length; i++) {
				var currVariable = variables[i];
				console.log(currVariable)
				// scriptContent += "if (typeof " + currVariable + " !== 'undefined') document.querySelector('body').setAttribute('tmp_" + currVariable + "', JSON.stringify(" + currVariable + ", function replacer(key, value) { return '1' }));\n"
				scriptContent = "var newItem = jQuery.extend({}, item); delete newItem.documents; delete newItem.channel; document.querySelector('body').setAttribute('tmp_" + currVariable + "', JSON.stringify(newItem));\n";
			}

			var script = document.createElement('script');
			script.id = 'tmpScript';
			script.appendChild(document.createTextNode(scriptContent));
			(document.body || document.head || document.documentElement).appendChild(script);

			for (var i = 0; i < variables.length; i++) {
				var currVariable = variables[i];
				ret[currVariable] = document.querySelector("body").getAttribute("tmp_" + currVariable);
				// document.querySelector("body").removeAttr("tmp_" + currVariable);
			}

			// $("#tmpScript").remove();

			return ret;
		},


        readyStateCheckInterval = setInterval(function () {
            console.log('interval!');
            if (document.readyState === "complete") {
                clearInterval(readyStateCheckInterval);
                if (document.location.href.indexOf('/item/') > 0) {
                  console.log('item page!')
                  var item = JSON.parse(retrieveWindowVariables(['item']).item);
				  console.log('item!', item)
                  console.log('elem', elem)
                  var elem = '<tr class="imp"><th>Proxy Bid:</th><td>$' + item.proxy_bid + '</td></tr>';
                  document.querySelector('#item-detail > div > table > tbody:nth-child(2) > tr:nth-child(2)').insertAdjacentHTML('beforeBegin', elem)
				  document.querySelector('#item-detail > div > table > tbody:nth-child(2) > tr:nth-child(7) > td > span').innerHTML += ' (' + item.high_bidder_email + ')'
				  elem = '<input type="button" onClick="javascript:document.location.href = \'https://bidbotr.herokuapp.com/add/?url=\' + document.location.href" value="Bid on bidbotr">'
				  document.querySelector('#item-detail > div > div > form > input[type="submit"]:nth-child(7)').insertAdjacentHTML('beforeEnd', elem)
				  document.querySelector('#item-detail > h2 > span').insertAdjacentHTML('beforeEnd', '&nbsp;<a style="font-size: 0.45em" href="https://www.amazon.com/s/?url=search-alias%3Daps&field-keywords=' + item.title + '">Search Amazon</a>')
                }
                // Promise.all([getLocalConfig()]).then(fireTrigger);
            }
        }, 10);
});
