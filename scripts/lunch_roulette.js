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
//   hubot lilo wants lunch at 11:11  - returns a confirmation message

var timeFormat = /^([0-9]{2})\:([0-9]{2})$/;

module.exports = function(robot) {

	robot.respond(/(.*) wants lunch at ([0-9]{2})\:([0-9]{2})/i, function(msg){
		var name = msg.match[1];
		var time = msg.match[2] + ":" + msg.match[3];
		msg.reply("Okay, " + name + "! I will sign you up for " + time + ".");
	});

}