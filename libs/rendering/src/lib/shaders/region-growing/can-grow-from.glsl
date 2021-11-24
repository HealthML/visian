const float two_over_three = 2.0 / 3.0;

bool canGrowFrom(vec4 ownData, vec4 neighborData, float neighborRegion) {
  float maxDataDifference = abs(ownData[0] - neighborData[0]);
  float maxSeedDifference = abs(ownData[0] - uSeed[0]);
  if(uComponents >= 2) {
    maxDataDifference = max(maxDataDifference, abs(ownData[1] - neighborData[1]));
    maxSeedDifference = max(maxSeedDifference, abs(ownData[1] - uSeed[1]));
  } 
  if(uComponents >= 3) {
    maxDataDifference = max(maxDataDifference, abs(ownData[2] - neighborData[2]));
    maxSeedDifference = max(maxSeedDifference, abs(ownData[2] - uSeed[2]));
  } 
  if(uComponents >= 4) {
    maxDataDifference = max(maxDataDifference, abs(ownData[3] - neighborData[3]));
    maxSeedDifference = max(maxSeedDifference, abs(ownData[3] - uSeed[3]));
  }

  return all(lessThan(vec3(
      -neighborRegion,
      maxSeedDifference * two_over_three - uThreshold,
      maxDataDifference - uThreshold),
    vec3(0.0)));
}
