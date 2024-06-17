export default class Vec {
    x: number
    y: number
    z: number

    constructor(x: number, y: number, z: number) {
        this.x = x
        this.y = y
        this.z = z
    }

    del(v: Vec): Vec {
        const { x, y, z } = this
        return new Vec(x-v.x, y-v.y, z-v.z)
    }

    add(v: Vec): Vec {
        const { x, y, z } = this
        return new Vec(x+v.x, y+v.y, z+v.z)
    }

    dot(v: Vec): number {
        const { x, y, z } = this
        return x*v.x + y*v.y + z*v.z
    }

    length() {
         const { x, y, z } = this
        return Math.sqrt(x*x + y*y + z*z)
    }

    mult(val: number) {
        const { x, y, z } = this
        return new Vec(x*val, y*val, z*val)
    }

    format() {
        const { x, y, z } = this
        const length = this.length()
        return new Vec(x/length, y/length, z/length)
    }
}