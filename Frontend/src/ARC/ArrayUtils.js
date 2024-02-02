export function getUniqueList(objList, key) {
    let valList = objList.forEach((item) => item[key]);
    return Array.from(new Set(valList));
}
