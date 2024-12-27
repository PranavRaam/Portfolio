// src/shaders.js
export const vertexShader = `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

export const fragmentShader = `
  uniform vec2 iResolution;
  uniform float iTime;
  uniform float scrollOffset;

  void mainImage(out vec4 fragColor, vec2 fragCoord) {
    vec2 uv = (fragCoord - iResolution.xy * 0.5) / min(iResolution.x, iResolution.y);
    
    float t = iTime * 5.0 + scrollOffset * 200.0;
    float dist = length(uv);
    float angle = atan(uv.y, uv.x);
    
    float pattern = sin(angle / 0.1 + t * 0.5) * sin(20.0 * (1.0 / dist) + t) - 1.0 + 1.0 / dist;
    
    float monochrome = 1.0 - pattern * 0.5;
    float invertedMonochrome = 1.0 - monochrome;
    
    fragColor = vec4(vec3(invertedMonochrome), 1.0);
  }

  void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
  }
`;