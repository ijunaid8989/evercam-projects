export default function (doc) {
  if (doc.isBroken) {
    return '/not-found'
  }
}
