import LogoSvg from '../assets/logo.svg';

/**
 * Logo vectoriel — nécessite react-native-svg + metro (voir metro.config.js).
 */
export default function AppLogo({ width = 220, height = 32, style }) {
  return <LogoSvg width={width} height={height} style={style} />;
}
