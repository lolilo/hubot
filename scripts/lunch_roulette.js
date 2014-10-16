// Description:
//   lunch roulette for grouping employees
//
// Dependencies:
//   None
//
// Configuration:
//   None
//
// Commands:
//   hubot add   - returns whether is it weekend or not
//   hubot is it holiday ?  - returns whether is it holiday or not

var timeFormat = /^([0-9]{2})\:([0-9]{2})$/;

module.exports = function(robot) {

	robot.respond(/(.*) wants lunch at ([0-9]{2})\:([0-9]{2})/i, function(msg){
		var name = msg.match[1];
		var time = msg.match[2] + ":" + msg.match[3];
		msg.reply("Okay, " + name + "! I will sign you up for " + time + ".");
	});



// 	robot.respond(/open the (.*) doors/i, function(msg) {
//   var doorType;
//   doorType = msg.match[1];
//   if (doorType === "pod bay") {
//     return msg.reply("I'm afraid I can't let you do that.");
//   } else {
//     return msg.reply("Opening " + doorType + " doors");
//   }
// });

}

// global variable in which we can store the subscribed people
var store = {};

// function which has to be replaced if we merge it into hubot
function reply(msg) {
	console.log(msg);
}

// function which has to be replaced if we merge it into hubot
function throwError(location,msg) {
	reply('ERROR in {0}, message: {1}'.format(location, msg));
}

// the main function which parses the input string,
// and stores, updates, deletes the store etc.. 
// @line: USER;HH:MM OR USER@cancel

// checks whether the message is time
//	if it's time, then check if it is within the range (12:30-14:59)
//		if the time is correct, then assign the user that time
//	if it isn't a time, check if it's a cancel message
//		if it's a cancel message and the user is in the store, delete it and confirms
//	all else branches are handled with error messages.

function business_logic(line) {
	// returns undefined if time format is incorrect
	// otherwise returns "Data successfully recorded." 
	function convert_time_to_24_hour_format(msg) {
		var hours, minutes;
		var splitted_date = msg.split(':');
		hours = parseInt(splitted_date[0]);
		minutes = parseInt(splitted_date[1]);
		
		//converts 12h format to 24h format
		if (hours >= 0 && hours < 3) {
			hours += 12;
		}
		//chekcs the range
		if (hours < 12 || hours > 14 || (hours === 12 && minutes < 30) || minutes < 0 || 59 < minutes) {
			throwError('datecheck','date ({0}) does not fit in time interval: 12:30-14:59'.format(msg));
		} else {
			//rounds the minutes to 15 minutes
			minutes = Math.floor((minutes/15))*15;
			//stores
			var time = '{0}:{1}'.format(hours.toString(),minutes.toString());
			
			// bug for 14:00 -- was resulting in 14:0
			if (time.length < 5) {
				time += 0; 
			}

			store[name]=time;
			return "Data successfully recorded."
		}
	}


	var splitted_line, name, msg;
    splitted_line=line.split(';');
    msg=splitted_line[1];
    name=splitted_line[0];
	
	// is message a time value?
	if (/\d{1,2}:\d{1,2}/i.test(msg)) {
		return convert_time_to_24_hour_format(msg);
	} else { 
		// if it's not a time-message
		if (msg.toLowerCase() === 'cancel') {
			if (name in store) {
				// if it's cancel and the USER is in the store, delete the user's entry
				delete store[name];
				reply("You successfully cancelled your lunch appointment.")
			} else {
				throwError('Cancel lunch', "You requested to cancel lunch, but you did not have any appointment.");
			}
		} else {
			if (msg.length == 0) {
				throwError('dateParser', "Your message is empty");	
			} else {			
				throwError('dateParser', "I couldn't understand your message. You wrote: {0}".format(time));
			}
			
		}
	}
}

//necessary to read the file
var fs = require("fs");

//functions to help using other js file
//where the stroe JSON string is located
function read(f) {
  return fs.readFileSync(f).toString();
}
function include(f) {
  eval.apply(global, [read(f)]);
}

//string formatting method to easily insert strings.
//Source: http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

//array shuffle method
function shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

//helper function to shuffle the arrays associated with the time-keys
function shuffleTimeArray(time_array)
{
	for (var key in time_array)
	{
		//calling shuffle multiple times, because in practice
		//it seems that calling shuffle only once is not accaptably random
		time_array[key] = shuffle(time_array[key]);
		time_array[key] = shuffle(time_array[key]);
		time_array[key] = shuffle(time_array[key]);
	}
	return time_array;
}

//answer formatting method
function sendMsg(name_list,time) {
	var i;
	for(i = 0; i < name_list.length; i++) {
		//others contains the people in the group besides the addressed person
		var others = new Array();
		var j;
		for (j = 0; j < name_list.length; j++) {
			if (i !== j) {
				others.push(name_list[j]);
			}
		}
		var msg = "Hey {0}! You are paired up with".format(name_list[i]);
		if (others.length > 1) {
			for (j = 0; j < others.length; j++) {
				if (j === others.length - 1) {
					msg += ' and {0}'.format(others[j]);
				}
				else if (j === others.length - 2) {
					msg += ' {0}'.format(others[j]);
				} else {
					msg += ' {0},'.format(others[j]);
				}				
			}			
		} else {
			msg += ' {0}'.format(others[0]);
		}
		msg += " for lunch. Let's meet {0} at {1} {2}. Bon appétit!".format((others.length>1)? 'them':'him/her',time,'');
		console.log(msg);
	}
}

//send message to those who have no pairs
function sendAlternativeMessage(name_list,time) {
	console.log('Hey {0}! You signed up for lunch at {1}. \
Sorry to say, but nobody else signed up for this timeslot. \
don\'t worry, I\'m sure, that you can find some buddies to have lunch with. :]'.format(name_list[0],time) );
}

//This function forms groups from the arrays
//normally each group has 4 members
//if it's not possible it tries to create equal groups from those who remains (the last <8 person)
function createGroupsAndSend(time_array) {
	for (var key in time_array) {
		var name_list = time_array[key];
		while (name_list.length > 8) {
			var i;
			var group = new Array();
			for (i = 0; i < 4; i++) {
				group.push(name_list.pop());
			}
			sendMsg(group,key);
		}
		if (name_list.length>4) {
			var i;
			var group=new Array();
			var half_size=Math.floor(name_list.length/2)
			for (i = 0; i < half_size; i++) {
				group.push(name_list.pop());
			}
			sendMsg(group,key);
		}
		if (name_list.length > 1) {
			sendMsg(name_list, key);
		} else {
			sendAlternativeMessage(name_list, key);
			// TO DO
			// This case there's only one person in the given timeslot.
			// We should decide how to handle this case.
		}
	}
}



/////////////////////////////////// answer.js 

//receives a list of names with the associated timeslot
//returns a JSON object where each timeslot is associated with a list of names.
function date_list(store) {
	var ret = {}; // what does ret stand for? 
	for (var key in store) {
		var timeval=store[key];

		if (timeval in ret) {
			// console.log("already here")
			ret[timeval].push(key);
		} else {
			// console.log("not in hash map")
			ret[timeval]=[key];
		}
	}
	console.log(ret);
	return ret;
}

//the "main" part of the function
if (!module.parent) {
 	//default input
  	var inf = 'input0.txt';

  	//arg parsing
	process.argv.forEach(function (val, index, array) {
	  if (index == 2) {
	  	inf = val;
	  }
	});

	//including the store variable
	include(inf);

	//first create the namelist for the different timeslots
	var time_arrays = date_list(store);
	//shuffle each array
	time_arrays = shuffleTimeArray(time_arrays);
	//forms groups and sends the messages
	createGroupsAndSend(time_arrays);

	////just for test
	for (key in time_arrays) {
		console.log('{0}: {1}'.format(key,time_arrays[key]));
	}
}



// for Mocha unit test located in spec directory
module.exports.date_list = date_list;
module.exports.shuffleTimeArray = shuffleTimeArray;
// for Mocha unit test located in spec directory
module.exports.business_logic = business_logic;

