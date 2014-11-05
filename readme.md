## 自用的部署工具
写这个小工具是为了方便自己在vps上部署nodejs app. 里面的设定都很个人化, 不一定适于推广.

### feature
* 在已经setup完毕的server app目录工作良好
* 定时pull更新
* npm install & gulp
* 将track文件夹拷贝到current文件夹下新建好的时间戳(`date "+%Y-%m-%d %H:%M:%S"`)文件夹内
* 将running软连接定位到该文件夹
* `pm2 restart`
* 清理目录: current只留下最近三个, 其余移到backup中
* 清理目录: backup留下最近10个
* 发送邮件通知, 成功时附带最近两次提交, 失败时附带部署过程中记录的msg

### 设定的目录结构
一个app在server部署的目录是这样的: 有track, current, backup三个目录, running一个软链接. 

* `./track` 追随git上的master分支, 可以通过`git your-repo-git track`生成, 以后脚本会在该目录中定时pull, 执行`npm install`和`gulp`命令, 前者可以最大限度的利用已有的包缓存, 不用每次都全量下载. 因此请注意包的version管理, 避免出现老的package不更新导致程序跑步起来的情况. 更新包后务必更新package.json
* `./current` 在track中执行完更新构建等工作后, 会将整个目录拷贝到current下的一个新建的当前时间的文件夹下, 这样的文件夹会保留最近三个
* `./backup` 当current目录的文件夹多于三个的时候, 就会被清理到这里, 这里会保存10个最近版本(backup10个+current3个, 共有13个版本)
* `./running` 软链接, 指向当前要运行的程序目录, 最开始setup的时候可以指向track, `ln -sfn track running`, 新建/强制覆盖软链接.

### deploy工具的安装 & 配置 & 启动
安装: 下载好这个包之后, `npm install`安装依赖的package.

配置: 

* app目录: 请在deploy.sh中修改`app="/Users/chenllos/Documents/dev/LIB/tt"`这个变量, 指向应用的绝对地址
* 邮件设置: 在当前目录下新建localConfig.js文件, 

按如下规则配置好您的邮件:

    module.exports = {
        sender: 'foo@gmail.com',
        pass: 'pass',
        receiver: "bar@163.com"
    };

程序在检测到有localConfig后就会读取.

* 运行脚本, 请使用`nohup sh ./deploy.sh &`运行, 后台运行, 且推出ssh后不会退出, log会输出在当前目录下的nohup.out文件中.

### 部署过程中的错误和回滚
当收到部署失败的邮件时, 请查看是哪里出了问题, 部署脚本会记录`npm install`,  `gulp`,  `pm2 restart`三个阶段的错误并添加在邮件内容中, 方便排查.

如果最新的代码部署后跑不起来, 可以连接到server, 停止nohup启动的deploy.sh脚本, 手动将running链接修改到较老的current子目录或者backup子目录. 执行`pm2 restart running/you-app-file.js`. 待排查出代码问题后再启动部署脚本, pull最新的脚本并部署.
