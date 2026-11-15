// Match mining-related gold headlines without excluding sand stories that merely compare prices to gold.
export function titleContainsGoldMining(title) {
  return /\bgold[\s-]+(?:min(?:e|es|ed|er|ers|ing)|dredg(?:e|ed|er|ers|ing)|extract(?:ion|ed|ing))\b|\b(?:mining|dredging|extraction)\s+(?:of\s+|for\s+)?gold\b|khai\s*thác\s*vàng|khai\s*thac\s*vang|đào\s*vàng|đãi\s*vàng|เหมืองทอง|ขุดทอง|ร่อนทอง|រ៉ែមាស|ជីកមាស|采金|採金|淘金|金矿|金礦|ຂຸດຄຳ|ຂຸດທອງ/iu.test(title || '');
}
export function hasNonEnglishScript(title) {
  return /[\u0e00-\u0eff\u1000-\u109f\u1780-\u17ff\u3400-\u9fff]/u.test(title || '');
}
