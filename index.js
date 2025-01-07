require('dotenv/config');
const { Client, IntentsBitField } = require('discord.js');
const { OpenAI } = require('openai');
const express = require('express');
const app = express();
app.use(express.json());

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
});

client.on('ready', () => {
    console.log("bot is online");
});

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DeepSeekAPI,
});

// 预制的 content 放在 QAcontent 中
const QAcontent = "You are a Q&A bot specializing in topics about Tura, TagFusion, on-chain credit, data fusion, and on-chain AGI. Tura is a decentralized platform powered by the Rotura Protocol, designed to revolutionize the credit system by solving issues like data silos and inefficiency. It unifies credit data from Web2 and Web3, offering a decentralized credit scoring infrastructure where users maintain control over their financial data. Tura's goal is to create a transparent financial ecosystem integrating credit data from Web2 and Web3, ensuring reliable, real-time credit computation. TagFusion is an innovative credit system that enhances users' creditworthiness through certified tags that represent skills and credibility, building trust. Technical features of Tura include decentralization and security with encryption, blockchain immutability for data integrity, and scalability via the Rotura Protocol. Tura also supports real-time credit scoring and cross-chain interoperability (e.g., Cosmos's IBC). On-chain credit serves as a strong, independent credit source, reducing costs and increasing usability. Current progress includes the launch of Tura's mainnet, the Tura wallet, and partnerships in the DeFi space. Future plans involve launching the first DApp, TagFusion, expanding developer tools, and enhancing smart contract features. Tura's founder, Larry Liu, has extensive experience, having worked at Yahoo on Hadoop, then at Hortonworks and Couchbase, before founding a startup that was acquired by Huawei.";



const topics = [
    "Data",
    "Fusion",
    "Onchain",
    "Credit",
    "Blockchain",
    "Decentralized Finance",
    "Smart Contracts",
    "Tura",
    "TagFusion",
    "Founder",
    "Rotura Protocol",
    "Web2",
    "Web3",
    "Credit System",
    "Interoperability",
    "IBC",
    "Tokenomics",
    "DeFi",
    "Mainnet",
    "Larry Liu",
    "Hadoop",
    "Yahoo",
    "Hortonworks",
    "Couchbase",
    "Financial Data",
    "Security",
    "Transparency",
    "Performance",
    "Real-time Credit",
    "DApp",
    "Tura Wallet",
    "Developer Tools",
    "Cross-chain",
    "Smart Contract Functions",
    "Credit Scoring",
    "Partnerships",
    "Global Influence",
    "Data Silos",
    "Credit Fragmentation",
    "Efficiency",
    "Certificates",
    "Trust",
    "Endorsements",
    "Asset Transfer",
    "CEX Integration"
    // 可以根据需要添加更多的主题
];

// 函数用于检查问题是否与 topics 相关
function isRelatedToTopic(messageContent) {
    return topics.some(topic => messageContent.toLowerCase().includes(topic.toLowerCase()));
}

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.channel.id !== process.env.CHANNEL_ID) return;

    // 检查问题是否与 topics 相关
    if (!isRelatedToTopic(message.content)) {
        message.reply("not related topics");
        return;
    }

    let conversationlog = [
        { role: "system", content: QAcontent },
        { role: "user", content: message.content }
    ];

    await message.channel.sendTyping();
    
    let preMessages = await message.channel.messages.fetch({limit : 15});
    preMessages.reverse();

    preMessages.forEach((msg) =>{
        if(msg.author.id !== client.user.id && message.author.bot) return;
        if(msg.author.id !== message.author.id) return;
        conversationlog.push({
            role:'user',
            content:msg.content,
        })
    })

    
    try {
        const result = await openai.chat.completions.create({
            model: 'deepseek-chat',
            messages: conversationlog,
        });
        message.reply(result.choices[0].message.content);
    } catch (error) {
        console.error('Error in OpenAI API call:', error);
        message.reply('Sorry, there was an error processing your request.');
    }
});

client.login(process.env.DISCORD_TOKEN);
