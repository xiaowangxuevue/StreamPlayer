const prototype = HTMLElement.prototype;
export type MoblieEvent =
    | "singleTap"
    | "doubleTap"
    | "moveLeft"
    | "moveRight"
    | "moveTop"
    | "moveDown"
    | "slideLeft"
    | "slideRight"
    | "slideTop"
    | "slideDown"

let proto = {
    addEventListener<K extends keyof HTMLElementEventMap & MoblieEvent>(event: K, listener: (...args: any) => void) {
        let ctx = this;
        let tapTimer = null;
        let lastTapEndTime = -1;
        function singleOrDoubleTap() {
            let isMove = false;
            let startTime = 0;
            let isDoubleTap = false;
            ctx.addEventListener('touchstart', (e: TouchEvent) => {
                startTime = Date.now();
                // 判断单双击
                if (lastTapEndTime > 0 && startTime - lastTapEndTime < 150) {
                    window.clearTimeout(tapTimer);
                    tapTimer = null;
                    lastTapEndTime = -1;
                    isDoubleTap = true;
                }
            });
            ctx.addEventListener('touchmove', (e: TouchEvent) => {
                isMove = true
            });
            ctx.addEventListener("touchend", (e: TouchEvent) => {
                let interval = Date.now() - startTime;
                if (interval < 150 && !isMove) {
                    if (event === "singleTap" && isDoubleTap === false) {
                        tapTimer = window.setTimeout(() => {
                            listener.call(ctx, e);
                        }, 150);
                    } else if (event === "doubleTap" && isDoubleTap === true) {
                        tapTimer = window.setTimeout(() => {
                            listener.call(ctx, e);
                        });
                    }
                    lastTapEndTime = Date.now();
                }
                isMove = false;
                isDoubleTap = false;
            });

        }

        function moveOrSlide() {
            let startTime = 0;
            let isMove = false;
            let pos = {
                x: 0,
                y: 0,
            }
            let dx = 0, dy = 0;
            ctx.addEventListener('touchstart', (e: TouchEvent) => {
                startTime = Date.now()
                pos.x = e.touches[0].clientX;
                pos.y = e.touches[0].clientY;
            });

            ctx.addEventListener("touchmove", (e: TouchEvent) => {
                isMove = true;
                let x = e.touches[0].clientX;
                let y = e.touches[0].clientY;
                dx = x - pos.x;
                dy = y - pos.y;
                if (
                    (event === "moveLeft" && dx < 0) ||
                    (event === "moveRight" && dx > 0) ||
                    (event === "moveTop" && dy < 0) ||
                    (event === "moveDown" && dy > 0)
                ) {
                    listener.call(this, {
                        event: e,
                        dx: dx,
                        dy: dy,
                    });
                }
            });
            ctx.addEventListener("touchend", (e: TouchEvent) => {
                if (isMove) {
                    if (
                        (event === "slideLeft" && dx < 0) ||
                        (event === "slideRight" && dx > 0) ||
                        (event === "slideTop" && dy < 0) ||
                        (event === "slideDown" && dy > 0)
                    ) {
                        listener.call(this, {
                            event: e,
                            dx: dx,
                            dy: dy,
                            start: pos,
                            end: {
                                x: dx + pos.x,
                                y: dy + pos.y,
                            },
                        });
                    }
                }
            });
        }
        switch (event) {
            case "singleTap":
            case "doubleTap":
                singleOrDoubleTap();
                break;
            case "slideLeft":
            case "slideRight":
            case "slideTop":
            case "slideDown":
            case "moveLeft":
            case "moveRight":
            case "moveTop":
            case "moveDown":
                moveOrSlide();
                break;
            default:
                prototype.addEventListener.call(ctx, event, listener);
        }


    }


}

export default proto;