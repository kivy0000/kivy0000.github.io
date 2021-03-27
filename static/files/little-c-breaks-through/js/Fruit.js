/* 水果类（继承矩形元素类） */
class Fruit extends RectangleElement{
    constructor(x, y, state){
        let w = 40;
        let h = 40;
        //let d = 60;
        //x = x || random(d, 1920 - w - d);
        //y = y || - 2 * h * random(0, 4);
        if (state == 0) {
            super(x, y, w, h, "assets/FruitBad.png", {w: 80, h: 80});
        } else {
            super(x, y, w, h, "assets/FruitGod.png", {w: 80, h: 80});
        }
        this.vy = 56;
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
    static createGodOne(){
        // 初始化使用使用全画布宽度
        let x, y;
        while(1) {  // 设置生成边界
            x = random(120, 1680);
            y = -80 * random(0, 4);
            if (x < 216 || (x > 324 && x < 1465) || x > 1572)
                break;
        }
        return new Fruit(x, y);
    }
    static createBadOne(){
        // 动态使用应该限制为当前画布宽度内
        let x = random(0, 600);
        let y = -160 * random(0, 4);
        var badFruit = new Fruit(x, y, 0);
        badFruit.vy = 28;
        return badFruit;
    }
}