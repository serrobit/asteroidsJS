export function detectCollision(object1, object2) {
  if (
    object1.position.minus(object2.position).magnitude() <
    object1.size + object2.size
  )
    return true;
  return false;
}
