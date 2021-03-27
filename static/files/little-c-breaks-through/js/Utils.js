

// 产生随机数
function random(startInt, endInt) {
    var result = startInt + parseInt(Math.random() * (endInt - startInt + 1));
    return result;
}

// 矩形碰撞检测（非旋转）
function isCollisionWithRect(x1, y1, w1, h1, x2, y2, w2, h2){
    let result =  Math.abs((x1 + w1 / 2) - (x2 + w2 / 2)) <= (w1 + w2) / 2 &&
        Math.abs((y1 + h1 / 2) - (y2 + h2 / 2)) <= (h1 + h2) / 2;
    return result;
}

function isCollisionWithRect2(firstRect, secondRect){
    var x1 = firstRect.x;
    var y1 = firstRect.y;
    var w1 = firstRect.w;
    var h1 = firstRect.h;
    var x2 = secondRect.x;
    var y2 = secondRect.y;
    var w2 = secondRect.w;
    var h2 = secondRect.h;
    return isCollisionWithRect(x1, y1, w1, h1, x2, y2, w2, h2);
}

// 判断角色是否与地图相撞
function getCollisionWithMap(rect, map){
    let result = null;
    map.forEach(item => {
        if(isCollisionWithRect2(rect, item)) {
            result = item;
        }
    });
    return result;
}


// 游戏结束
function gameOver() {
    ctx.font = "60px Comic Sans MS";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "Orange"
    ctx.fillText("GAME OVER !", canvas.width / 2, canvas.height / 2);
    ctx.font = "24px Comic Sans MS";
    ctx.fillText(`You got ${score} points !`, canvas.width / 2, canvas.height / 2 + 48);
    clearTimeout(animatedId)
}

// 游戏胜利
function gameWin() {
    ctx.font = "60px Comic Sans MS";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "Orange"
    ctx.fillText(`You got ${score} points !`, canvas.width / 2, canvas.height / 2);
    clearTimeout(animatedId)
}

// 显示分数
function showScore(){
    ctx.textBaseline = "top";   // 设置文本基线，可选值top,middle,bottom
    ctx.textAlign = "left";     // 文本对齐，可选值left,center,right
    ctx.font = "40px Arial";    // 设置字体样式
    ctx.fillStyle = "#8CBB44"   // 设置猕猴桃绿色
    ctx.fillText("×"+score,canvas.width - 92, 39);
}