import Vec from './vec'

export interface Color {
    r: number
    g: number
    b: number
}

export interface Ball {
    center: Vec
    r: number
    color: Color
}

export default class Paint {
    balls: any[]
    lights: any[]

    private width: number
    private height: number
    private viewWidth: number
    private viewHeight: number
    private viewDeep: number
    private wrapDom: HTMLDivElement
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private bgColor: Color

    constructor(wrapDom: HTMLDivElement, option: { viewWidth:number, viewHeight:number }) {
        this.wrapDom = wrapDom
        this.canvas = document.createElement('canvas');
        this.wrapDom.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        const wrapW = wrapDom.clientWidth
        const wrapH = wrapDom.clientHeight
        const dpr = window.devicePixelRatio || 1;
        this.width = wrapW*dpr
        this.height = wrapH*dpr
        this.viewWidth = option.viewWidth
        this.viewHeight = option.viewHeight
        this.canvas.width = this.width
        this.canvas.height = this.height
        this.canvas.style.width = wrapW + 'px';
        this.canvas.style.height = wrapH + 'px';
        this.ctx.scale(dpr, dpr)
        this.ctx.fillRect(0, 0, this.width, this.height)

        this.viewDeep = 1
        this.bgColor = { r:100,g:100,b:100 }
        this.balls = [
            {
                center: new Vec(0, 0, 3),
                r: 1,
                color: { r:255, g:0, b:0 }
            }
        ]
        this.lights = [{
            type: 'ambient',
            intensity: 0.2
        }, {
            type: 'point',
            intensity: 0.6,
            pos: new Vec(2, 1, 0)
        }, {
            type: 'directional',
            intensity: 0.2,
            direction: new Vec(2, 1, 0)
        }]
    }
    
    render() {
        const { width, height, ctx } = this
        const data: Color[][] = []
        const o = new Vec(0, 0, 0)
        
        for (let r = 0; r < height; ++r) {
            const rowData = []
            for (let c = 0; c < width; ++c) {
                const point = this.canvasToView(c, r)
                const color = this.traceRay(o, point)
                rowData.push(color)
            }
            data.push(rowData)
        }

        const imageData = ctx.getImageData(0, 0, width, height);
        const buffer = imageData.data;

        for (let r = 0; r < height;++r) {
            for (let c = 0; c < width; ++c) {
                const color = data[r][c]
                const i = (r * width + c) * 4

                    buffer[i] = color.r
                    buffer[i+1] = color.g
                    buffer[i+2] = color.b
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }
    traceRay(o: Vec, d: Vec) {
        const { balls, bgColor } = this
        const tMin = 1, tMax = Infinity
        let closeIn = Infinity
        let closeInBall = null

        for (const ball of balls){
            const [t1, t2] = this.solvingEquations(o, d, ball)


            if (t1 >= tMin && t1<=tMax && t1<closeIn) {
                closeIn = t1
                closeInBall = ball
            }
            if (t2 >= tMin && t2<=tMax && t2<closeIn) {
                closeIn = t2
                closeInBall = ball
            }
        }

        if (closeInBall)  {
            let P = o.add(d.mult(closeIn))
            let N = P.del(closeInBall.center).format()
            const { r, g, b } = closeInBall.color
            const li = this.computeLight(P, N)
            return {
                // r: Math.max(0, Math.min(r * li, 255)),
                // g: Math.max(0, Math.min(g * li, 255)),
                // b: Math.max(0, Math.min(b * li, 255))
                r: r * li,
                g: g * li,
                b: b * li
            }
        }
        
        return bgColor
    }
    solvingEquations(o: Vec, d: Vec, ball: Ball):[number, number] {
        const { r, color, center } = ball
        const co = o.del(center)
        const a = d.dot(d)
        const b = 2 * co.dot(d)
        const c = co.dot(co) - r * r
        const formula = b * b - 4 * a * c
        if (formula < 0) return [Infinity, Infinity]
        const t1 = (-b + Math.sqrt(formula)) / (2 * a)
        const t2 = (-b - Math.sqrt(formula)) / (2 * a)
        return [t1, t2]
    }
    canvasToView(x: number, y: number): Vec {
        const { width, height, viewWidth, viewHeight, viewDeep } = this
        return new Vec((x - width/2) * viewWidth/width, (height/2 - y)*viewHeight/height, viewDeep)
    }
    computeLight(P: Vec, N: Vec): number {
        let i = 0.0

        for (const light of this.lights){
            if (light.type==='ambient') {
                i += light.intensity
            } else {
                let L
                if (light.type==='point') {
                    L = light.pos.del(P)
                } else {
                    L = light.direction
                }

                let nDot = N.dot(L)
                if (nDot > 0) {
                    i += light.intensity * nDot / (N.length() * L.length())
                }
            }
        }

        return i
    }
}