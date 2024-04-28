class Vec2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(vec2) {
    return new Vec2(this.x + vec2.x, this.y + vec2.y);
  }

  sub(vec2) {
    return new Vec2(this.x - vec2.x, this.y - vec2.y);
  }

  mult(scalar) {
    return new Vec2(this.x * scalar, this.y * scalar);
  }

  normalized() {
    const magnitude = Math.sqrt(this.x * this.x + this.y * this.y);
    return new Vec2(this.x / magnitude, this.y / magnitude);
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  rotated(degrees) {
    const angle = degrees * Math.PI / 180;
    const x = this.x * Math.cos(angle) - this.y * Math.sin(angle);
    const y = this.x * Math.sin(angle) + this.y * Math.cos(angle);
    return new Vec2(x, y);
  }
}

export default Vec2;
