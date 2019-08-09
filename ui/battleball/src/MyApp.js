/**
 * Created by z00353808 on 2016/8/11.
 */
//全局变量
// 地图块大小
var blockwidth = 38.5;
var blockheight = 38.5;

//地图大小
var mapwidth = 30;
var mapheight = 30;
var realmapweidth;
var realmapheight;

var mappixelwidth = 1280;
var mappixelheight = 960;

//计分板偏移量
var scorelayershift = 50;

//中间地图放大比例
var mapscalex = 1;
var mapscaley = 1;

var gamescalepixel = 32;
var gamescale = 1;
var gamebuttomheight = 110;

//每个层所在的位置
var leftedgex = 0;
var middleedgex = 0;
var rightedgex =  0;

var interval = 0.5;
var timerInterval = 0.1;
var stopOnce = true;
var pausegame = false;
var stopgame = false;
var fonttype = "仿宋";

var audioEngine = cc.AudioEngine.getInstance();
var checkArray = function (object) {
    return (object != null && typeof object == "object" 
            && 'splice' in object && 'join' in object 
            && 'length' in object);
};

var Hero = cc.Sprite.extend({
    step: 4,  //移动需要的帧数
    ctor: function (id, heropic) {
        this._super();
        this.id = id;
        this.status = "alive";
        this.initWithFile(heropic);
        //this.setScale(gamescale, gamescale);
    },

    setheroposition: function (x, y) {
        this.posx = x;
        this.posy = y;
        y = realmapheight - y - 1;
        this.setPosition(x * blockwidth, y * blockheight);
        this.setAnchorPoint(0, 0);
    },
    flashto: function (x, y) {
        this.stopAllActions();
        //创建闪现动画
        var actions = [];
        actions.push(cc.DelayTime.create(0));
        actions.push(
            cc.Spawn.create(
                cc.FadeTo.create(0)
            ));
        this.setheroposition(x, y);
        actions.push(
            cc.Spawn.create(
                cc.FadeTo.create(1)
            ));
        this.runAction(cc.Sequence.create(actions));

    },
    revivetoo: function () {
        this.status = "alive";
        this.setVisible(true);
        this.setColor(cc.c4b(255,255,255, 255));
        this.stopAllActions();
        //创建闪现动画
        var actions = [];
        actions.push(cc.DelayTime.create(0));
        actions.push(
            cc.Spawn.create(
                cc.FadeOut.create(0.1)
            ));
        //this.setheroposition(x, y);
        actions.push(
            cc.Spawn.create(
                cc.FadeIn.create(0.1)
            ));
        actions.push(
            cc.Spawn.create(
                cc.FadeOut.create(0.1)
            ));
        actions.push(
            cc.Spawn.create(
                cc.FadeIn.create(0.1)
            ));
        this.runAction(cc.Sequence.create(actions));
    },
    godead: function () {
        this.status = "dead";
        //this.setVisible(false);
        this.setColor(cc.c4b(20,20,20, 10));
    },
    beltto: function (list) {
        this.stopAllActions();
        //创建传送动画
        var actions = [];
        actions.push(cc.DelayTime.create(0));
        for(var i = 1; i <= list.length; i++){
            actions.push(
                cc.Spawn.create(
                    cc.MoveTo.create(0.1, cc.p(list[i].x * blockwidth, (realmapheight - list[i].y - 1) * blockheight))
                )
            );
        }
        this.runAction(cc.Sequence.create(actions));
    },
    movetox: function(x, y){
        this.posx = x;
        this.posy = y;
        this.stopAllActions();
        y = realmapheight - y - 1;
        x *= blockwidth;
        y *= blockheight;
        var p = this.getPosition();
        var detx = x - p.x;
        var dety = y - p.y;
        if((detx <= 0.1 && detx >= -0.1) && (dety <= 0.1 && dety >= -0.1)){
            return;
        }
        var actions = [];
        actions.push(cc.DelayTime.create(0));
        for(var i = 1; i <= this.step; i++){
            actions.push(
                cc.Spawn.create(
                    cc.MoveTo.create(interval/this.step, cc.p(p.x + detx * i / this.step, p.y + dety * i / this.step))
                )
            );
        }
        this.runAction(cc.Sequence.create(actions));
    }
});

var mapblock = cc.Sprite.extend({
    ctor: function(pic){
        this._super();
        this.initWithFile(pic);
        this.setScale(0.8*gamescale, 0.8*gamescale);
    },
    initmapblock: function(x, y){
        this.setmapbolckposition(x, y);
    },
    setmapbolckposition: function (x, y) {
        this.posx = x;
        this.posy = y;
        y = realmapheight - y - 1;
        this.setPosition(x * blockwidth, y * blockheight);
        this.setAnchorPoint(0, 0);
    },
});

var mapbackground = cc.Sprite.extend({
    ctor: function(type, x, y){
        this._super();
        this.posx = x;
        this.posy = y;
        this.backstatus = "light";
        this.initWithFile(res.map_background_light);
        this.setPosition(this.posx, this.posy);
        this.setAnchorPoint(0, 0);
        //this.setVisible(false);
        this.setVisible(true);
    },
    initmapbackground: function(pic){
        this.initWithFile(pic);
        var scaleratex = 1;
        var scaleratey = 1;
        scaleratex = mappixelheight/this.getContentSize().width;
        scaleratey = mappixelheight/this.getContentSize().height;
        this.setAnchorPoint(0, 0);        
        this.setPosition(0, 0);
        this.setScale(scaleratex / mapscalex, scaleratey / mapscaley);
    },
    setmapbackgroundpic(type){
        return;
        var scaleratex = 1;
        var scaleratey = 1;
        if(this.backstatus == type){
            return;
        }else if(this.backstatus == "none"){
            ;
        }else{
            this.setVisible(false);            
            this.backstatus = "none";        
            this.initWithFile(type == "light" ? res.map_background_light : res.map_background_dark);
            this.setPosition(this.posx, this.posy);
            this.setAnchorPoint(0, 0);
            return;
        }
        if(type == "light"){
            this.initmapbackground(res.map_background_light);
        }
        else if(type == "dark")
        {
            this.initmapbackground(res.map_background_dark);
        }
        this.setVisible(true);
        this.backstatus = type;
    }
});

var edgebackground = cc.Sprite.extend({
    ctor: function(pic){
        this._super();
        this.backpic = pic;
        this.initWithFile(this.backpic);
        this.backstatus = "none";
        this.setVisible(false);
    },
    setedgebackground: function(){
        if(this.backstatus == "alive")
        {
            return;
        }
        this.initWithFile(this.backpic);
        scaleratex = ((mappixelwidth - mappixelheight)/2)/this.getContentSize().width;
        scaleratey = mappixelheight/this.getContentSize().height;
        this.setScale(scaleratex, scaleratey);
        this.setAnchorPoint(0, 0);        
        this.setPosition(this.posx, this.posy);    
        this.backstatus = "alive";
        this.setVisible(true);
    },
    setbackgroundpos: function(x, y){
        this.posx = x;
        this.posy = y;
        this.setAnchorPoint(0, 0);        
        this.setPosition(this.posx, this.posy);        
    }
});

var Mine = cc.Sprite.extend({
    ctor: function(){
        this._super();
        this.initWithFile(res.map_mine);
        this.setScale(gamescale, gamescale);
    },
    initmine: function(mine){
        this.value = mine.value;
        this.id = mine.id;
        this.scorelabel = cc.LabelTTF.create("+" + this.value, fonttype, 20);
        this.scorelabel.setAnchorPoint(0.8, 0.8);
        this.scorelabel.setPosition(32, 32);
        this.addChild(this.scorelabel, 2);
    },
    setmineposition: function (x, y) {
        this.posx = x;
        this.posy = y;
        y = realmapheight - y - 1;
        this.setPosition(x * blockwidth, y * blockheight);
        this.setAnchorPoint(0, 0);
    },
    updatemine: function () {
        this.stopAllActions();
        //创建闪现动画
        var actions = [];
        actions.push(cc.DelayTime.create(0));
        actions.push(
            cc.Spawn.create(
                cc.FadeOut.create(0.1)
            ));
        actions.push(
            cc.Spawn.create(
                cc.FadeIn.create(0.1)
            ));
        actions.push(
            cc.Spawn.create(
                cc.FadeOut.create(0.1)
            ));
        actions.push(
            cc.Spawn.create(
                cc.FadeIn.create(0.1)
            ));        this.runAction(cc.Sequence.create(actions));
    }
});

var scoreLabel = cc.Sprite.extend({
    logowidth: 32,
    labelheight: 25,
    logoscale: 1.5,
    nlabel: 0,
    slabel: 0,
    id: 0,
    score: 0,
    ctor: function (pic) {
        this.ignoreAnchorPointForPosition(false);
        this._super();
        this.playerlogo = cc.Sprite.create();
        this.playerlogo.initWithFile(pic);
        this.nlabel = cc.LabelTTF.create("玩家：", fonttype, 18);
        this.slabel = cc.LabelTTF.create("得分：", fonttype, 18);
        this.sleepbalel = cc.LabelTTF.create("睡眠：", fonttype, 18);
        this.playerstatus = cc.LabelTTF.create("", fonttype, 18);
        this.death = cc.Sprite.create();
        this.death.initWithFile(res.death);
        //this.death.setVisible(false);

        this.addChild(this.playerlogo, 0);
        this.addChild(this.nlabel, 0);
        this.addChild(this.slabel, 0);
        this.addChild(this.sleepbalel, 0);
        //this.addChild(this.playerstatus, 0);
        this.addChild(this.death,2);

        this.playerlogo.setAnchorPoint(0, 0);
        this.playerlogo.setScale(1,1);
        this.nlabel.setAnchorPoint(0,0);
        this.slabel.setAnchorPoint(0,0);
        this.sleepbalel.setAnchorPoint(0,0);
        this.playerstatus.setAnchorPoint(0,0);
        this.death.setAnchorPoint(0, 0);
        this.death.setScale(0.8, 0.8);
    },
    initscorelabel: function (player,enemyFlag,index) {
        this.id = player.player_id;
        this.score = player.point;
        this.sleeptime = player.sleep;
        this.teamid = player.team_id;
        this.nlabel.setString("玩家：" + this.id);
        var offsetX = -135;
        if(enemyFlag){
            offsetX = 25;
            this.nlabel.setColor(cc.c4b(180,246,253,0))
            
        }else{
            this.nlabel.setColor(cc.c4b(255,160,159,0))
        }
        var offsetY = 20
        this.nlabel.setPosition(this.logowidth * this.logoscale + offsetX, 2 * this.labelheight+offsetY);
        if (player.status == "alive")
        {
            this.slabel.setString("得分：" + this.score);
            this.sleepbalel.setString("睡眠：" + this.sleeptime);
            this.sleepbalel.setPosition(this.logowidth * this.logoscale + offsetX, offsetY);
            //this.playerstatus.setString("存活");
            this.playerstatus.setPosition(this.logowidth * this.logoscale + offsetX, 3 * this.labelheight+offsetY);
            this.slabel.setPosition(this.logowidth * this.logoscale + offsetX, this.labelheight+offsetY);
            this.death.setVisible(false);
            this.playerlogo.setColor(cc.c4b(255,255,255, 255));
            this.playerlogo.setPosition(-10, (1.5 * this.labelheight * 2 - this.logowidth * this.logoscale) / 2 + 10);
            if(enemyFlag){
                var player_img = res.enemyheros[index];
                this.slabel.setColor(cc.c4b(71,153,216,0));
                this.sleepbalel.setColor(cc.c4b(71,153,216,0));
            }else{
                var player_img = res.heros[index];
                this.slabel.setColor(cc.c4b(171,61,59,0));
                this.sleepbalel.setColor(cc.c4b(171,61,59,0));
            }
            this.playerlogo.initWithFile(player_img);
            this.playerlogo.setAnchorPoint(0, 0);
            this.playerlogo.setScale(gamescale,gamescale);

        }
        else
        {
            this.slabel.setString("");
            this.slabel.setPosition(this.logowidth * this.logoscale + offsetX, this.labelheight+offsetY);
            this.sleepbalel.setString("");
            this.sleepbalel.setPosition(this.logowidth * this.logoscale + offsetX, offsetY);
            this.playerlogo.setPosition(-10, (1.5 * this.labelheight * 2 - this.logowidth * this.logoscale) / 2 + 10);
            //this.playerstatus.setString("死亡");
            this.playerstatus.setPosition(this.logowidth * this.logoscale + offsetX, 3 * this.labelheight+offsetY);
            this.death.setVisible(true);
            if(enemyFlag){
                var death_img = res.death_enemyheros[index];
            }else{
                var death_img = res.death_heros[index];
            }
            this.slabel.setColor(cc.c4b(128,128,128,0));
            this.sleepbalel.setColor(cc.c4b(128,128,128,0));
            this.playerlogo.initWithFile(death_img);
            this.playerlogo.setAnchorPoint(0, 0);
            this.playerlogo.setScale(1,1);
            //this.playerlogo.setColor(cc.c4b(70,70,70, 255));
            this.playerlogo.setPosition(-10, (1.5 * this.labelheight * 2 - this.logowidth * this.logoscale) / 2 + 10);
        }

    },
    setscore: function (score) {
        this.slabel.setString("score: " + score);
    }
});

var HeroLayer = cc.Layer.extend({
    mapheight: 30,
    herouninit: true,
    ctor: function (height) {
        this._super();
        this.mapheight = height;
        this.heronum = 0;
        this.heros = [];
    },
    initplayer: function (teams) {
        this.ignoreAnchorPointForPosition(false);
        //添加队伍
        this.heros = [];
        for(var i = 0; i < teams.length; i++) {
            for(var j = 0; j < teams[i].team_player_id_list.length; j++) {
                var tmphero;
                if(i == 0)
                {
                    tmphero = new Hero(teams[i].team_player_id_list[j], res.heros[j]);                    
                }
                else
                {
                    tmphero = new Hero(teams[i].team_player_id_list[j], res.enemyheros[j]);                    
                }
                tmphero.setVisible(false);
                tmphero.setAnchorPoint(0, 0);;
                tmphero.setScale(0.6*gamescale,0.6 * gamescale);
                this.addChild(tmphero, 2);
                this.heros.push(tmphero);
            }
        }
    },
    setherolayer: function (players, map) {
        this.map = map;
        if(this.herouninit) {
            this.herouninit = false;
            for(var i = 0; i < players.length; i++) {
                var tmphero = this.heros[i];
                tmphero.setVisible(true);
                tmphero.setheroposition(players[i].x, players[i].y);
            }
        }else {
            for (var i = 0; i < players.length; i++) {
                var tmphero = this.heros[i];
                if(players[i].status == "dead")
                {
                    if(tmphero.status == "alive"){
                        tmphero.flashto(players[i].x, players[i].y);
                        /* 变黑 */
                        tmphero.godead();
                    }
                    else
                    {
                        /* 消失 */
                        tmphero.setVisible(false);
                    }
                    continue;
                }
                if(players[i].status == "alive" && tmphero.status == "dead"){
                    tmphero.setheroposition(players[i].x, players[i].y);
                    tmphero.revivetoo();
                    continue;
                }
                var tmpblock = this.isgates(players[i].x, players[i].y);
                if (tmpblock.isgate || !this.isajacent(tmphero.posx, tmphero.posy, players[i].x, players[i].y)) {
                    tmphero.flashto(players[i].x, players[i].y);
                } else {
                    tmphero.movetox(players[i].x, players[i].y);
                }
            }
        }
    },
    isajacent: function(x1, y1, x2, y2) {
        if(x1 == x2 && ((y1 - y2) == 1 || (y2 - y1 == 1)))
        {
            return true;
        }
        if(y1 == y2 && ((x1 - x2) == 1 || (x2 - x1 == 1)))
        {
            return true;
        }
        return false;
    },
    isbelts: function (x, y) {
        ;
    },
    isgates: function (x, y) {
        var gates = this.map.gates;
        for(var i = 0; i < gates.length; i++) {
            if(x == gates[i].posx && y == gates[i].posy) {
                for(var j = 0; j < gates.length; j++) {
                    if(i != j && gates[i].id == gates[j].id) {
                        return {isgate:true, x: gates[j].posx, y:gates[j].posy};
                    }
                }
            }
        }
        return {isgate:false, x: 0, y: 0};
    },
    /*findhero: function (id) {
        for(var i = 0; i < this.heros.length; i++){
            if(this.heros[i].id == id)
            {
                return this.heros[i];
            }
        }
    }*/
});
var PictureNumber = cc.Sprite.extend({
    m_Number:null,
    m_NumberTexture:null,
    ctor:function(){
        this._super();
        
    },
    buildNumber:function(paramNumber, paramTexture,layer)
    {
        this.setNumber(paramNumber);
        this.setNumberTexture(cc.TextureCache.getInstance().addImage(paramTexture));
        return this.build(layer);
    },
    build:function(layer){

        var iNumCount = (this.m_Number+"").length;   //取得字符个数
        var stSize = this.m_NumberTexture.getContentSize(); //取得纹理大小，要求纹理中每个数字都是等宽等高，并依照0123456789排列
        
        var iNumWidth = parseInt( stSize.width / 10);    //纹理中每个数字的宽度
        var iNumHeight =  parseInt( stSize.height);    //纹理中每个数字的高度

        //var pRT = new cc.RenderTexture(iNumWidth * iNumCount, iNumHeight); //创建渲染纹理对象，并数字确定宽度
        
        
        
        //pRT.begin();
        for (var i = 0; i < iNumCount; i++)
        {
            var pSprite   = new cc.Sprite(); //创建精灵对象，用于绘制数字
            pSprite.setAnchorPoint(0, 0);
            //pSprite.setTexture(this.m_NumberTexture);
            var iNumber = (this.m_Number+"")[i];
            var index = parseInt(iNumber);
            pSprite.initWithFile(res.numbers_list[index]);
            //设置要显示数字的纹理区域，这个区域是指参数中paramTexture中区域
            var stRect = new cc.rect(iNumber * iNumWidth, 0, iNumWidth, iNumHeight);
            //pSprite.setTextureRect(stRect, false, cc.size(stRect.width, stRect.height));
            pSprite.setPosition(i * iNumWidth, 0);                  //计算显示的偏移位置
            //pSprite.visit(); //渲染到pRT中
            layer.addChild(pSprite,3);
        }
        //pRT.end();
        //取得生成的纹理
        //this.setTexture(pRT.getSprite().getTexture());
        //设置显示的内容
        //var stRect = new cc.rect(0, 0, iNumWidth * iNumCount, iNumHeight);
        //this.setTextureRect(stRect, false, cc.size(stRect.width, stRect.height));
        //默认的情况下，通过CCRenderTexture得到的纹理是倒立的，这里需要做一下翻转
        //this.setFlippedY(true);
    },
    
    setNumber:function(paramNumber){
        this.m_Number = paramNumber;
    },
    getNumber:function(){
        return this.m_Number;
    },
    setNumberTexture:function(paramTexture)
    {
        this.m_NumberTexture = paramTexture;
    }
});
var ScoreLayer = cc.Layer.extend({
    labels: [],
    labelspic: [],
    playerscore: [],
    team_name: ['',''],
    ctor: function () {
        this._super();
    },
    initscorelayer: function (msg) {
        var size = cc.Director.getInstance().getWinSize();
        this.size = size;
        this.ignoreAnchorPointForPosition(false);
        this.roundlabel = cc.LabelTTF.create('0', fonttype, 28);
        this.roundlabel.setAnchorPoint(0, 0);
        this.roundlabel.setPosition(380, 20);
        this.addChild(this.roundlabel, 2);
        this.teamscores = [];
        this.scores = [];
        this.modename = (msg.mode == "light" ? res.attack : res.defend);
        this.curmode = cc.LabelTTF.create(this.modename, fonttype, 28);
        this.curmode = cc.Sprite.create();
        this.curmode.initWithFile(this.modename)
        this.curmode.setAnchorPoint(0, 0);
        this.curmode.setPosition(130, 20);
        this.addChild(this.curmode, 2);
        this.pScore = [];

        for(var i = 0; i < msg.teams.length; i++)
        {
            var team = msg.teams[i];

            this.teamscores[i] = [];

            this.scores[i] = cc.LabelTTF.create(team.point, fonttype, 80);
            this.scores[i].setAnchorPoint(0.5, 0.5);
            this.scores[i].setPosition(i * rightedgex + 60 * size.width / 1280, size.height - 80);
            //pNum.setAnchorPoint(0.5, 0.5);
            //pNum.setPosition(i * rightedgex + 60 * size.width / 1280, size.height - 80);
            this.addChild(this.scores[i], 2);
            //this.addChild(this.pNum, 2);
           //}
            

            //this.teamscores[i][0] = cc.LabelTTF.create((i == 0 ? "破壁者" : "面壁人"), fonttype, 32);
            this.teamscores[i][0] = cc.LabelTTF.create((i == 0 ? "" : ""), fonttype, 32);
            this.addChild(this.teamscores[i][0], 2);
			this.teamscores[i][0].setAnchorPoint(0.5, 0.5);
            this.teamscores[i][0].setPosition(i * rightedgex + 60 * size.width / 1280, size.height - 150);
            this.teamscores[i][1] = cc.LabelTTF.create( team.team_name, fonttype, 28);
           
            
            this.team_name[i] = team.team_name;
            this.teamscores[i][2] = cc.LabelTTF.create("队伍id：" + team.team_id, fonttype, 22);
            this.teamscores[i][3] = cc.LabelTTF.create("得分：" + 0, fonttype, 22);
            this.teamscores[i][4] = cc.LabelTTF.create("人数：", fonttype, 22);
            if(i==0){
                this.teamscores[i][1].setColor(cc.c4b(253,161,161,255));
                this.teamscores[i][2].setColor(cc.c4b(149,106,71,255));
                this.teamscores[i][3].setColor(cc.c4b(149,106,71,255));
                this.teamscores[i][4].setColor(cc.c4b(149,106,71,255));
            }else{
                this.teamscores[i][1].setColor(cc.c4b(179,247,253,255));
                this.teamscores[i][2].setColor(cc.c4b(148,105,70,255));
                this.teamscores[i][3].setColor(cc.c4b(148,105,70,255));
                this.teamscores[i][4].setColor(cc.c4b(148,105,70,255));
            }
            for(var k = 1; k < this.teamscores[i].length; k++){
                this.addChild(this.teamscores[i][k], 2);
                this.teamscores[i][k].setAnchorPoint(0, 0);
                this.teamscores[i][k].setPosition(i * rightedgex - 20, size.height - k * 30 - 240);
            }
            for(var j = 0; j < team.team_player_id_list.length; j++) {
                var heroscore = new scoreLabel((i == 0 ? res.heros[j] : res.enemyheros[j]));
                var isEnemy = (i==0) ?  false: true;
                var index = j%4;
                this.playerscore[i * team.team_player_id_list.length + j] = heroscore;
                heroscore.initscorelabel({player_id:team.team_player_id_list[j],point:0, sleep:0,team_id:team.team_id},isEnemy,index);
                this.addChild(heroscore, 2);
                heroscore.setAnchorPoint(0, 0);
                if(!isEnemy){
                    heroscore.setPosition(i * rightedgex + 75, (3-j) * 125 + 95);
                }else{
                    heroscore.setPosition(i * rightedgex - 10 , (3-j) * 125 + 95);
                }
                
            }
        }
    },
    setscorelayer: function (msg, round) {
        this.roundlabel.setString(msg.round_id);
        this.modename = (msg.mode == "light" ? res.attack : res.defend);
        this.curmode.initWithFile(this.modename);
        this.curmode.setAnchorPoint(0, 0);
        this.curmode.setPosition(130, 20);
        //this.removeChild(100);
        //this.removeAllChildren();
        this.pScore = [];
       
        
        for(var i = 0; i < msg.teams.length; i++)
        {
            var team = msg.teams[i];
            //this.scores[i].setString(team.point);
            //this.pNum.buildNumber(team.point, res.numbers,this);
            var iNumCount = (team.point+"").length;   //取得字符个数
            if(iNumCount>2){
                var offsetx = -60;
            }else if(iNumCount==2){
                var offsetx =  -30;
            }else{
                var offsetx =  0;
            }
            for (var j = 0; j < iNumCount; j++)
            {
                var old = this.getChildByTag('tag_'+i+j);
                if(old){
                    this.removeChild(old);
                }
                var pSprite   = new cc.Sprite(); //创建精灵对象，用于绘制数字
                pSprite.setAnchorPoint(0.5, 0.5);
                var iNumber = (team.point+"")[j];
                var index = parseInt(iNumber);
                pSprite.initWithFile(res.numbers_list[index]);
                pSprite.setPosition(i * rightedgex + 60 * this.size.width / 1280 + 40* j +offsetx , this.size.height - 80);                  //计算显示的偏移位置
                this.pScore.push(pSprite);
                this.addChild(pSprite,100,'tag_'+i+j);
                
            }
            // for (k=0;k<this.pScore.length;k++){
            //     this.addChild(this.pScore[k],100,'pscore');
            // }
            this.teamscores[i][3].setString("得分：" + team.point);
            this.teamscores[i][4].setString("人数：" + team.remain_life);
        }
        for(var j = 0; j < msg.players.length; j++) {
            if(j<4){
                this.playerscore[j].initscorelabel(msg.players[j],false,j);
            }else{
                this.playerscore[j].initscorelabel(msg.players[j],true,j-4);
            }
            
        }
    }
});

var Belt = cc.Sprite.extend({
    ctor: function () {
        this._super();
    },
    initbelt: function (type) {
        this.dir = type;
        if(type == "up"){
            this.initWithFile(res.belts_up);
        }else if(type == "down"){
            this.initWithFile(res.belts_down);
        }else if(type == "left"){
            this.initWithFile(res.belts_left);
        }else if(type == "right"){
            this.initWithFile(res.belts_right);
        }
        this.setScale(0.8*gamescale, 0.8 * gamescale);
    },
    setbeltposition: function(x, y){
        this.posx = x;
        this.posy = y;
        y = realmapheight - y - 1;
        this.setPosition(x * blockwidth, y * blockheight);
        this.setAnchorPoint(0, 0);
    }
});

var Fog = cc.Sprite.extend({
    ctor: function () {
        this._super();
    },
    initfog: function (type) {
        this.initWithFile(res.fogs);
        this.setScale(0.8*gamescale, 0.8*gamescale);
    },
    setfogposition: function(x, y){
        this.posx = x;
        this.posy = y;
        y = realmapheight - y - 1;
        this.setPosition(x * blockwidth, y * blockheight);
        this.setAnchorPoint(0, 0);
    }
});

var Gate = cc.Sprite.extend({
    ctor: function () {
        this._super();
    },
    initgate: function (id) {
        this.id = id;
        this.initWithFile(res.gates);
        this.setScale(0.8*gamescale, 0.8*gamescale);
    },
    setgateposition: function(x, y){
        this.posx = x;
        this.posy = y;
        y = realmapheight - y - 1;
        this.setPosition(x * blockwidth, y * blockheight);
        this.setAnchorPoint(0, 0);
    }
});

var Wall = cc.Sprite.extend({
    ctor: function () {
        this._super();
    },
    initwall: function () {
        this.initWithFile(res.map_wall);
        this.setScale(0.8*gamescale, 0.8*gamescale);
    },
    setwallposition: function(x, y){
        this.posx = x;
        this.posy = y;
        y = realmapheight - y - 1;
        this.setPosition(x * blockwidth, y * blockheight);
        this.setAnchorPoint(0, 0);
    }
});




var MapLayer = cc.Layer.extend({
    ctor: function(){
        this._super();
        this.map_blocks = [];
        this.belts = [];
        this.fogs = [];
        this.gates = [];
        this.map_mines = [];
        
    },
    initmaplayer: function(msg){
        this.ignoreAnchorPointForPosition(false);
        this.mapwidth = msg.map_size.width;
        this.mapheight = msg.map_size.height;
        //var tmpbackground= new mapbackground("light", 0, 0);
        //this.addChild(tmpbackground, 0);
        //this.background = tmpbackground;
        
        for(var y = 0; y < this.mapheight; y++){
            this.map_blocks[y] = [];
            for(var x = 0; x < this.mapwidth; x++){
                var tmpBlock = new mapblock(res.map_block);
                tmpBlock.initmapblock(x, y);
                this.addChild(tmpBlock, 3);
                this.map_blocks[y][x] = tmpBlock;
            }
        }
        if (checkArray(msg.belts) == true){
            for(var i = 0; i < msg.belts.length; i++){
                var tmpbelt = new Belt();
                tmpbelt.initbelt(msg.belts[i].dir);
                tmpbelt.setbeltposition(msg.belts[i].x, msg.belts[i].y);
                this.addChild(tmpbelt, 5);
                this.belts[i] = tmpbelt;
            }
        }

        if (checkArray(msg.fogs) == true){
            for(var i = 0; i < msg.fogs.length; i++) {
                var tmpfog = new Fog();
                tmpfog.initfog();
                tmpfog.setfogposition(msg.fogs[i].x, msg.fogs[i].y);
                this.addChild(tmpfog, 5);
                this.fogs[i] = tmpfog;
            }
        }

        if (checkArray(msg.gates) == true){
            for(var i = 0; i < msg.gates.length; i++) {
                var tmpgate = new Gate();
                tmpgate.initgate(msg.gates[i].name);
                tmpgate.setgateposition(msg.gates[i].x, msg.gates[i].y);
                this.addChild(tmpgate, 5);
                this.gates[i] = tmpgate;
            }
        }

        if (checkArray(msg.walls) == true){
            for(var i = 0; i < msg.walls.length; i++) {
                var tmpwall = new Wall();
                tmpwall.initwall();
                tmpwall.setwallposition(msg.walls[i].x, msg.walls[i].y);
                this.addChild(tmpwall, 5);
                this.fogs[i] = tmpwall;
            }
        }
    },
    setmaplayer: function (msg) {
        if(msg.mode != null){
            this.setbackground(msg.mode);            
        }
        else{
            this.setbackground("light");
        }
        this.setmines(msg.mines);
    },
    setmines: function (mines) {
        for(var i = 0; i < this.map_mines.length; i++) {
            this.removeChild(this.map_mines[i], true);
            this.map_mines[i] = null;
        }
        if (checkArray(mines) != true){
            this.map_mines.length = 0;
            return;
        }
        for(var i = 0; i < mines.length; i++){
            tmpmine = new Mine();
            tmpmine.initmine(mines[i]);
            tmpmine.setmineposition(mines[i].x, mines[i].y);
            this.addChild(tmpmine, 7);
            this.map_mines[i] = tmpmine;
        }
        this.map_mines.length = mines.length;
    },
    setbackground: function(type) {
        //this.background.setmapbackgroundpic(type);
    }
});

var SingleScoreLabel = cc.Layer.extend({
    ctor: function(){
        this._super();
    },
    initsingle:function (id, name, point1, point2, point3) {
        var size = cc.Director.getInstance().getWinSize();
        this.scorelabel = [];
        this.scorelabel[0] = cc.LabelTTF.create(""+ id, fonttype, 30);
        this.scorelabel[1] = cc.LabelTTF.create(""+ name, fonttype, 30);
        this.scorelabel[2] = cc.LabelTTF.create((point1 == 0 ? "0" : point1), fonttype, 30);
        this.scorelabel[3] = cc.LabelTTF.create((point2 == 0 ? "0" : point2), fonttype, 30);
        this.scorelabel[4] = cc.LabelTTF.create((point3 == 0 ? "0" : point3), fonttype, 30);

        for(var i = 0; i < this.scorelabel.length; i++)
        {
            this.scorelabel[i].setAnchorPoint(0.5, 0.5);
            this.scorelabel[i].setPosition(80, size.height/2 - i * 90);
            this.scorelabel[i].setColor(cc.c4b(0,0,0, 0));;
            this.addChild(this.scorelabel[i], 2);
        }
    }

});
var Gameover = cc.Sprite.extend({
    ctor: function(type, x, y){
        this._super();
        this.posx = x;
        this.posy = y;
        this.backstatus = type;
        this.initWithFile(res.map_game_over);
        this.setPosition(this.posx, this.posy);
        this.setAnchorPoint(0, 0);
        //this.setVisible(false);
        this.setVisible(true);
    },
    initmapbackground: function(pic){
        this.initWithFile(pic);
        var scaleratex = 1;
        var scaleratey = 1;
        scaleratex = mappixelheight/this.getContentSize().width;
        scaleratey = mappixelheight/this.getContentSize().height;
        this.setAnchorPoint(0, 0);        
        this.setPosition(0, 0);
        this.setScale(scaleratex / mapscalex, scaleratey / mapscaley);
    }
});

var GameOverLayer = cc.Layer.extend({
    ctor: function () {
        this._super();
        //set bachground image
        this.gameover = new Gameover('light',65,81)
    },
    setgameoverlayer: function(score){
        this.ignoreAnchorPointForPosition(false);
        var size = cc.Director.getInstance().getWinSize();
        //set bachground image
        
        console.log('game over');
        this.addChild(this.gameover,1)
        this.scorelabel = [];
        //this.scorelabel[0] = cc.LabelTTF.create("比赛结束", fonttype, 100);;
        this.scorelabel[1] = new SingleScoreLabel();
        this.scorelabel[2] = new SingleScoreLabel();
        this.scorelabel[3] = new SingleScoreLabel();

        //this.scorelabel[1].initsingle("队伍ID", "队伍名称", "第一回合", "第二回合", "合计");
        this.scorelabel[2].initsingle(score[0][0].team_id, score[0][0].name, score[0][0].point, score[1][0].point, (score[0][0].point + score[1][0].point));
        this.scorelabel[3].initsingle(score[0][1].team_id, score[0][1].name, score[0][1].point, score[1][1].point, (score[0][1].point + score[1][1].point));

        //this.scorelabel[0].setAnchorPoint(0.5, 0.5);
        //this.scorelabel[0].setPosition(size.width/2 - 120, size.height - 220);
        //this.addChild(this.scorelabel[0], 2);
        for(var i = 1; i < this.scorelabel.length; i++)
        {
            this.scorelabel[i].setAnchorPoint(0, 0);
            this.scorelabel[i].setPosition(i*320 -150, 200);
            this.addChild(this.scorelabel[i], 2);
        }
    },
});

var MenuLayer = cc.Layer.extend({
    ctor: function () {
        this._super();
    },
    initmenu: function () {
        var meanuscale = 1;
        var basepos = -130;
        var basestep = 50;
        var baseheight = -20;
        this.ignoreAnchorPointForPosition(false);
        var size = cc.Director.getInstance().getWinSize();
        
        var pp  = cc.MenuItemImage.create(
            res.PP_normal,
            res.PP_normal,
            function () {
                if(pausegame) {
                    return;
                }
                if(interval >= 0.8) {
                    return;
                }
                interval += 0.1;
                //var slow = Math.round(interval/timerInterval)/10;
                //this.pinfo.setString("PLAY "+slow+"s");
            }, this);

        pp.setPosition(basepos, baseheight);
        pp.setAnchorPoint(0, 0);
        pp.setScale(meanuscale, meanuscale);

        var pause  = cc.MenuItemImage.create(
            res.pause_normal,
            res.pause_normal,
            function () {
                interval = 0.5;
                pausegame = true;
                
                this.pinfo.setString("Pause");
            }, this);

        pause.setPosition(basepos + basestep, baseheight);
        pause.setAnchorPoint(0, 0);
        pause.setScale(meanuscale, meanuscale);


        var play  = cc.MenuItemImage.create(
            res.play_normal,
            res.play_normal,
            function () {
                pausegame = false;
                interval = 0.5;
                var slow = Math.round(interval/timerInterval)/10;
                this.pinfo.setString("PLAY "+slow+"s");
            }, this);

        play.setPosition(basepos + 2 * basestep, baseheight);
        play.setAnchorPoint(0, 0);
        play.setScale(meanuscale, meanuscale);

        var ff  = cc.MenuItemImage.create(
            res.FF_normal,
            res.FF_normal,
            function () {
                if(pausegame) {
                    return;
                }
                if(interval < 0.15) {
                    return;
                }
                interval -= 0.1;
                var slow = Math.round(interval/timerInterval)/10;
                this.pinfo.setString("PLAY "+slow+"s");
            }, this);

        ff.setPosition(basepos + 3 * basestep, baseheight);
        ff.setAnchorPoint(0, 0);
        ff.setScale(meanuscale, meanuscale);

        var stop  = cc.MenuItemImage.create(
            res.stop_normal,
            res.stop_normal,
            function () {
                stopgame = true;
                interval = 0.5;
                this.pinfo.setString("Stop");
            }, this);

        stop.setPosition(basepos + 4 * basestep, baseheight);
        stop.setAnchorPoint(0, 0);
        stop.setScale(meanuscale, meanuscale);
        var menu = cc.Menu.create(pause,pp,ff,play,stop);
        menu.setPosition(0, 0);
        menu.setAnchorPoint(0, 0);
        this.addChild(menu, 5);
        
        this.pinfo = cc.LabelTTF.create("", "Tahoma", 18);
        this.pinfo.setPosition(basepos + 5 * basestep + 30, -10);
        this.addChild(this.pinfo, 5);
        if (pausegame == true)
        {
            this.pinfo.setString("Pause");
        }
        else
        {
            var slow = Math.round(interval/timerInterval)/10;
            this.pinfo.setString("PLAY "+slow+"s");
        }
    }
});

var GameLayer = cc.Layer.extend({
    ctor: function () {
        this._super();
        var size = cc.Director.getInstance().getWinSize();
        //添加定时器
        interval = 0.5;
        this.timerCnt = 0;
        this.timer = cc.Timer.timerWithTarget(this, this.timeout, timerInterval);
        this.setTouchEnabled(true);
        this.scheduleUpdate();
        
        this.ignoreAnchorPointForPosition(false);


        //解析message
        this.fd = open();
        this.intervalid = start(this.fd);
        this.gameindex = 0;
        this.gameroundcnt = 0;
        this.gameleg = 0;
        this.teamscore = [];

        this.menulayer = new MenuLayer();
        this.menulayer.initmenu();
        this.addChild(this.menulayer, 20);
        this.menulayer.setPosition(size.width - 240, 40);
        this.menulayer.setAnchorPoint(0, 0);
        
        var tmpbackground= new mapbackground("light", 0, 0);
        this.addChild(tmpbackground, 0);
        this.background = tmpbackground;
        this.background.setAnchorPoint(0, 0);
        
        mappixelwidth = size.width;
        mappixelheight = size.height;
    },
    gamestart: function (msg) {
        this.max_round = msg.max_round;
        this.switch_round = msg.switch_round;
        var size = cc.Director.getInstance().getWinSize();
        this.mapwidth = msg.map_size.width;
        this.mapheight = msg.map_size.height;
        realmapweidth = this.mapwidth;
        realmapheight = this.mapheight;
        gamescalepixel = (size.height * 830 / 960) / this.mapheight;
        gamescale = 830 / this.mapwidth / 64 *1.25;
        //gamescale=1;
        mapscalex = gamescale;
        mapscaley = gamescale;
        var buttomeheight = size.height * gamebuttomheight / 960;
        var leftedgewidth = size.width * 220 / 1280;
        this.ignoreAnchorPointForPosition(false);

        leftedgex = 0;
        middleedgex = leftedgewidth;
        rightedgex = size.width * 1100 / 1280;
        
        //clean
        if (typeof this.heroplayer == "object")
            this.heroplayer.removeAllChildren (true);
        
        if (typeof this.heroplayer == "object")
            this.scorelayer.removeAllChildren (true);
        
        if (typeof this.maplayer == "object")
            this.maplayer.removeAllChildren (true);
        
        if (typeof this.heroplayer == "object")
            this.heroplayer.removeFromParent(true);
        
        if (typeof this.scorelayer == "object")
            this.scorelayer.removeFromParent(true);
        
        if (typeof this.maplayer == "object")
            this.maplayer.removeFromParent(true);

        //new
        this.heroplayer = new HeroLayer(this.mapheight);
        this.maplayer = new MapLayer();
        this.scorelayer = new ScoreLayer();
        this.gameoverlayer = new GameOverLayer();
        this.leftbackground   = new edgebackground(res.map_background_left);
        this.rightbackground  = new edgebackground(res.map_background_right);


        this.maplayer.initmaplayer(msg);
        //this.maplayer.setScale(gamescale, gamescale);
        this.heroplayer.initplayer(msg.teams);
        //this.heroplayer.setScale(gamescale, gamescale);
        this.scorelayer.initscorelayer(msg);


        this.addChild(this.heroplayer, 15);
        this.addChild(this.maplayer, 3);
        this.addChild(this.scorelayer, 3);
        this.addChild(this.gameoverlayer, 3);
        this.addChild(this.leftbackground , 0);
        this.addChild(this.rightbackground , 0);        

        this.maplayer.setPosition(middleedgex, buttomeheight);
        this.maplayer.setAnchorPoint(0, 0);
        this.heroplayer.setPosition(middleedgex, buttomeheight);
        this.heroplayer.setAnchorPoint(0, 0);
        this.scorelayer.setPosition(30, 0);
        this.scorelayer.setAnchorPoint(0, 0);
        this.gameoverlayer.setPosition(100, 0);
        this.gameoverlayer.setAnchorPoint(0, 0);
        this.leftbackground.setbackgroundpos(0, 0);
        this.leftbackground.setAnchorPoint(0, 0);
        this.rightbackground.setbackgroundpos(rightedgex, 0);
        this.rightbackground.setAnchorPoint(0, 0);

        return true;
    },
    gameround: function (msg) {
        this.maplayer.setmaplayer(msg);
        this.heroplayer.setherolayer(msg.players, this.maplayer);
        this.scorelayer.setscorelayer(msg, this.gameroundcnt);
        this.leftbackground.setedgebackground();
        this.rightbackground.setedgebackground();
        this.updateeffectmusic(msg);

    },
    gameend: function (msg) {
        this.heroplayer.removeAllChildren (true);
        this.scorelayer.removeAllChildren (true);
        this.maplayer.removeAllChildren (true);
        this.heroplayer.removeFromParent(true);
        this.scorelayer.removeFromParent(true);
        this.maplayer.removeFromParent(true);
        if(this.gameleg == 2) {
            this.gameoverlayer.setgameoverlayer(this.teamscore);
            this.background.removeFromParent(true);
            this.menulayer.removeFromParent(true);
        }
    },
    timeout: function() {
        if(pausegame) {    
            return;
        }
        
        this.timerCnt++;
        var slow = Math.round(interval/timerInterval);
        if (this.timerCnt%slow!=0)
            return;
        
        if(stopgame){
            this.gameindex = 0;
            this.timerCnt = 0;
            this.gameleg = 0;
            stopgame = false;
            pausegame = true;
            this.heroplayer.removeAllChildren (true);
            this.scorelayer.removeAllChildren (true);
            this.maplayer.removeAllChildren (true);
            this.heroplayer.removeFromParent(true);
            this.scorelayer.removeFromParent(true);
            this.maplayer.removeFromParent(true);
            audioEngine.stopMusic();
            return;
        }
            
        if (message.length <= this.gameindex) {
            return;
        }
        msg = message[this.gameindex];

        if (msg.block_name == "leg_start") {
            
            if (stopOnce == true)
            {
                this.gamestart(msg);
                pausegame = true;
                stopOnce = false;
            }
            else
            {
                this.gameindex++;
                this.gameroundcnt++;
                this.gamestart(msg);
                this.killnum=[0,0];
                audioEngine.playMusic(res.back_sound, true);
                audioEngine.setMusicVolume(0.1);
                audioEngine.setEffectsVolume(0.1);
            }
            
        } else if (msg.block_name == "round") {
            this.gameindex++;
            this.gameroundcnt++;
            this.gameround(msg);
        } else if (msg.block_name == "leg_end") {
            this.teamscore[this.gameleg] = [];
            for(var i = 0; i < 2; i++){
                var team_name = '';
                if (checkArray(this.scorelayer.team_name))
                    team_name = this.scorelayer.team_name[i];
                var teamscor = {team_id:msg.teams[i].team_id,point:msg.teams[i].point,name:team_name};
                this.teamscore[this.gameleg][i] = teamscor;
            }
            this.gameleg++;
            this.gameindex++;
            this.gameroundcnt = 0;
            this.gameend(msg);
            audioEngine.stopMusic();

        }
    },
    update: function (dt) {
        this.timer.update(dt);
    },
    updateeffectmusic: function(msg){
        if((msg.effects != null && typeof msg.effects == "object") == false)
        {
            return;
        }  
        
        if(checkArray(msg.effects.kills) == true)
        {
            var modeid = msg.mode == "light"?0:1;
            this.killnum[modeid] += msg.effects.kills.length;
            if (msg.effects.kills.length == 2)
            {
                audioEngine.playEffect(res.kill2, false);
            }
            else if (msg.effects.kills.length == 3)
            {
                audioEngine.playEffect(res.kill3, false);
            }
            else
            {
                this.killnum[modeid] = this.killnum[modeid]>10?0:this.killnum[modeid];
                audioEngine.playEffect(res.kills[this.killnum[modeid]], false);
            }
        }
        if(checkArray(msg.effects.belts) == true)
        {
            //audioEngine.playEffect(res.belts_sound, false, 1.0, 0.0, 0.4);
        }
        if(checkArray(msg.effects.gates) == true)
        {
            audioEngine.playEffect(res.gates_sound, false);
        }
        if(checkArray(msg.effects.distroy_mines) == true)
        {
            audioEngine.playEffect(res.distroy_mines_sound, false);
        }
        if(checkArray(msg.effects.create_mines) == true)
        {
            //audioEngine.playEffect(res.create_mines_sound, false);
        }
    }
});

var GameScene = cc.Scene.extend({
    onEnter: function(){
        this._super();
        this.gamelayer = new GameLayer();
        this.addChild(this.gamelayer, 1);
        this.gamelayer.setPosition(0, 0);
        this.ignoreAnchorPointForPosition(false);
        this.setAnchorPoint(0, 0);
    }
});

