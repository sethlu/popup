export function flattenArray(a, depth = -1) {
    if (!Array.isArray(a)) return [a];
    if (depth === 0) return a;
    return a.reduce(function (a, v) {
        Array.prototype.push.apply(a, flattenArray(v, depth - 1));
        return a;
    }, []);
}
