var config = require('./config');

if (!config.token) {
    console.log('Error: Specify token in environment or config.js');
    process.exit(1);
}

var Botkit = require('./lib/Botkit');

var controller = Botkit.slackbot({
    debug: config.debug
});

var bot = controller.spawn({
    token: config.token
}).startRTM();


controller.hears(['hello', 'hi'], ['direct_message', 'direct_mention', 'mention'], function(bot, message) {
    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'robot_face',
    },function(err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(',err);   
        }
    });

    controller.storage.users.get(message.user,function(err, user) {
        if (user && user.name) {
            bot.reply(message,'Hello ' + user.name + '!!');
        } else {
            bot.reply(message,'Hello.');
        }
    });
});