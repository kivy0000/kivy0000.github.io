//
// 接水果.js (javascript es6)
// 小C接水果
//
// created by kxbsn on 2020/12/31
// copyright © 2021 柯西. All rights reserved.
//

/* 游戏常量值 */
const FPS = 60;             // 帧率
const T = 1 / FPS * 8;      // 单位时间
const G = 9.8 * 2;          // 重力加速度（双倍增加下落速度）
const U = 0.8;              // 人物与地面摩擦系数
var V_MAX = 28;           // 角色最大速度
const A_STEP = 28;          // 控制角色的加速度
const JUMP_MAX_HEIGHT = 96; // 角色最大跳跃高度

const KEY_LEFT = 65;        // 左键 A
const KEY_RIGHT = 68;       // 右键 D
const KEY_JUMP = 75;        // 跳键 K

/* 游戏全局变量 */
var animatedId = null;
var canvas = document.getElementById("canvas");             // 画布对象
var ctx = canvas.getContext("2d");                          // 画布上下文
var clientWidth = document.documentElement.clientWidth;     // 浏览器宽度
var clientHeight = document.documentElement.clientHeight;   // 浏览器高度

var jump_pressed = false;   // 跳键按下
var left_pressed = false;   // 左键按下
var right_pressed = false;  // 右键按下



/* 矩形元素类 */
class RectangleElement{
    constructor(x, y, w, h, src, size) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        if (src != null){
            this.img = new Image();
            this.img.src = src;
            this.size = size || {w:0, h:0};
        }
    }
    render () {
        ctx.drawImage(this.img, 0, 0, this.size.w, this.size.h, this.x, this.y,  this.w, this.h);
    }
    action () {}
}


/* 角色类（继承矩形元素类） */
class Hero extends RectangleElement{
    constructor(x, y, w, h){
        super(x || 0, y || 0, w || 40, h || 56, "assets/hero.png", {w: 90, h: 126});

        this.vx = 0;
        this.vy = 0;
        this.inTheSky = true;

        Hero.stepCounter = 0;
        Hero.sx = 1;
        Hero.sy = 1;
    }
    render () {
        //ctx.fillStyle = '#0f0';
        //ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.drawImage(this.img, Hero.sx, Hero.sy, this.size.w, this.size.h, this.x, this.y, this.w, this.h);
        // 加载素材不同动作
        let step = this.size.w - 2;
        if (Hero.stepCounter % 4 == 0){
            Hero.sx += step;
        }
        if (Hero.sx > step) Hero.sx = 0;
        Hero.stepCounter++;
    }
    action () {
        let a = 0;      // 角色控制加速度
        let a1 = 0;     // 摩擦力的加速度
        // 按键控制
        if (jump_pressed && !this.inTheSky) {       // 限制在地面才能跳
            this.inTheSky = true;
            this.vy = - Math.sqrt(2 * G * JUMP_MAX_HEIGHT);
        }
        if (left_pressed) {
            a -= A_STEP;
        }
        if (right_pressed) {
            a += A_STEP;
        }

        // 运动处理
        if (this.inTheSky) {                                // 如果为空中状态
            let h = this.vy * T + 0.5 * G * T * T;          // h = vt + (1/2)gt^2
            this.vy = this.vy + G * T;                      // v = v + gt
            this.y += h;                                    // 更新纵坐标
        } else {
            if (getCollisionWithMap(this, map) == null){    // 如果没有接触地图，则为在空中的状态
                this.inTheSky = true;
            }
        }

        // y轴碰撞处理
        let collisionItem = getCollisionWithMap(this, map);
        if(collisionItem){
            // 说明y轴碰撞
            if (this.vy > 0)
                this.inTheSky = false;
            this.vy = 0;
            // 控制上下碰撞的情况
            let O_y1 = this.y + this.h;
            let O_y2 = collisionItem.y + collisionItem.h;
            if (O_y1 < O_y2) {      // 角色在上
                this.y = collisionItem.y - this.h;
            } else {                // 角色在下
                this.y = collisionItem.y + collisionItem.h;
            }
        }

        // 水平方向运动
        if (this.vx * a <= 0 && this.vx != 0) {         // 如果力和加速度反向
            let sign = - Math.abs(this.vx) / this.vx;   // 加速度方向（和当前速度相反）
            if(getCollisionWithMap(this, map) != null)  // 如果在地面上则计算摩擦力加速度
                a1 = sign * U * G ;                     // 由F = ma; f = uF; ma = umg; 推出 a = ug;
            else
                a1 = 0;
        }
        let tmp = this.vx;
        let s = this.vx * T + 0.5 * (a + a1) * T * T;   // 计算单位时间水平位移
        this.vx = this.vx + (a + a1) * T;               // 更新速度
        if (tmp * this.vx < 0)                          // 速度变化为负时停止运动 (与现实不同，清除惯性更快响应)
            this.vx = 0;
        this.x += s;                                    // 更新横坐标

        // 水平方向碰到东西则停止水平方向运动
        if(!collisionItem && getCollisionWithMap(this, map) != null) {
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
        } else if (this.x > canvas.width - this.w) {
            this.x = canvas.width - this.w;
            this.vx = 0;
        }

        // 限制最大速度
        if (Math.abs(this.vx) > V_MAX) {
            this.vx = (Math.abs(this.vx) / this.vx) * V_MAX;
        }

        // 角色和水果的碰撞处理
        let collisionFruit = getCollisionWithMap(hero, fruits);
        if (collisionFruit != null) {
            if (collisionFruit.state != 0){
                fruits.splice(fruits.indexOf(collisionFruit), 1);
                fruits.push(Fruit.createOne());
                score += 1;
                // 音效和动效
            } else {
                // GameOver
                gameOver();
                console.log("Game Over 1")
            }
        }

        // 掉坑里了
        if (this.y > canvas.height) {
            // GameOver
            gameOver();
            console.log("Game Over 2")
        }
    }
}


/* 地图元素类（继承矩形元素类） */
class MapElement extends RectangleElement{
    constructor(x, y, w, h){
        super(x, y, w, h);
    }
    render () {
        //ctx.fillStyle = '#f00';
        //ctx.fillRect(this.x, this.y, this.w, this.h);
    }
}

/* 水果类（继承矩形元素类） */
class Fruit extends RectangleElement{
    constructor(state){
        let d = 60;
        let w = 40;
        let h = 40;
        let y = - 2 * h * random(0, 4) * Fruit.timesSpeed;
        let x = random(d, canvas.width - w - d);
        if (state == 0) {
            super(x, y, w, h, "assets/FruitBad.png", {w: 80, h: 80});
        } else {
            super(x, y, w, h, "assets/FruitGod.png", {w: 80, h: 80});
        }
        this.vy = 2 * Fruit.timesSpeed;
        this.state = state;

    }
    action () {
        let h = this.vy * T;
        this.y += h;
    }
    // 创建一个水果对象，20%概率产生坏水果
    static createOne(){
        let state = random(1, 8) % 8 == 0 ? 0 : 1;
        return new Fruit(state);
    }
}


/* 背景类 */
class Background extends RectangleElement{
    constructor () {
        super(0, 0, 0, 0, "assets/Background.jpg", {w: 1920, h:540});
        this.scale();
        this.getFruitLoge();
    }
    render () {
        super.render();
        this.fruit.render();
    }
    scale (coefficient) {
        coefficient = coefficient || clientWidth / this.size.w; // 缩放系数
        canvas.width = clientWidth;
        canvas.height = this.size.h * coefficient;
        this.coefficient = coefficient;
        this.w = canvas.width;
        this.h = canvas.height;
    }
    getFruitLoge() {
        let fruit = new Fruit();
        fruit.x = canvas.width - 134;
        fruit.y = 35;
        this.fruit = fruit;
    }
}


// 键盘按下
document.addEventListener('keydown', function (event) {
    if (event.keyCode == KEY_LEFT) {
        left_pressed = true;
    } else if (event.keyCode == KEY_RIGHT) {
        right_pressed = true;
    } else if (event.keyCode == KEY_JUMP) {
        jump_pressed = true;
    }
});

// 键盘抬起
document.addEventListener('keyup', function (event) {
    if (event.keyCode == KEY_LEFT) {
        left_pressed = false;
    } else if (event.keyCode == KEY_RIGHT) {
        right_pressed = false;
    } else if (event.keyCode == KEY_JUMP) {
        jump_pressed = false;
    }
});

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

// 产生随机数
function random(startInt, endInt) {
    var result = startInt + parseInt(Math.random() * (endInt - startInt + 1));
    return result;
}

// 游戏结束
function gameOver() {
    ctx.font = "60px Comic Sans MS";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "Orange"
    ctx.fillText("GAME OVER!", canvas.width / 2, canvas.height / 2);
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


//
// Main
//
var background = new Background();
var hero = new Hero();
var fruits = [];
var map = [];
var zoom = background.coefficient;
map.push(new MapElement(parseInt(1056 * zoom), parseInt(canvas.height - 111 * zoom), parseInt(190 * zoom), parseInt(78 * zoom)));
map.push(new MapElement(parseInt(1258 * zoom), parseInt(canvas.height - 229 * zoom), parseInt(112 * zoom), parseInt(38 * zoom)));
map.push(new MapElement(parseInt(880 * zoom), parseInt(canvas.height - 204 * zoom), parseInt(110 * zoom), parseInt(38 * zoom)));
map.push(new MapElement(parseInt(704 * zoom), parseInt(canvas.height - 152 * zoom), parseInt(112 * zoom), parseInt(38 * zoom)));

map.push(new MapElement(parseInt(0 * zoom), parseInt(canvas.height - 34 * zoom), parseInt(256 * zoom), parseInt(38 * zoom)));
map.push(new MapElement(parseInt(324 * zoom), parseInt(canvas.height - 34 * zoom), parseInt(1182 * zoom), parseInt(38 * zoom)));
map.push(new MapElement(parseInt(1572 * zoom), parseInt(canvas.height - 34 * zoom), parseInt(348 * zoom), parseInt(38 * zoom)));




// 创建水果
Fruit.timesSpeed = 1;
var score = 0;
var fruitCount = 5;
for (let i = 0; i < fruitCount; i++) {
    fruits.push(Fruit.createOne());
}

var drawFrame = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);   // 清屏
    // 绘制画面和逻辑处理
    background.render();
    map.forEach(item =>{
       item.render();
    });
    // 绘制水果
    let indexArr = []
    fruits.forEach((item, index) =>{
        item.render();
        item.action();
        if (item.y > canvas.height) {
            indexArr.push(index)
        }
    });
    indexArr.forEach(index => {
        fruits.splice(index, 1);
        fruits.push(Fruit.createOne());
    })
    // 水果满5个则加快下落速度
    if ((score + 1) % (5 * Fruit.timesSpeed) == 0) {
        Fruit.timesSpeed += 2;  // 加速新产生的水果
        V_MAX += 6;             // 提升角色最大速度（增加操作空间）
        //fruits.forEach(item =>{
        //    item.vy += 2;     // 加速正在下落的水果
        //});
        console.log("提速一次")
    }
    hero.render();
    hero.action();
    showScore();
}

animatedId = setInterval(drawFrame, 1000 / FPS);