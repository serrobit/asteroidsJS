// Basic class representing 2-dimensional vectors
export default class Vector2D {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  magnitude() {
    return Math.sqrt(this.x ** 2 + this.y ** 2); // returns this vector's magnitude
  }
  scale(scaler) {
    return new Vector2D(this.x * scaler, this.y * scaler); // returns a Vector2D object of this vector scaled by the passed in scaler
  }
  unit() {
    if (this.magnitude() !== 0) return this.scale(1 / this.magnitude());
    else return this;
  }
  dot(vector2d) {
    return this.x * vector2d.x + this.y * vector2d.y; // returns the dot product of this vector and the passed in vector
  }
  plus(vector2d) {
    return new Vector2D(this.x + vector2d.x, this.y + vector2d.y); // returns the vector sum of this vector and the passed in vector
  }
  minus(vector2d) {
    return new Vector2D(this.x - vector2d.x, this.y - vector2d.y); // returns the vector difference of this vector and the passed in vector
  }
  rotate(radians) {
    return new Vector2D(
      Math.cos(radians) * this.x - Math.sin(radians) * this.y,
      Math.sin(radians) * this.x + Math.cos(radians) * this.y
    ); // returns a Vector2D object of this vector rotated by the number of radians passed in
  }
  angleBetween(vector2d) {
    if (
      (this.x === 0 && this.y === 0) ||
      (vector2d.x === 0 && vector2d.y === 0)
    )
      return null;
    else
      return Math.acos(
        this.dot(vector2d) / (this.magnitude() * vector2d.magnitude()) // returns the angle between this vector and the passed in vector
      );
  }
}
