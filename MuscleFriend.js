/*******************
 * MuscleFriend
 * 30日チャレンジお助けボット
 * 
 * node v12.18.3
 * npm 6.14.6
 ******************* */

"use strict";

require('dotenv').config();
const Eris = require("eris");
const fs = require("fs");

/** token */
const token = process.env.BOT_TOKEN;
/** bot */
// const bot = new Eris(token);
const bot = new Eris.CommandClient(token, {}, {
    description: "A test bot made with Eris",
    owner: "somebody",
    prefix: "!"
});

// const bot_id = process.env.BOT_USER_ID;//botuserid

/** みんなのデータ */
const filename = "muscle_data.json";
// const bkup = "\\\\MYNAS_1\\share1\\bkup\\" + filename;//jsonbkupファイル

/** rooms */
// const roomIds = process.env.ROOMS.split(' ');
// const target_room = roomIds[0];//イラスト雑談部屋
// const target_room2 = "404125153627340802";//イラストうｐ部屋
const odai_max = 20;
const interval = 5;//何日おきにお題を変更するか
const admins = process.env.ADMINS.split(' ');
const cmd_help =
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
// ※お題リストには${odai_max}件まで登録できます。
`;


let squat_30_easy = {
    limit: 30,
    time: [20,25,30,0,40,45,50,0,60,65,70,0,80,85,90,0,100,105,110,0,115,120,125,0,130,135,140,0,145,150]
};
let squat_30_hard = {
    limit: 30,
    time: [50,55,60,0,70,75,80,0,100,105,115,0,130,135,140,0,150,155,160,0,180,185,190,0,220,225,230,0,240,250]
};
let squat_7_second = {
    limit: 0,
    time: 30
};


//func:今回のお題メッセージを作成
let odai_msg = function(data){
    let std_dt = new Date(data.re_dt.year, data.re_dt.month, data.re_dt.date);
    let addday = interval === 0 ? 0 : interval -1;            //終了日なのでインターバル-1
    let end_dt = new Date(data.re_dt.year, data.re_dt.month, data.re_dt.date + addday);
    std_dt = std_dt.getMonth()+1 + "/" + std_dt.getDate();
    end_dt = end_dt.getMonth()+1 + "/" + end_dt.getDate();
    let msg = 
`====================================
<今回のお題>  (${std_dt}～${end_dt}）

『${data.odai_main.odai}』

（出題者：${data.odai_main.user}）

お絵かき一本勝負のお題です。
投稿は１テーマ１枚まで。
日付の切り替わりは朝５時くらいです。
さぁどうぞ！
====================================`;
    return msg;
}

// //該当日付にお題を告知
// /*1分間隔で起動し0時00分に日付判定を行う。
// 該当日付だった場合は処理する。*/
// setInterval(function() {
//     let dt = new Date();
//     if(dt.getHours() == 5 && dt.getMinutes() == 0){
//         const data = JSON.parse(fs.readFileSync(filename,"utf8"));
//         fs.writeFile(bkup, JSON.stringify(data));//一日一回jsonバックアップ書き出し
//         let next_dt = new Date(data.re_dt.year, data.re_dt.month, data.re_dt.date + interval);
//         if (dt > next_dt){
//             choose_odai(data);
//         }
//     }
// }, 60000);


//bot起動したら
bot.on("ready", () => {
    console.log("Ready...");
});

bot.registerCommand("ping", "Pong!", { // Make a ping command
    // Responds with "Pong!" when someone says "!ping"
        description: "Pong!",
        fullDescription: "This command could be used to check if the bot is up. Or entertainment when you're bored.",
        reactionButtons: [ // Add reaction buttons to the command
            {
                emoji: "⬅",
                type: "edit",
                response: (msg) => { // Reverse the message content
                    return msg.content.split().reverse().join();
                }
            },
            {
                emoji: "🔁",
                type: "edit", // Pick a new pong variation
                response: ["Pang!", "Peng!", "Ping!", "Pong!", "Pung!"]
            },
            {
                emoji: "⏹",
                type: "cancel" // Stop listening for reactions
            }
        ],
        reactionButtonTimeout: 30000 // After 30 seconds, the buttons won't work anymore
    });

//メッセージ投げられたら
bot.on("messageCreate", msg => {
    if (!msg.author.bot){
        // BOT 以外
        // bot.createMessage(msg.channel.id, `${msg.author.mention} テスト`);
        
        
        // if(roomIds.includes(msg.channel.id)){//特定チャンネルでしか有効にしない

        //     //botへのメンションに反応
        //     if (msg.mentions.length > 0 && msg.mentions[0].id === bot_id){
        //         //コマンドヘルプ
        //         if(msg.content.match(/(?:コマンド|こまんど|ｺﾏﾝﾄﾞ|commands?)/g)){
        //             bot.createMessage(msg.channel.id, cmd_help);
        //         }else if(msg.content.match(/(username) (.*)/) && admins.includes(msg.author.id)){
        //             //BOTのユーザー情報変更（管理者のみ）
        //             let changedata =  msg.content.match(/(username) (.*)/);
        //             bot.editSelf({username: changedata[2]})
        //                 .then((v) => {
        //                     bot.createMessage(msg.channel.id, 'ユーザー名を変更しました');
        //                 })
        //                 .catch((err) => {
        //                     bot.createMessage(msg.channel.id, `${msg.author.mention} ${err.message}`);
        //                 });
        //         }

        //         //画像ファイルが一つ添付されていたら
        //         if (msg.attachments.length == 1 && msg.attachments[0].filename.match(/.+\.(?:jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)){
        //             const data = JSON.parse(fs.readFileSync(filename,"utf8"));
        //             let target = data.kako_list[check_duplicate(data.odai_main.odai,data.kako_list)].image;
        //             let hit_flg = false;
        //             for(let i = 0, l = target.length; i < l; i++){
        //                 if(msg.author.id === target[i].number){
        //                     bot.createMessage(msg.channel.id, `${msg.author.mention} すでに作品を投稿済みです。新しく追加する場合は、一度削除してください。`);
        //                     hit_flg = true;
        //                     break;
        //                 }
        //             }
        //             if(!hit_flg){
        //                 target.push({"url":msg.attachments[0].url,"user":msg.author.username,"number":msg.author.id});
        //                 fs.writeFile(filename, JSON.stringify(data));
        //                 //コメント返し
        //                 let rnd = Math.floor(Math.random() * data.bot_remsgs.length);
        //                 bot.createMessage(msg.channel.id, `${msg.author.mention} ${data.bot_remsgs[rnd]}`);
        //             }
        //         }

        //     }

        // }

        //コマンド検知
        if (msg.content.match(/^[\!\！\?\？].+/)){

            // const data = JSON.parse(fs.readFileSync(filename,"utf8"));

            //今回のお題表示
            if(msg.content.match(/^[\!\！](?:やった|おわった|done)/)) {
                bot.createMessage(msg.channel.id, "えらい！");
                // bot.createMessage(msg.channel.id, odai_msg(data));
            }
            
        //     //過去作表示
        //     }else if(msg.content.match(/^[\?\？](?:作品|works)/)){
        //         let res = msg.content.match(/^[\?\？](?:作品|works)(?: |　)+([\w\u30a0-\u30ff\u3040-\u309f\u3005-\u3006\u30e0-\u9fcf\uff01-\uff5e]+)(?: |　)*(?:\<\@\!?(\d+)\>)?(?: |　)*$/);
        //         if(res){
        //             let odai_word = res[1];
        //             let someone = res[2];
        //             let num = check_duplicate(odai_word,data.kako_list);
        //             if(typeof(num) === "number") {
        //                 let target = data.kako_list[num].image;
        //                 if(target.length > 0){
        //                     if(someone !== undefined){//メンションついてたらその人の作品のみ
        //                         let tmp_msg = `${msg.author.mention} ${msg.mentions[0].username}さんは、お題『${odai_word}』の作品を登録していません＞＜`;
        //                         for(let i = 0, l = target.length; i < l; i++){
        //                             if(someone === target[i].number){
        //                                 tmp_msg = `お題『${odai_word}』\n====================================\n\n${target[i].user}さん\n${target[i].url}`;
        //                                 break;
        //                             }
        //                         }
        //                         bot.createMessage(msg.channel.id, tmp_msg);
        //                     }else{
        //                         bot.createMessage(msg.channel.id, `お題『${odai_word}』\n`);
        //                         for(let i = 0, l = target.length; i < l; i++){
        //                             bot.createMessage(msg.channel.id, `====================================\n\n<@${target[i].number}>さん\n${target[i].url}`);
        //                         }
        //                     }
        //                 }else{
        //                     bot.createMessage(msg.channel.id, `${msg.author.mention} 作品登録者がいません＞＜`);
        //                 }
        //             }else{
        //                 bot.createMessage(msg.channel.id, `${msg.author.mention} 『${odai_word}』は過去に出題されていません。`);
        //             }
        //         }else{
        //             bot.createMessage(msg.channel.id, `${msg.author.mention} お題を指定してください。\n過去のお題は『？過去リスト』コマンドで表示できます。`);
        //         }
        //     }


        //     //以降のコマンドは特定チャンネルでしか有効にしない
        //     if(roomIds.includes(msg.channel.id)){

        //         //お題リスト表示
        //         if(msg.content.match(/^[\?\？](?:リスト|list)/)){
        //             let list_msg;
        //             if(data.odai_list.length !== 0){
        //                 let std_dt = new Date(data.re_dt.year, data.re_dt.month, data.re_dt.date);
        //                 let next_dt = new Date(data.re_dt.year, data.re_dt.month, data.re_dt.date + interval);
        //                 next_dt = next_dt.getMonth()+1 + "/" + next_dt.getDate();
        //                 list_msg = `次回の出題は${next_dt}予定です。\n-------------------------------------\n`;
        //                 for(let i = 0, l = data.odai_list.length; i < l; i++){
        //                     list_msg += `『${data.odai_list[i].odai}』 ${data.odai_list[i].user}\n`;
        //                 }
        //             }else{
        //                 list_msg = "リストにお題がありません＞＜";
        //             }
        //             bot.createMessage(msg.channel.id, list_msg);


        //         //過去のお題一覧を表示
        //         }else if(msg.content.match(/^[\?\？](?:過去|pwk)/)){
        //             let list_msg;
        //             if(data.kako_list.length !== 0){
        //                 let res = msg.content.match(/^[\?\？](?:過去|pwk)(?: |　)*([\w\u30a0-\u30ff\u3040-\u309f\u3005-\u3006\u30e0-\u9fcf\uff01-\uff5e]*)/);
        //                 let odai_word = res[1];
        //                 if(odai_word !== ""){//お題が指定されていたら投稿者一覧を表示
        //                     let num = check_duplicate(odai_word,data.kako_list);
        //                     if(typeof(num) === "number") {
        //                         list_msg = `お題『${odai_word}』投稿者一覧\n`;
        //                         let target = data.kako_list[num].image;
        //                         for(let i = 0, l = target.length; i < l; i++){
        //                             list_msg += `「${target[i].user}」`;
        //                         }
        //                     }else{
        //                         list_msg = `${msg.author.mention} 『${odai_word}』は過去に出題されていません。`;
        //                     }
        //                 }else{//特にお題の指定なければ一覧を表示
        //                     list_msg = "過去のお題一覧\n";
        //                     for(let i = 0, l = data.kako_list.length; i < l; i++){
        //                         list_msg += `『${data.kako_list[i].odai}』`;
        //                     }
        //                 }
        //             }else{
        //                 list_msg = "過去のお題はありません＞＜";
        //             }
        //             bot.createMessage(msg.channel.id, list_msg);


        //         //お題追加
        //         }else if(msg.content.match(/^[\!\！](?:add|追加)/)){
        //             let res = msg.content.match(/^[\!\！](?:add|追加)(?: |　)+([\w\u30a0-\u30ff\u3040-\u309f\u3005-\u3006\u30e0-\u9fcf\uff01-\uff5e]+)$/);
        //             if(res){
        //                 if(data.odai_list.length < odai_max){
        //                     let odai_word = res[1];
        //                     //戻り値がnumber以外ならお題リストにないので追加する
        //                     if(typeof(check_duplicate(odai_word,data.odai_list)) !== "number" && typeof(check_duplicate(odai_word,data.kako_list)) !== "number") {
        //                         data.odai_list.push({"odai":odai_word,"user":msg.author.username,"number":msg.author.id});
        //                         fs.writeFile(filename, JSON.stringify(data));
        //                         bot.createMessage(msg.channel.id, `お題『${odai_word}』が追加されました。`);
        //                     }else{
        //                         bot.createMessage(msg.channel.id, `${msg.author.mention} お題『${odai_word}』はすでに登録されたか、過去に出題されています。`);
        //                     }
        //                 }else{
        //                     bot.createMessage(msg.channel.id, `${msg.author.mention} お題リストがいっぱいです＞＜`);
        //                 }
        //             }else{
        //                 bot.createMessage(msg.channel.id, `${msg.author.mention} お題に以下のいずれかが含まれていると無効になります。\n【スペース、半角カタカナ、半角記号や特殊文字等】`);
        //             }


        //         //お題削除
        //         }else if(msg.content.match(/^[\!\！](?:del|削除)/)){
        //             let res = msg.content.match(/^[\!\！](?:del|削除)(?: |　)+([\w\u30a0-\u30ff\u3040-\u309f\u3005-\u3006\u30e0-\u9fcf\uff01-\uff5e]+)$/);
        //             if(res){
        //                 let odai_word = res[1];
        //                 let num = check_duplicate(odai_word,data.odai_list);//リストに存在すれば添え字がnumber型で返ってくるので処理続行
        //                 if(typeof(num) === "number") {
        //                     if(data.odai_list[num].number === msg.author.id || admins.includes(msg.author.id)){
        //                         data.odai_list.splice(num,1);
        //                         fs.writeFile(filename, JSON.stringify(data));
        //                         bot.createMessage(msg.channel.id, `お題『${odai_word}』を削除しました。`);
        //                     }else{
        //                         bot.createMessage(msg.channel.id, `${msg.author.mention} お題を追加した本人しか削除できません。`);
        //                     }
        //                 }else{
        //                     bot.createMessage(msg.channel.id, `${msg.author.mention} 『${odai_word}』はお題リストに登録されていません。`);
        //                 }
        //             }else{
        //                 bot.createMessage(msg.channel.id, `${msg.author.mention} お題に以下のいずれかが含まれていると無効になります。\n【スペース、半角カタカナ、半角記号や特殊文字等】`);
        //             }

        //         //過去リストより削除
        //         }else if(msg.content.match(/^[\!\！](?:rem|黒歴史)/)){
        //             let res = msg.content.match(/^[\!\！](?:rem|黒歴史)(?: |　)+([\w\u30a0-\u30ff\u3040-\u309f\u3005-\u3006\u30e0-\u9fcf\uff01-\uff5e]+)$/);
        //             if(res){
        //                 let odai_word = res[1];
        //                 let num = check_duplicate(odai_word,data.kako_list);//リストに存在すれば添え字がnumber型で返ってくるので処理続行
        //                 if(typeof(num) === "number") {
        //                     let target = data.kako_list[num].image;
        //                     let hit_flg = false;
        //                     for(let i = 0, l = target.length; i < l; i++){
        //                         if(target[i].number === msg.author.id){
        //                             target.splice(i,1);
        //                             fs.writeFile(filename, JSON.stringify(data));
        //                             hit_flg = true;
        //                             bot.createMessage(msg.channel.id, `『${odai_word}』の投稿作品を削除しました＞＜`);
        //                             break;
        //                         }
        //                     }
        //                     if(!hit_flg){
        //                         bot.createMessage(msg.channel.id, `${msg.author.mention} 『${odai_word}』の作品は投稿してないみたいだよ`);
        //                     }
        //                 }else{
        //                     bot.createMessage(msg.channel.id, `${msg.author.mention} 『${odai_word}』は過去に出題されていません。`);
        //                 }
        //             }else{
        //                 bot.createMessage(msg.channel.id, `${msg.author.mention} お題に以下のいずれかが含まれていると無効になります。\n【スペース、半角カタカナ、半角記号や特殊文字等】`);
        //             }
        //         }
        //     }
        }

    }
});


// Discord に接続します。
bot.connect();
