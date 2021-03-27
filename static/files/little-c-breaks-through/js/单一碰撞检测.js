
/* 常量值 */
const FPS = 60;             // 帧率
const G = 9.8;              // 重力加速度
const U = 0.8;              // 人物与地面摩擦系数
const V_MAX = 24;           // 角色最大速度
const A_STEP = 36;          // 控制角色的加速度
const JumpMaxHeight = 80;   // 角色最大跳跃高度
const T = 1 / FPS * 8;      // 单位时间

const KEY_LEFT = 65;    // 左键 A
const KEY_RIGHT = 68;   // 右键 D
const KEY_JUMP = 75;    // 跳键 K

/* 游戏变量 */
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var animated = null;
var clientWidth = document.documentElement.clientWidth;
var clientHeight = document.documentElement.clientHeight;

/* 键盘处理 */
var jump_pressed = false;
var left_pressed = false;
var right_pressed = false;


// 人物对象
class Hero{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 56;

        this.vx = 0;
        this.vy = 0;
        this.direction = 'S';
        this.isJump = true;

        this.img = new Image();
        this.img.src = "assets/hero.png";

        Hero.imgFlag = 0;
        Hero.sx = 0;
        Hero.sy = 0;
    }
    draw () {
        Hero.imgFlag++;
        //console.log(Hero.sx);
        ctx.drawImage(this.img, Hero.sx, Hero.sy, 90, 126, this.x, this.y, this.width, this.height);
        if (Hero.imgFlag % 2 == 0) {
            Hero.sx += 88;
        }
        if (Hero.sx > 88) Hero.sx = 0;
    }
    move () {
        ctx.fillStyle = '#f00';
        ctx.fillRect(floor.x, floor.y, floor.width, floor.height);
        ctx.fillStyle = '#0f0';
        ctx.fillRect(hero.x, hero.y, hero.width, hero.height);

        // 按键判断
        var a = 0;      // 角色控制加速度
        var a1 = 0;     // 摩擦力的加速度
        if (jump_pressed ) { // && !this.isJump
            this.isJump = true;
            this.vy = - Math.sqrt(2 * G * JumpMaxHeight);
        }
        if (left_pressed) {
            a -= A_STEP;
        }
        if (right_pressed) {
            a += A_STEP;
        }

        // 处理运动
        if (this.isJump == true) {  // 如果为空中状态
            var h = this.vy * T + 0.5 * G * T * T;
            this.vy = this.vy + G * T;
            this.y += h;
        } else {
            if (!touchFloor(hero, floor)){  // 如果没有接触地图，则为在空中的状态
                this.isJump = true;
            }
        }

        // y轴碰撞处理
        var isYAxisCollision = touchFloor(hero, floor);
        if(isYAxisCollision){
            // 说明y轴碰撞
            if (this.vy > 0)
                this.isJump = false;
            this.vy = 0;
            // 控制上下碰撞的情况
            var O_y1 = hero.y + hero.height;
            var O_y2 = floor.y + floor.height;
            if (O_y1 < O_y2) {      // 角色在上
                this.y = floor.y - hero.height;
            } else {                // 角色在下
                this.y = floor.y + floor.height;
            }
        }

        // 水平方向运动
        if (this.vx * a <= 0 && this.vx != 0) {         // 如果力和加速度反向
            var sign = - Math.abs(this.vx) / this.vx;   // 加速度方向（和当前速度相反）
            if(touchFloor(hero, floor))                 // 如果在地面上则计算摩擦力加速度
                a1 = sign * U * G ;                     // 由F = ma; f = uF; ma = umg; 推出 a = ug;
            else
                a1 = 0;
        }
        var tmp = this.vx;
        var s = this.vx * T + 0.5 * (a + a1) * T * T;  // 计算单位时间水平位移
        this.vx = this.vx + (a + a1) * T;              // 更新速度
        if (tmp * this.vx < 0)                         // 速度变化为负时停止运动 (与现实不同，清除惯性更快响应)
            this.vx = 0;
        this.x += s;                 // 更新横坐标

        // 水平方向碰到东西则停止水平方向运动
        if(!isYAxisCollision && touchFloor(hero, floor)) {
            // 说明x轴碰撞
            this.x = this.x - s;
            this.vx = 0;
            a = 0;
            a1 = 0;
        }

        // 限制水平方向运动边界
        if (this.x < 0) {
            this.x = 0;
            this.vx = 0;
        } else if (this.x > canvas.width - this.width) {
            this.x = canvas.width - this.width;
            this.vx = 0;
        }

        // 限制最大速度
        if (Math.abs(this.vx) > V_MAX) {
            this.vx = (Math.abs(this.vx) / this.vx) * V_MAX;
        }
    }

}

// 地面
class Floor{
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}



// 矩形碰撞检测（非旋转）
function isCollisionWithRect(x1, y1, w1, h1, x2, y2, w2, h2){
    var result =  Math.abs((x1 + w1 / 2) - (x2 + w2 / 2)) <= (w1 + w2) / 2 &&
        Math.abs((y1 + h1 / 2) - (y2 + h2 / 2)) <= (h1 + h2) / 2;
    return result;
}

// 接触到地面
function touchFloor (hero, floor) {
    var x1 = hero.x;
    var y1 = hero.y;
    var w1 = hero.width;
    var h1 = hero.height;
    var x2 = floor.x;
    var y2 = floor.y;
    var w2 = floor.width;
    var h2 = floor.height;
    return isCollisionWithRect(x1, y1, w1, h1, x2, y2, w2, h2);
}


// 水果对象
class Fruit{
    constructor (x, y, isGood) {
        this.x = x;
        this.y = y;
        this.img = new Image();
        if (isGood) {
            this.img.src = "assets/FruitGod.png";
        } else {
            this.img.src = "assets/FruitBad.png";
        }
    }
    draw(){
        var _this = this;
        this.img.onload = function () {
            ctx.drawImage(_this.img, 0, 0);
        }
    }
}


// 背景对象
class Background{
    constructor () {
        this.width = 1920;
        this.height = 540;
        this.img = new Image();
        this.img.src = "assets/Background.jpg";
        this.scale();
    }
    draw () {
        ctx.drawImage(this.img, 0, 0, this.width, this.height, 0, 0, canvas.width, canvas.height);
    }
    scale (coefficient) {
        canvas.width = clientWidth;
        canvas.height = this.height * clientWidth / this.width;
        //this.width = canvas.width;
        //this.height = canvas.height;
    }
}


var background = new Background();
var hero = new Hero(100, 200); // 332是地平面
var floor = new Floor(0, 32 * 10, 600, 40*2);
var drawFrame = function () {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    background.draw();
    hero.move();
    hero.draw();


    animated = setTimeout(arguments.callee, 1000 / FPS);

}


// 键盘按下
document.addEventListener('keydown', function (event) {
    //console.log(event.keyCode)
    if (event.keyCode == KEY_LEFT) {
        hero.direction = 'L';
        left_pressed = true;
    } else if (event.keyCode == KEY_RIGHT) {
        hero.direction = 'R';
        right_pressed = true;
    } else if (event.keyCode == KEY_JUMP) {
        jump_pressed = true;
    }
});

// 键盘抬起
document.addEventListener('keyup', function (event) {
    if (event.keyCode == KEY_LEFT) {
        hero.direction = 'S';
        left_pressed = false;
    } else if (event.keyCode == KEY_RIGHT) {
        hero.direction = 'S';
        right_pressed = false;
    } else if (event.keyCode == KEY_JUMP) {
        jump_pressed = false;
    }
});



// Main
drawFrame();