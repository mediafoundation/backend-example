export const resourcesNotMatchingDeal = (resourcesIds: Array<number>, dealsIds: Array<number>) => {
  const difference = []
  const set1 = new Set(dealsIds)
  for (let i = 0; i < resourcesIds.length; i++) {
    if (!set1.has(resourcesIds[i])) {
      difference.push(resourcesIds[i])
    }
  }
  return difference
}