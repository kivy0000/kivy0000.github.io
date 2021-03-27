//
// Main.js (javascript es6)
// 小C闯关
//
// created by kxbsn on 2020/12/31
// copyright © 2021 柯西. All rights reserved.
//

/* 游戏常量值 */
const FPS = 60;             // 帧率
const T = 1 / FPS * 8;      // 单位时间
const G = 9.8 * 2;          // 重力加速度（双倍增加下落速度）
const U = 0.8;              // 人物与地面摩擦系数
const V_MAX = 28;           // 角色最大速度
const A_STEP = 28;          // 控制角色的加速度
const JUMP_MAX_HEIGHT = 108;// 角色最大跳跃高度
const LEFT_VIEW_LIMIT = 0;  // 左视图界限
const RIGHT_VIEW_LIMIT= 300;// 右视图界限

const KEY_LEFT = 65;        // 左键 A
const KEY_RIGHT = 68;       // 右键 D
const KEY_JUMP = 75;        // 跳键 K

/* 游戏全局变量 */
var animatedId = null;      // 定时调用ID
var canvas = document.getElementById("canvas");             // 画布对象
var ctx = canvas.getContext("2d");                          // 画布上下文
var clientWidth = document.documentElement.clientWidth;     // 浏览器宽度
var clientHeight = document.documentElement.clientHeight;   // 浏览器高度

var jump_pressed = false;   // 跳键按下
var left_pressed = false;   // 左键按下
var right_pressed = false;  // 右键按下


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



// Main
var score = 0;
var background = new Background();
var hero = new Hero(80, 0);

// 定时调用实现动画效果
animatedId = setInterval(function(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);   // 清屏

    background.render();
    hero.render();
    hero.action();
    background.action();
    showScore()

}, 1000 / FPS);