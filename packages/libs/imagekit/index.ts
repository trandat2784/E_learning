import ImageKit = require("imagekit");

console.log(process.env.IMAGEKIT_PUBLIC_KEY, process.env.IMAGEKIT_SECRET_KEY);
export const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_SECRET_KEY!,
    urlEndpoint: "https://ik.imagekit.io/trandat",
})