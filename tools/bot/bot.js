const { Client, GatewayIntentBits } = require('discord.js');
const bot = new Client( {
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ]
} );
const { prefix, token } = require('./config.json');
const Keyv = require('keyv');
const KeyvSqlite = require('@keyv/sqlite'); // i don't know where this line of code came from but i don't want to delete it so it's here to stay.
const keyv = new Keyv('sqlite://database.db');
const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const forbiddenDaysJan = [ 4, 8, 15, 19, 23, 27, 30 ];
const forbiddenDaysNov = [ 5, 10, 15, 20, 25, 30 ];
let peeingProgress = 0;
let stopped = false;
let stopDate = 0;

bot.on('ready', () => {
    console.log(`${bot.user.username} is ready.`);
});

bot.on('messageCreate', async message => {
    if(message.author.id != '368115473310547969' && message.author.id != '286600748094062602') return;

    let args = message.content.toLowerCase().trim().split(/ +/g);

    if(message.content.toLowerCase().startsWith(`${prefix}setprogress`)) {
        peeingProgress = Number(args[1]);

        await keyv.set("peeing-progress", peeingProgress);

        message.channel.send("Done :white_check_mark:");
        return;
    }

    if(message.content.toLowerCase() == `${prefix}viewprogress`) {
        peeingProgress = await keyv.get('peeing-progress');

        message.channel.send(`Current peeing progress: ${peeingProgress}%`);
        return;
    }

    if(message.content.toLowerCase() == `<@952017794059370496> hop in`) {
        let player = createAudioPlayer();
        let introduction = createAudioResource('D:/Discord bots/Markiplier the real/Audio/mark.mp3');

        player.play(introduction);

        joinVoiceChannel({
            channelId: message.member.voice.channelId,
            guildId: message.member.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator
        });

        let botMember = bot.guilds.cache.get(message.guildId).members.cache.get(bot.user.id);
        let connection = getVoiceConnection(botMember.voice.guild.id);

        connection.subscribe(player);
    }

    if(message.content.toLowerCase() == `<@952017794059370496> get the hell out`) {
        let botMember = bot.guilds.cache.get(message.guildId).members.cache.get(bot.user.id);
        getVoiceConnection(botMember.voice.guild.id).disconnect();
    }

    if(message.content.toLowerCase() == `${prefix}stop`) {
        if(stopped) {
            message.channel.send(`i din do nuttin`);
            return;
        }

        let date = new Date();
        let day = date.getDate();
        let month = date.getMonth() + 1;
        peeingProgress = await keyv.get('peeing-progress');

        stopped = true;
        stopDate = day;

        if(month == 11 || month == 1) {
            peeingProgress--;

            await keyv.set('stop-bool', stopped);
            await keyv.set('stop-date', stopDate);
            await keyv.set('peeing-progress', peeingProgress);

            message.channel.send(`ok :thumbsup::skin-tone-1: (Current peeing progress: ${peeingProgress}%)`);
            return;
        } else {
            peeingProgress = Number((peeingProgress + 0.34).toFixed(2));

            await keyv.set('stop-bool', stopped);
            await keyv.set('stop-date', stopDate);
            await keyv.set('peeing-progress', peeingProgress);

            message.channel.send(`ok :thumbsup::skin-tone-1: (Current peeing progress: ${peeingProgress}%)`);
            return;
        }
    }
});

setInterval(async () => {
    let date = new Date();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hours = date.getHours();
    let guild = bot.guilds.cache.get('930423692058587136');
    let channel = guild.channels.cache.get('930423692893229069');
    
    peeingProgress = await keyv.get('peeing-progress');
    stopped = await keyv.get('stop-bool');
    stopDate = await keyv.get('stop-date');

    if(stopped == true) {
        if(day != stopDate) {
            stopped = false;
            
            await keyv.set('stop-bool', stopped);

            return;
        }
        return;
    }

    if(month == 1) {
        for(i = 0; i < forbiddenDaysJan.length; i++) {
            if(day == forbiddenDaysJan[i] && hours >= 6) {
                channel.send("<@368115473310547969> Consider the following: suck your pants");
            }
        }
        return;
    }

    if(month == 11) {
        for(i = 0; i < forbiddenDaysNov.length; i++) {
            if(day == forbiddenDaysNov[i] && hours >= 6) {
                channel.send("<@368115473310547969> Consider the following: suck your pants");
            }
        }
        return;
    }

    if(month == 12) return;

    if(peeingProgress >= 88 && (day == 15 && hours >= 6 || day == 30 && hours >= 6)) {
        channel.send("<@368115473310547969> Consider the following: pee your pants");
        return;
    }

    if(peeingProgress < 88 && (day == 5 && hours >= 6 || day == 10 && hours >= 6 || day == 15 && hours >= 6 || day == 20 && hours >= 6 || day == 25 && hours >= 6 || day == 30 && hours >= 6)) {
        channel.send("<@368115473310547969> Consider the following: pee your pants");
        return;
    }
}, 10000);

bot.login(token);