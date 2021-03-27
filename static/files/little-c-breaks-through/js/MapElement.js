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