const damageFormula = (attack, npDamageMultiplier, firstCardBonus, cardDamageValue, cardMod, classAtkBonus, triangleModifier, attributeModifier, atkMod, defMod, criticalModifier, extraCardModifier, specialDefMod, powerMod, selfDamageMod, critDamageMod, isCrit, npDamageMod, isNP, dmgPlusAdd, selfDmgCutAdd, busterChainMod) => {
  const damage = (attack * npDamageMultiplier * (firstCardBonus + (cardDamageValue * (1 + cardMod))) * classAtkBonus * triangleModifier * attributeModifier * randomModifier * 0.23 * (1 + atkMod - defMod) * criticalModifier * extraCardModifier * (1 - specialDefMod) * (1 + powerMod + selfDamageMod + (critDamageMod * isCrit) + (npDamageMod * isNP)) * (1 + ((superEffectiveModifier - 1) * isSuperEffective))) + dmgPlusAdd + selfDmgCutAdd + (servantAtk * busterChainMod);

  return damage;
};

export default damageFormula;
