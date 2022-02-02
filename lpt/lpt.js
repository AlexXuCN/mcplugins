/*
我真的懒得加分号啊啊啊啊啊
Github Copilot真是太好用了
*/

logger.setConsole(true);
logger.setTitle("LPT");

const lptconfig = new JsonConfigFile("./plugins/lpt/lpt.json", JSON.stringify({
    "version": "0.1.0",
    "repo": "https://github.com/AlexXuCN/lpt-repo/raw/master/repo.json",
    "temppath": "./plugins/lpt/temp"
}));//读取配置

const packages = new JsonConfigFile("./plugins/lpt/packages.json", JSON.stringify({
    "packages": [
        {
            "id": "1",
            "name":"lpt",
            "type":"lxl",
            "location":"https://github.com/AlexXuCN/lpt-repo/raw/master/alexxucn/lpt.json",
            "channel":"stable",
            "filename":"lpt.js"
        }
    ]
    
}));//已安装的包

const lxlconfig = new IniConfigFile("./plugins/LiteXLoader/config.ini");
//lxl配置 用于读取plugins目录的位置（万一你改了呢）

/**
 * 显示帮助
*/
function lpthelp(){
    log("lpt - lxl包管理器");
    log("version: "+lptconfig.get("version"));
    log(" - help: 显示帮助");
    log(" - version: 显示版本号");
    log(" - update: 更新repo缓存");
    log(" - upgrade: 检查更新"); 
    log(" - search: 从缓存中搜索包");
    log(" - install: 从库中安装一个包");
    log("     lpt install <id|name> <id或包名> [channel]");
    log(" - remove: 移除一个包");
    log("     lpt remove <id|name> <id或包名>");
    log(" - list: 显示已安装的包");
    log(" - reload: 重载配置文件");
    log(" - dlfile: 尝试下载自定义文件到缓存目录");
    log("     lpt dlfile <url> <filename>");
}

/**
 * 下载文件到缓存目录
 * @param {string} url
 * @param {string} filename
*/
function lpt_dl2temp(url,filename) {
    log("Get: "+url);
    function savefile(status,result) {
        if(status==200){
        File.writeTo(lptconfig.get("temppath")+"/"+filename,result);
        log("下载成功! 文件保存于"+lptconfig.get("temppath").replace("./plugins"," BDS根目录/plugins")+"/"+filename);
        }else{
           colorLog("red","下载失败!");
        };
    }
    network.httpGet(url,savefile);
}

/**
 * 根据id移除包
 * @param {string} id
 */
function lpt_removepackage_by_id(id) {
    for (var i in packages.get("packages")) {
        if (packages.get("packages")[i].id == id) {
            if(!File.delete(lxlconfig.getStr("Main","PluginsDir","./plugins") + "/" + packages.get("packages")[i].filename)){
                log("错误: 无法删除文件!");
            }
            var packages0 = packages.get("packages");
            packages0.splice(i, 1);
            packages.set("packages",packages0);
            return true;
        }
    }
}

/**
 * 根据名称移除包
 * @param {string} name
*/
function lpt_removepackage_by_name(name) {
    for (var i in packages.get("packages")) {
        if (packages.get("packages")[i].name == name) {
            if(!File.delete(lxlconfig.getStr("Main","PluginsDir","./plugins") + "/" + packages.get("packages")[i].filename)){
                log("错误: 无法删除文件!");
            }
            var packages0 = packages.get("packages");
            packages0.splice(i, 1);
            packages.set("packages",packages0);
            return true;
        }
    }
}

/**
 * 根据id定位包
 * @param {string} id
 * @returns {string}
*/
function lpt_locatepackage_by_id(id) {
    repo = JSON.parse(File.readFrom(lptconfig.get("temppath")+"/repo.json"));
    for (var i in repo) {
        if (repo[i].id == id) {
            return repo[i].location;
        }
    }
}

/**
 * 根据名称定位包
 * @param {string} name
 * @returns {string}
*/
function lpt_locatepackage_by_name(name) {
    repo = JSON.parse(File.readFrom(lptconfig.get("temppath")+"/repo.json"));
    for (var i in repo) {
        if (repo[i].name == name) {
            return repo[i].location;
        }
    }
}

/**
 * 
 * @param {String} location
 * @param {String} channel
 * @returns {Array} 
 */
function lpt_installpackage(location,channel){
    package1 = JSON.parse(File.readFrom(location));
    log(+package1.name+" (id: "+package1.id+")");
    log("类型: "+package1.type);
    log("描述: "+package1.description);
    log("URL: "+package1.url);
    if(channel=="default"){
        channel = package1.channel[0];
    }
    lpt_dl2temp(package1.channels[channel].url,package1.channels[channel].filename);
    if (File.move(lptconfig.get("temppath")+"/"+package1.channels[channel].filename,lxlconfig.getStr("Main","PluginsDir","./plugins")+"/"+package1.channels[channel].filename)){
        return true;
    }else{
        return false;
    }
}


/**
 * 处理命令参数
 * @param {Array} args
*/
function lpt(args) {
    if(args.length==0){
        log("使用命令 lpt help 查看帮助");
    }else if(args[0]=="help"){
        lpthelp();
    }else if(args[0]=="update"){
        log("正在更新repo缓存...");
        if(!File.exists(lptconfig.get("temppath")+"/repo.json")){
            lpt_dl2temp(lptconfig.get("repo"),"repo.json");
        }else{
            if(!File.delete(lptconfig.get("temppath")+"/repo.json")){
                log("错误: 无法删除文件");
            }
            lpt_dl2temp(lptconfig.get("repo"),"repo.json");
        }
    }else if(args[0]=="upgrade"){
        log("lpt upgrade");
    }else if(args[0]=="search"){
        log("lpt search");
    }else if(args[0]=="install"){
       if(args.length < 3){
            log("参数不足!")
        }else if(args[1]=="id"){
            lpt_dl2temp(lpt_locatepackage_by_id(args[2]),args[2]+".json");
            if(args.length==4){
                if(lpt_installpackage(lptconfig.get("temppath")+"/"+args[2]+".json",args[3])){
                    log("安装成功!");
                }else{
                    log("安装失败!");
                };
            }else if(args.length==3){
                if(lpt_installpackage(lptconfig.get("temppath")+"/"+args[2]+".json","default")){
                    log("安装成功!");
                }else{
                    log("安装失败!");
                };
            }
        }else if(args[1]=="name"){
            lpt_dl2temp(lpt_locatepackage_by_name(args[2]),args[2]+".json");
        }else{
            log("参数错误!");
        }
    }else if(args[0]=="remove"){
        if(args.length < 3){
            log("参数不足!");
        }else if(args[1]=="id"){
            if(lpt_removepackage_by_id(args[2])){
                log("移除成功!");
            };
        }else if(args[1]=="name"){
            if(lpt_removepackage_by_name(args[2])){
                log("移除成功!");
            };
        }else{
            log("参数错误!");
        }
    }else if(args[0]=="list"){
        for(var i in packages.get("packages")){
            log(packages.get("packages")[i].name+" id: "+packages.get("packages")[i].id);
        }
    }else if(args[0]=="version"){
        log(lptconfig.get("version"));
    }else if(args[0]=="reload"){
        //mc.runcmdEx("lxl reload lpt.js");
        lptconfig.reload();
        packages.reload();
        lxlconfig.reload();
        log("已重载配置文件!");
    }else if(args[0]=="dlfile"){
        lpt_dl2temp(args[1],args[2]);
    }else{
        log('未知参数 "'+args[0]+'"');
        log("使用命令 lpt help 查看帮助");
    }
};

mc.regConsoleCmd("lpt","lxl包管理器",lpt);//注册指令

colorLog("cyan","lpt - lxl包管理器");
colorLog("cyan","version: "+lptconfig.get("version"));
colorLog("cyan","author: AlexXuCN");
colorLog("cyan","Type 'lpt help' for more information.");