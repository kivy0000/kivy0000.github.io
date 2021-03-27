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
            if (getCollisionWithMap(this, background.map) == null){    // 如果没有接触地图，则为在空中的状态
                this.inTheSky = true;
            }
        }

        // y轴碰撞处理
        let collisionItem = getCollisionWithMap(this, background.map);
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
            if(getCollisionWithMap(this, background.map) != null)  // 如果在地面上则计算摩擦力加速度
                a1 = sign * U * G ;                     // 由F = ma; f = uF; ma = umg; 推出 a = ug;
            else
                a1 = 0;
        }
        let tmp = this.vx;
        let s = this.vx * T + 0.5 * (a + a1) * T * T;   // 计算单位时间水平位移
        this.vx = this.vx + (a + a1) * T;               // 更新速度
        if (tmp * this.vx < 0) this.vx = 0;             // 速度变化为负时停止运动 (与现实不同，清除惯性更快响应)
        this.x += s;                                    // 更新横坐标

        if (this.x > RIGHT_VIEW_LIMIT && (- background.x + canvas.width < background.size.w)) {
            let dx = this.x - RIGHT_VIEW_LIMIT;
            this.x = RIGHT_VIEW_LIMIT;
            background.updateAxis(dx);
        } else {

        }

        // 水平方向碰到东西则停止水平方向运动
        if(!collisionItem && getCollisionWithMap(this, background.map) != null) {
            // 说明x轴碰撞
            //this.x = this.x - s;
            background.updateAxis(-s);
            this.vx = 0;
            a = 0;
            a1 = 0;
        }

        // 限制水平方向运动边界
        if (this.x < LEFT_VIEW_LIMIT) {
            this.x = LEFT_VIEW_LIMIT;
            this.vx = 0;
        } else if (this.x + this.w >= canvas.width) {
            this.x = canvas.width - this.w;
            this.vx = 0;
        }

        // 限制最大速度
        if (Math.abs(this.vx) > V_MAX) {
            this.vx = (Math.abs(this.vx) / this.vx) * V_MAX;
        }

        // 角色和水果的碰撞处理
        let fruits = background.fruits;
        let collisionFruit = getCollisionWithMap(this, fruits);
        if (collisionFruit != null) {
            if (collisionFruit.state != 0){
                fruits.splice(fruits.indexOf(collisionFruit), 1);
                score += 1;
                // 音效和动效
            } else {
                // GameOver
                gameOver();
                console.log("Game Over 1")
            }
        }

        // 被砸了
        if(getCollisionWithMap(this, background.badFruits) != null) {
            gameOver();
            console.log("Game Over 1")
        }


        // 掉坑里了
        if (this.y > canvas.height) {
            // GameOver
            gameOver();
            console.log("Game Over 2")
        }

        // 赢了
        if (this.x >= background.passLogo.x) {
            gameWin();
            console.log("You win ! score = " + score);
        }
    }
}