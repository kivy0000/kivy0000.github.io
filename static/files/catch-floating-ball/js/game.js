// 画布属性
var canv = document.getElementById("canvas");
var ctx = canv.getContext("2d");
var canvas_width = canv.getAttribute("width");
var canvas_height = canv.getAttribute("height");

var progressBar = document.getElementById("progressBar");
var finishCount = document.getElementById("finishCount");

// 弹力球对象
var Ball = function (x, y, r, color) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.color = color || 'rgb(0,0,0)';
    this.targetx;
    this.targety;
    this.dx;
    this.dy;
}
Ball.prototype.draw = function(){
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
    //ctx.strokeStyle = 'rgb(255,255,255)';
    ctx.stroke();
}


/*
 游戏对象
 参考设定值：10，100，60，0.02
            20，400，60，0.05
            20，400，30，0.1
 */
var Game = {
    det : 10,           // 增量
    square_sum : 100,   // 增量平方和
    fps : 30,           // 帧率
    factor : 0.05,      // 差异系数
    ballArr : [],       // 小球集合
    preset_time : 10,   // 预设时间
    time_consuming: 0,  // 耗时
    total_count : 0,    // 小球数量
    finish_count : 0,   // 完成数量
    intervalRun : {},
    intervalTimer : {}
}

// 数据初始化
Game.init = function (){
    clearInterval(this.intervalRun);
    clearInterval(this.intervalTimer);
    this.ballArr.length = 0;
    this.time_consuming = 0;
    this.total_count = 0;
    this.finish_count = 0;
    finishCount.innerText = Game.finish_count;
    this.total_count =  randomNum(8, 12);    // 随机小球数量
    for (var i = 0; i < this.total_count; i++) {
        var ball = new Ball();
        ball.r = randomNum(25, 30);    // 随机小球半径
        ball.x = ball.targetx = randomNum(ball.r, canvas_width - ball.r);
        ball.y = ball.targety = randomNum(ball.r, canvas_height - ball.r);
        ball.color = `rgb(${randomNum(255)}, ${randomNum(255)}, ${randomNum(255)})`;
        ball.dx = randomNum(2 * this.det) - this.det;
        ball.dy = parseInt(Math.sqrt(this.square_sum - ball.dx * ball.dx)) * randSign();
        this.ballArr.push(ball);
    }
}

Game.process = function () {
    var det = this.det;
    var square_sum = this.square_sum;
    var factor = this.factor;
    var ballArr = this.ballArr;
    ballArr.forEach(ball => {
        var dx = ball.dx;
        var dy = ball.dy;
        ball.targetx += dx;
        ball.targety += dy;
        // 判断越界处理
        if (ball.targetx <= 0) {
            ball.dx = randomNum(det);
            ball.dy = parseInt(Math.sqrt(square_sum - dx * dx)) * randSign();
        } else if (ball.targetx >= canvas_width) {
            ball.dx = - randomNum(det);
            ball.dy = parseInt(Math.sqrt(square_sum - dx * dx)) * randSign();
        }

        if (ball.targety <= 0) {
            ball.dx = randomNum(2 * det) - det;
            ball.dy = parseInt(Math.sqrt(square_sum - dx * dx));
        } else if (ball.targety >= canvas_height) {
            ball.dx = randomNum(2 * det) - det;
            ball.dy = - parseInt(Math.sqrt(square_sum - dx * dx));
        }
        // 未越界有10%概率改变方向
        if (randomNum(9) < 1) {
            ball.dx = randomNum(2 * det) - det;
            ball.dy = parseInt(Math.sqrt(square_sum - dx * dx)) * randSign();
        }
        // 计算新点，差量系数
        ball.x += parseInt((ball.targetx - ball.x) * factor);
        ball.y += parseInt((ball.targety - ball.y) * factor);
    });
}

Game.draw = function() {
    // 绘制小球
    this.ballArr.forEach(ball => {
        ball.draw();
    });
    // 绘制进度条   绿->黄->红
    var rate = (Game.preset_time - Game.time_consuming) / Game.preset_time;
    if (rate >= 0.5) {
        // 红色分量 0 -> 255
        progressBar.style.backgroundColor = `rgb(${512 * (1 - rate)}, ${255}, ${0})`;
    } else {
        // 绿色分量 255 -> 0
        progressBar.style.backgroundColor = `rgb(${255}, ${512 * rate}, ${0})`;
    }
    progressBar.style.width = `${rate * 100}%`;
}

// 胜利
Game.gameWin = function(){
    ctx.font = "60px Comic Sans MS";
    ctx.fillStyle = "rgb(255, 255, 255)"
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("You Win!", 320, 220);
}
// 失败
Game.gameOver = function(){
    ctx.font = "60px Comic Sans MS";
    ctx.fillStyle = "rgb(255, 255, 255)"
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("GAME OVER!", 320, 220);
}

Game.isLive = function () {
    // 游戏胜利
    if (Game.finish_count == Game.total_count) {
        return 1;
    }
    // 游戏结束
    if (Game.time_consuming >= Game.preset_time && Game.finish_count < Game.total_count) {
        return -1;
    }
    return 0;
}

// 游戏开始
Game.start = function() {
    // 运行定时器
    this.intervalRun = setInterval(function(){
        ctx.clearRect(0, 0, canvas_width, canvas_height); // 清屏
        Game.draw();
        if (Game.isLive() != 0) {
            clearInterval(Game.intervalTimer);
            if (Game.isLive() == 1) Game.gameWin();
            if (Game.isLive() == -1) Game.gameOver();
        } else {
            Game.process();
        }
    }, 1000 / this.fps);
    // 进度条定时器
    this.intervalTimer = setInterval(function () {
        Game.time_consuming += 0.05;
    },50);
}

Game.restart = function(){
    Game.init()
    Game.start()
    clickEffect(320, 240);
}


// 鼠标交互
document.getElementById("canvas").addEventListener("mousedown", function (event) {
    changeSound();
    if (Game.isLive() != 0) return;

    var x = event.offsetX;
    var y = event.offsetY;
    var flag = -1; // 一次点击删除最上层一个
    Game.ballArr.forEach((ball, index)=>{
        var dx = x - ball.x;
        var dy = y - ball.y;
        if (dx * dx + dy * dy <= ball.r * ball.r) {
            flag = index;
        }
    });
    // 消除
    if (flag != -1){
        Game.ballArr.splice(flag, 1);
        Game.finish_count += 1;
        finishCount.innerText = Game.finish_count;
        clickEffect(x, y); // 触发点击效果
    }
});

/*****************************
 开始
 *****************************/
Game.init()
Game.start()

function changeSound(){
    var audio = document.getElementById("audio");
    audio.play()
}