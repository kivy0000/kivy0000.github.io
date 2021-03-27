
// 生成 [minNum, maxNum] 的随机数
function randomNum(minNum, maxNum){
     switch(arguments.length){
        case 1:
            return parseInt(Math.random() * (minNum + 1), 10);
            break;
        case 2:
            return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
            break;
        default:
            return 0;
            break;
    }
}

// 随机正负号
function randSign(){
    return randomNum(1) * 2 - 1;
}

