#!/bin/sh

shellPath=`pwd`

app="/Users/chenllos/Documents/dev/LIB/tt"
track="$app/track"
current="$app/current"
backup="$app/backup"

running="$app/running"
appFilePath="$running/app.js"

# 设定 部署结果为1时 表示成功, 这点和shell执行的process exit code不一样
depolyResult=0
errMsg=""

function copyTo(){
    echo "copy files from $1 to $2"
    cp -R "$1" "$2"
}

function softLinkTo(){
    echo "link $1 with running"
    ln -sfn "$1" "$running"
}

# *********************  部署脚本的流程  *********************
while true
do
    echo '\n ----------------------------------------------'
    curTime=`date "+%Y-%m-%d %H:%M:%S"`
    cd $track
    repoStatus=`git pull`
    # repoStatus="must deploy"
    if [ "$repoStatus" == "Already up-to-date." ]
        then
        echo "no need to depoly @$curTime"
    else
        echo $repoStatus
        echo "gonna deloy"
        # -----------------  有更新 执行部署  -----------------
        # ---  npm install --- 
        cnpm install
        echo "npm install result: $?"
        if [ $? -eq 0 ]
            then
            # ---  gulp build --- 
            gulp
            echo "gulp build done"
            if [ $? -eq 0 ]
                then
                # ---  new folder --- 
                newFolderName=`date "+%Y-%m-%d %H:%M:%S"`
                newDeploFolderPath="$current/$newFolderName"
                mkdir "$newDeploFolderPath"
                copyTo "$track" "$newDeploFolderPath"
                # ---  soft link --- 
                softLinkTo "$newDeploFolderPath/track"
                pm2 restart $appFilePath
                if [ $? -eq 0 ]
                    then
                    echo "depoly success!"
                    depolyResult=1
                    errMsg=''
                else
                    errMsg="pm2 restart err...: $?"
                    echo $errMsg
                fi
            else
                errMsg="gulp build err: $?"
                echo $errMsg
            fi
        else
            errMsg="npm install failed...: $?"
            echo $errMsg
        fi


        # send email and tell error or success this
        echo "gonna clean and send email: \n deploy return: $depolyResult, msg: $errMsg"

        cleanArgs="--appPath=$app"
        node "$shellPath/cleaner.js" $cleanArgs

        mailArgs="--result=$depolyResult --appPath=$app --msg=$errMsg  --cleanRes=$?"
        node "$shellPath/sendMail.js" $mailArgs
    fi

    # sleep 180
    sleep 300
    # sleep 600
done
