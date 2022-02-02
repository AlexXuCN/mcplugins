let version = "0.1.1";

const config = new JsonConfigFile("./plugins/chatcolor/chatcolor.json", 
    JSON.stringify({
        "addcolor": true,
        "colors": [
            "黑=>0",
            "深蓝=>1",
            "深绿=>2",
            "湖蓝=>3",
            "深红=>4",
            "紫=>5",
            "金=>6",
            "灰=>7",
            "深灰=>8",
            "蓝=>9",
            "绿=>a",
            "天蓝=>b",
            "红=>c",
            "粉红=>d",
            "黄=>e",
            "白=>f",
            "粗体=>l",
            "斜体=>o"
        ]
//你可以在Minecraft Wiki找到所有的颜色代码
//https://minecraft.fandom.com/zh/wiki/%E6%A0%BC%E5%BC%8F%E5%8C%96%E4%BB%A3%E7%A0%81
    }));//读取配置

function addcolor(player,msg){
    var color
    if (config.get("addcolor")){
        for (colornumber in config.get("colors")){
            color = config.get("colors")[colornumber];
            msg = msg.replaceAll(color.split("=>")[0], "§" + color.split("=>")[1] + color.split("=>")[0] + "§r");
        }
    }
    mc.broadcast("<" + player.name + "> " + msg);
    return false;
};

mc.listen("onChat",addcolor);

colorLog("cyan","聊天变色插件已加载!");
colorLog("cyan","version: " + version);
colorLog("cyan","author: AlexXuCN");