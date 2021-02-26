import { ViewType } from "../../types";

export const fragmentShader = (viewType: ViewType) => {
  let volumeCoords = "";
  switch (viewType) {
    case ViewType.Transverse:
      volumeCoords =
        "vec3 volumeCoords = vec3(1.0 - vUv.x, vUv.y, (activeSlices.z + 0.5) / scanSize.z);";
      break;
    case ViewType.Sagittal:
      volumeCoords =
        "vec3 volumeCoords = vec3((activeSlices.x + 0.5) / scanSize.x, 1.0 - vUv.x, vUv.y);";
      break;
    case ViewType.Coronal:
      volumeCoords =
        "vec3 volumeCoords = vec3(1.0 - vUv.x, (activeSlices.y + 0.5) / scanSize.y, vUv.y);";
      break;
  }

  return ` 
    varying vec2 vUv;

    uniform sampler2D dataTexture;
    uniform vec3 activeSlices;
    uniform vec3 scanSize;
    uniform float sliceCountU;
    uniform float sliceCountV;
    uniform float scanBackground;
    uniform float contrast;
    uniform float brightness;
    uniform bool blueTint;
    uniform float opacity;
    
    void main() {
      ${volumeCoords}
      
      vec2 sliceSize = vec2(1.0) / vec2(sliceCountU, sliceCountV);
      vec2 delta = vec2(
        mod(floor(volumeCoords.z * scanSize.z), sliceCountU), 
        floor(volumeCoords.z * scanSize.z / sliceCountU)
      );
      vec2 uvDelta = sliceSize * delta;
      vec2 uv = fract(volumeCoords.xy / vec2(sliceCountU, sliceCountV) + uvDelta)  ;
      vec4 texelValue = texture2D(dataTexture, uv);
      
      if(texelValue.x < scanBackground)
        discard;
      
      float contrastedColor = brightness * pow(contrast, 3.0) * pow(texelValue.x, contrast);

      vec3 tintedColor = mix(vec3(0.0, 0.0, blueTint ? 0.06 : 0.0), vec3(1.0), contrastedColor);

      gl_FragColor = vec4(tintedColor, opacity);
    }
  `;
};
