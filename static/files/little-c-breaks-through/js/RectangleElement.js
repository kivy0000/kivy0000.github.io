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