/*******************
 * MuscleFriend
 * 30日チャレンジお助けボット
 * 
 * node v12.18.3  - v8.10.0
 * npm 6.14.6  - 3.5.2
 ******************* */

"use strict";

require('dotenv').config();
const Eris = require("eris");
const fs = require("fs");
const moment = require("moment");
const CakeHash = require("cake-hash");

/** token */
const token = process.env.BOT_TOKEN;
/** bot */
const bot = new Eris.Client(token);
/** BOT Client ID */
const bot_id = process.env.BOT_USER_ID;
/** みんなのデータ */
const filename = "result.json";
// const backup = "\\\\MYNAS_1\\share1\\backup\\" + filename;//jsonBackupファイル

/** rooms */
const roomIds = process.env.ROOMS.split(' ');
const admins = process.env.ADMINS.split(' ');
const hlp_msg =
`
!start 30easy
30 日チャレンジ beginner をやるんですね！がんばりましょう！みんなも応援してね！
!start 30
30 日チャレンジ、みんなと一緒に頑張りましょう！
!start 7
7 秒スクワット！頑張りましょう～！
!done
えらい！！！
!howmany
XXX さんは今日 X 日目、 Y 回です。頑張りましょう！

// (๑╹ω╹๑ ) ＜ コマンド一覧だよ！

// ≪ 確認 コマンド ≫ ------------------------------------------------
// ？お題　　　　　　　　　　今回のお題表示
// ？リスト　　　　　　　　　お題抽選リスト（参考：！追加、！削除）
// ？作品　[お題]　　　　　　過去の作品全表示（例：？作品　ロボット ）
// ？作品　[お題]　[@ユーザ] そのユーザの過去の作品表示（例：？作品　ロボット　@つぽ#6599 ）
// ？過去　　　　　　　　　　過去のお題一覧を表示
// ？過去　[お題]　　　　　　そのお題の投稿者一覧を表示

// ≪ 登録削除 コマンド ≫ --------------------------------------------
// ！追加　[お題]　　お題抽選リストへの追加
// ！削除　[お題]　　お題抽選リストからの削除（自分のみ）
// ！黒歴史　[お題]　過去に投稿した作品の削除

// ≪ odaichan へのメンション ≫ --------------------------------------
// @odaichan へのメンションで絵を投稿するとその時のお題に紐づけて投稿できます
// ？作品 コマンドで見れるようになるよ！

// ※？お題　？作品 コマンドは他のルームでも使えます。
// ※お題リストには5件まで登録できます。
`;

/** types */
let types = {
    "squat_30_easy": {
        limit_date: 30,
        total: [20,25,30,null,40,45,50,null,60,65,70,null,80,85,90,null,100,105,110,null,115,120,125,null,130,135,140,null,145,150]
    },
    "squat_30_hard": {
        limit_date: 30,
        total: [50,55,60,null,70,75,80,null,100,105,115,null,130,135,140,null,150,155,160,null,180,185,190,null,220,225,230,null,240,250]
    },
    "squat_7_second": {
        limit_date: 0,
        total: 30
    },
    "abs_roller": {
        limit_date: 0,
        total: 0
    }
}

let result = null;



/********************
 *  getRandom
 ********************/
let getRandom = (array) => {
    return array[Math.floor(Math.random() * array.length)];
}

/********************
 *  getMemberInfo
 ********************/
let getMemberInfo = (author) => {
    let member = null;
    member = CakeHash.extract(result, `members.{n}[id=${author.id}]`);
    if (member.length) member = member[0];
    
    return member;
}

/********************
 *  createDetailMsg
 ********************/
let createDetailMsg = (author) => {
    member = getMemberInfo(author);
    let template = `
タイプ: ${member.type}
開始日: ${member.start_date}
結果: 
`;
    member.result.forEach((r) => {
        template += `${r.date} ${total}\n`;
    });
    return template;
}

/********************
 *  ready
 ********************/
bot.on("ready", () => {
    result = JSON.parse(fs.readFileSync(filename,"utf8"));
    console.log("Ready...");
});


/********************
 *  メッセージ
 ********************/
bot.on("messageCreate", msg => {
    if (!msg.author.bot){
        // BOT 以外
        // bot.createMessage(msg.channel.id, `${msg.author.mention} テスト`);
        
        
        if(roomIds.includes(msg.channel.id)){
            //特定チャンネルのみ

            //botへのメンションに反応
            if (msg.mentions.length > 0 && msg.mentions[0].id === bot_id){
                
                //おはよう
                if(msg.content.match(/(?:おはよ|おきた|おきました|起き?)/g)){
                    bot.createMessage(msg.channel.id, getRandom(["おはよー", "よく寝れた？", "おはよう！"]));
                }
                //眠い
                else if(msg.content.match(/(?:ねむ|眠?)/g)){
                    bot.createMessage(msg.channel.id, getRandom(["ねむいねー", "ねちゃう？", "ねていいよ", "寝よちゃおう"]));
                }
                //おやすみ
                else if(msg.content.match(/(?:おやすみ|ねる|寝る?)/g)){
                    bot.createMessage(msg.channel.id, getRandom(["おやすみなさいー","おやすみー","おやすみなさい","良い夢を","ゆっくり寝てね","また明日"]));
                }
                
                // 自由に言葉と返信を登録
                
                //おわったー
                else if(msg.content.match(/(?:やった|おわった|done|おわり|やりました|おわりました?)/g)){
                    //TODO 数字を登録
                    let awesomeReplies = ["えらい！", "さすが！", "よくやった！", "がんばったね", "すばらしいっ", "さいこー！"];
                    bot.createMessage(msg.channel.id, getRandom(awesomeReplies));
                    
                    let awesomeReactions = ["✨", "💯", "🎉", "👏"];
                    msg.addReaction(getRandom(awesomeReactions));
                }
                
                // やってない
                // その他
                

                // TODO 今日何回
                // TODO 応援コメント追加
                // TODO 開始登録
                // TODO 希望機能登録　…　リポジトリ「課題」に登録
            }

        }

    }
});


// Discord に接続します。
bot.connect();
