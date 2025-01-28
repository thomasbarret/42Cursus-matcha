// taken from nanoid lib, generates a random url friendly string
let a = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
export const randomUrl = (e = 50) => {
    let t = "",
        r = crypto.getRandomValues(new Uint8Array(e));
    for (let n = 0; n < e; n++) t += a[63 & r[n]];
    return t;
};
