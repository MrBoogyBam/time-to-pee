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
const { prefix, githubToken, token } = require('./config.json');
const Keyv = require('keyv');
const KeyvSqlite = require('@keyv/sqlite'); // i don't know where this line of code came from but i don't want to delete it so it's here to stay.
const keyv = new Keyv('sqlite://database.db');
const path = require("node:path");
const simpleGit = require("simple-git");
const dbPath = path.join(path.resolve(__dirname), "database.db");
const git = simpleGit(path.resolve(__dirname));
const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
let peeingProgress = 0;
let stopped = false;
let stopDate = 0;
let connectedToVC = false;

bot.on('ready', async () => {
    await git.pull();

    console.log(`${bot.user.username} is ready.`);
});

bot.on('messageCreate', async message => {
    if(message.author.id != '368115473310547969' && message.author.id != '286600748094062602') return;

    let args = message.content.toLowerCase().trim().split(/ +/g);

    if(message.content.toLowerCase().startsWith(`${prefix}setprogress`)) {
        peeingProgress = Number(args[1]);

        await keyv.set("peeing-progress", peeingProgress);

        await git.add(dbPath);
        await git.commit("Updated database.db");
        await git.push(`https://${githubToken}@github.com/MrBoogyBam/ADGAC-Bot.git`, "main");

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
        let introduction = createAudioResource('D:/Discord bots/Markiplier the real/time-to-pee/Audio/mark.mp3');
        let reminder = createAudioResource('D:/Discord bots/Markiplier the real/time-to-pee/Audio/i\'m markiplier.mp3');

        player.play(introduction);

        connectedToVC = true;

        await imMarkiplier(player, reminder);

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

        connectedToVC = false;
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
            if(day != 30) {
                peeingProgress--;
            } else {
                peeingProgress -= 0.6;
            }

            await keyv.set('stop-bool', stopped);
            await keyv.set('stop-date', stopDate);
            await keyv.set('peeing-progress', peeingProgress);

            await git.add(dbPath);
            await git.commit("Updated database.db");
            await git.push(`https://${githubToken}@github.com/MrBoogyBam/ADGAC-Bot.git`, "main");

            message.channel.send(`ok :thumbsup::skin-tone-1: (Current peeing progress: ${peeingProgress}%)`);
            return;
        } else {
            peeingProgress = Number((peeingProgress + 0.21).toFixed(2));

            await keyv.set('stop-bool', stopped);
            await keyv.set('stop-date', stopDate);
            await keyv.set('peeing-progress', peeingProgress);

            await git.add(dbPath);
            await git.commit("Updated database.db");
            await git.push(`https://${githubToken}@github.com/MrBoogyBam/ADGAC-Bot.git`, "main");

            message.channel.send(`ok :thumbsup::skin-tone-1: (Current peeing progress: ${peeingProgress}%)`);
            return;
        }
    }
});

async function imMarkiplier(player, reminder) {
    let timer = Math.floor(Math.random() * (600000 - 30000) + 30000);

    if(connectedToVC) {
        setTimeout(async () => {
            player.play(reminder);
            
            reminder = createAudioResource('D:/Discord bots/Markiplier the real/time-to-pee/Audio/i\'m markiplier.mp3');
            await imMarkiplier(player, reminder);
        }, timer);
    }
}

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

            await git.add(dbPath);
            await git.commit("Updated database.db");
            await git.push(`https://${githubToken}@github.com/MrBoogyBam/ADGAC-Bot.git`, "main");

            return;
        }
        return;
    }

    if(day % 5 == 0 && hours >= 6) {
        if(month == 1 || month == 11) {
            channel.send("<@368115473310547969> Consider the following: suck your pants");
            return;
        }

        channel.send("<@368115473310547969> Consider the following: pee your pants");
        return;
    }
}, 10000);

bot.login(token);