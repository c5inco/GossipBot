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


var endCallback =  function(response, convo) {
    convo.say('Alrighty then, ciao!');
    convo.next();
};

var askForLatest = function(response, convo) {
    convo.ask('What\'s the latest?', [
        {
            pattern: ['^(nevermind|got nothing|nvm|nada)'],
            callback: function(response, convo) {
                endCallback(response, convo);
                convo.next();
            }
        },
        {
            default: true,
            callback: function(response, convo) {
                console.log(response.text);
                askGotMore(response, convo);
                convo.next();
            }
        }
    ]);
};

var askGotMore = function(response, convo) {
    convo.ask('Interesting... Got more?', [
        {
            pattern: bot.utterances.no,
            callback: function(response, convo) {
                endCallback(response, convo);
                convo.next();
            }
        },
        {
            pattern: bot.utterances.yes,
            callback: function(response, convo) {
                askForLatest(response, convo);
                convo.next();
            }
        },
        {
            default: true,
            callback: function(response, convo) {
                convo.repeat();
                convo.next();
            }
        }
    ]);
}

var inputUtterances = [
    '^want to hear something juicy\\?*',
    '^i (got|have) a secret',
    '^i heard a rumor'
];

controller.hears(inputUtterances, ['direct_message', 'direct_mention', 'mention'], function(bot, message) {
    bot.reply(message, 'Do tell - let\'s chat privately.');
    
    bot.startPrivateConversation(message, askForLatest);
});