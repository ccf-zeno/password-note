import {Canvas, Shader, Fill, Skia, vec} from '@shopify/react-native-skia';
import {useEffect} from 'react';
import {Dimensions, StyleSheet} from 'react-native';
import {
  useSharedValue,
  useDerivedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const {width: W, height: H} = Dimensions.get('window');

const source = Skia.RuntimeEffect.Make(`
  uniform float2 iResolution;
  uniform float iTime;

  // 简化的噪声函数
  float hash(float2 p) {
    float h = dot(p, float2(127.1, 311.7));
    return fract(sin(h) * 43758.5453123);
  }

  float noise(float2 p) {
    float2 i = floor(p);
    float2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + float2(1.0, 0.0));
    float c = hash(i + float2(0.0, 1.0));
    float d = hash(i + float2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(float2 p) {
    float v = 0.0;
    float a = 0.5;
    float2 shift = float2(100.0, 100.0);
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = p * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }

  half4 main(float2 fragCoord) {
    float2 uv = fragCoord / iResolution;
    float t = iTime * 0.15;

    // 多层噪声叠加产生布料感
    float n1 = fbm(uv * 3.0 + float2(t, t * 0.7));
    float n2 = fbm(uv * 2.0 + float2(-t * 0.5, t * 0.3) + n1);
    float pattern = fbm(uv * 1.5 + n2 * 0.5);

    // 柔和的渐变色 indigo -> sky -> lavender
    half3 col1 = half3(0.824, 0.843, 0.996); // #d2d7fe indigo light
    half3 col2 = half3(0.812, 0.929, 0.984); // #cfedfc sky
    half3 col3 = half3(0.902, 0.839, 0.996); // #e6d6fe lavender

    half3 color = mix(col1, col2, half(pattern));
    color = mix(color, col3, half(n1 * 0.6));

    // 整体提亮
    color = color * 0.85 + 0.15;

    return half4(color, 1.0);
  }
`)!;

interface Props {
  style?: any;
}

const ShaderBackground = ({style}: Props) => {
  const time = useSharedValue(0);

  useEffect(() => {
    time.value = withRepeat(
      withTiming(100, {duration: 100000, easing: Easing.linear}),
      -1,
      false,
    );
  }, [time]);

  const uniforms = useDerivedValue(() => ({
    iResolution: vec(W, H),
    iTime: time.value,
  }));

  return (
    <Canvas style={[StyleSheet.absoluteFill, style]}>
      <Fill>
        <Shader source={source} uniforms={uniforms} />
      </Fill>
    </Canvas>
  );
};

export default ShaderBackground;
