//=============================================================================
// KeyPublicEvents.js
//=============================================================================
/*:
* @plugindesc 按键绑定公共事件
* @author kanoko
*
* @param KeyA
* @desc 请输入公共事件的ID，默认为0
* @default 0
*
* @param KeyB
* @desc 请输入公共事件的ID，默认为0
* @default 0
*
* @param KeyC
* @desc 请输入公共事件的ID，默认为0
* @default 0
*
* @param KeyD
* @desc 请输入公共事件的ID，默认为0
* @default 0
*
* @param KeyE
* @desc 请输入公共事件的ID，默认为0
* @default 0
*
* @param KeyF
* @desc 请输入公共事件的ID，默认为0
* @default 0
*
* @param KeyG
* @desc 请输入公共事件的ID，默认为0
* @default 0
*
* @param KeyH
* @desc 请输入公共事件的ID，默认为0
* @default 0
*
* @param KeyI
* @desc 请输入公共事件的ID，默认为0
* @default 0
*
* @param KeyJ
* @desc 请输入公共事件的ID，默认为0
* @default 0
*
* @param KeyK
* @desc 请输入公共事件的ID，默认为0
* @default 0
*
* @param KeyL
* @desc 请输入公共事件的ID，默认为0
* @default 0
*
* @param KeyM
* @desc 请输入公共事件的ID，默认为0
* @default 0
*
* @param KeyN
* @desc 请输入公共事件的ID，默认为0
* @default 0
*
* @param KeyO
* @desc 请输入公共事件的ID，默认为0
* @default 0
*
* @param KeyP
* @desc 请输入公共事件的ID，默认为0
* @default 0
*
* @param KeyQ
* @desc 请输入公共事件的ID，默认为0
* @default 0
*
* @param KeyR
* @desc 请输入公共事件的ID，默认为0
* @default 0
*
* @param KeyS
* @desc 请输入公共事件的ID，默认为0
* @default 0
*
* @param KeyT
* @desc 请输入公共事件的ID，默认为0
* @default 0
*
* @param KeyU
* @desc 请输入公共事件的ID，默认为0
* @default 0
*
* @param KeyV
* @desc 请输入公共事件的ID，默认为0
* @default 0
*
* @param KeyW
* @desc 请输入公共事件的ID，默认为0
* @default 0
*
* @param KeyX
* @desc 请输入公共事件的ID，默认为0
* @default 0
*
* @param KeyY
* @desc 请输入公共事件的ID，默认为0
* @default 0
*
* @param KeyZ
* @desc 请输入公共事件的ID，默认为0
* @default 0
*
* @param Number0
* @desc 请输入公共事件的ID，默认为0
* @default 0
*
* @param Number1
* @desc 请输入公共事件的ID，默认为0
* @default 0
*
* @param Number2
* @desc 请输入公共事件的ID，默认为0
* @default 0
*
* @param Number3
* @desc 请输入公共事件的ID，默认为0
* @default 0
*
* @param Number4
* @desc 请输入公共事件的ID，默认为0
* @default 0
*
* @param Number5
* @desc 请输入公共事件的ID，默认为0
* @default 0
*
* @param Number6
* @desc 请输入公共事件的ID，默认为0
* @default 0
*
* @param Number7
* @desc 请输入公共事件的ID，默认为0
* @default 0
*
* @param Number8
* @desc 请输入公共事件的ID，默认为0
* @default 0
*
* @param Number9
* @desc 请输入公共事件的ID，默认为0
* @default 0
*
* @param Tab
* @desc 请输入公共事件的ID，默认为0
* @default 0
*
* @param End
* @desc 请输入公共事件的ID，默认为0
* @default 0
*
* @param Home
* @desc 请输入公共事件的ID，默认为0
* @default 0
*
* @help
* 在相对应的键位绑定公共事件即可。需要用到全键盘输入插件。
* https://taroxd.github.io/rpgmv-plugins/InputExtra.html
*/



//读取参数
var KeyParameters = PluginManager.parameters('KeyPublicEvents');

//如果未定义,则备份原update
if(Scene_Map.prototype.UpdateKEY === undefined){
        Scene_Map.prototype.UpdateKEY = Scene_Map.prototype.update;
}

//主方法
Scene_Map.prototype.update = function(){
    this.UpdateKEY.apply(this,arguments);//应用源 update 使用传入的参数表（无所谓方法定义到底有几个参数）
    KeyPublicEventsUpdate();
}

var KeyGp = {
        "KeyA" : 65,"KeyB" : 66,"KeyC" : 67,"KeyD" : 68,"KeyE" : 69,"KeyF" : 70,"KeyG" : 71,"KeyH" : 72,"KeyI" : 73,
        "KeyJ" : 74,"KeyK" : 75,"KeyL" : 76,"KeyM" : 77,"KeyN" : 78,"KeyO" : 79,"KeyP" : 80,"KeyQ" : 81,"KeyR" : 82,
        "KeyS" : 83,"KeyT" : 84,"KeyU" : 85,"KeyV" : 86,"KeyW" : 87,"KeyX" : 88,"KeyY" : 89,"KeyZ" : 90,"Home" : 36,
        "End" : 35,"Tab" : 9,"Number0" : 48,"Number1" : 49,"Number2" : 50,"Number3" : 51,"Number4" : 52,"Number5" : 53,
        "Number6" : 54,"Number7" : 55,"Number8" : 56,"Number9" : 57
};

function KeyPublicEventsUpdate(){
        for(var k in KeyGp){//遍历KeyGp中所有的键,所以K[]就代表了KeyGp的键值
                if(InputExtra.isTriggered(KeyGp[k]) && KeyParameters[k] !== 0){//判断是否按下 和 是否定义了事件ID
                    $gameTemp.reserveCommonEvent(KeyParameters[k]*1);//初始化事件
                       
                }
        }
}