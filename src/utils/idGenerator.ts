
let idNumber = 0;


export default function idGen(pre?: string): string {
    return `id-${pre}-${idNumber++}`;
}