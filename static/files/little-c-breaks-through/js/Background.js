/* 背景类 */
class Background extends RectangleElement{
    constructor () {
        super(0, 0, 640, 480, "assets/Background.jpg", {w: 1920, h:540});
        this.fruitLogo = new Fruit(canvas.width - 134, 35);
        this.passLogo = new RectangleElement(1720, 360, 80, 80,"assets/PassLogo.png",{w: 200, h: 200});

        this.map = []
        this.map.push(new MapElement(1058, canvas.height - 100, 182, 70));  // 7
        this.map.push(new MapElement(0, canvas.height - 30, 256, 30));      // 1
        this.map.push(new MapElement(324, canvas.height - 30, 1181, 30));   // 2
        this.map.push(new MapElement(1572, canvas.height - 30, 348, 30));   // 3
        this.map.push(new MapElement(707, canvas.height - 136, 108, 30));   // 4
        this.map.push(new MapElement(880, canvas.height - 182, 108, 30));   // 5
        this.map.push(new MapElement(1258, canvas.height - 206, 108, 30));  // 6

        this.fruits = []
        for (let i = 0; i < 8; i++) {
            this.fruits.push(Fruit.createGodOne());
        }
        this.badFruits = []
        for (let i = 0; i < 3; i++) {
            this.badFruits.push(Fruit.createBadOne());
        }
    }
    render () {
        // 图像 (开始剪切的X,剪切的y) (剪切的宽度,剪切的高度) (x坐标,y坐标) (伸缩图像宽度,图像高度)
        ctx.drawImage(this.img, 0, 0, this.size.w, this.size.h, this.x, this.y, this.size.w, this.h);
        this.fruitLogo.render();
        this.passLogo.render();
        console.log(this.passLogo)
        this.map.forEach(item=>{
            item.render();
        })
        this.fruits.forEach(item=>{
            item.render();
            item.action();
            let collisionItem =getCollisionWithMap(item, this.map)
            if (collisionItem != null) {
                item.vy = 0;
                item.y = collisionItem.y - item.h;
            }
        });
        let indexArr = []
        this.badFruits.forEach((item, index) => {
            item.render();
            item.action();
            if (item.y > canvas.height) {
                indexArr.push(index);
            }
        });
        indexArr.forEach(index => {
            this.badFruits.splice(index, 1);
            this.badFruits.push(Fruit.createBadOne());
        });
    }
    action(){
        // 移动背景
        if (background.x > 0) {
            //console.log("左边超过")
        }
        if ((-background.x + canvas.width) > background.size.w) {
            // parseInt转化为整数
            //console.log("右边超过", -background.x + canvas.width, background.size.w)
        }
    }
    updateAxis(step){
        this.x -= step;
        this.passLogo.x -= step;
        this.map.forEach(item=>{
            item.x -= step;
        })
        this.fruits.forEach(item=>{
            item.x -= step;
        })
        this.badFruits.forEach(item=>{
            item.x -= step;
        });
    }
}