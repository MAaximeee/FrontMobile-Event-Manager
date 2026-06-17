import Svg, { Path, Circle, Rect } from 'react-native-svg';

export function TabHomeIcon({ color = '#fff', size = 22 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function TabCalendarIcon({ color = '#fff', size = 22 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3.5} y={5.5} width={17} height={15} rx={2} stroke={color} strokeWidth={1.8} />
      <Path d="M3.5 10.5h17M8 3.5v4M16 3.5v4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function TabCreateIcon({ color = '#fff', size = 22 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.8} />
      <Path d="M12 8v8M8 12h8" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function TabProfileIcon({ color = '#fff', size = 22 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8.5} r={3.5} stroke={color} strokeWidth={1.8} />
      <Path
        d="M5.5 20c.8-3.5 3.2-5.5 6.5-5.5s5.7 2 6.5 5.5"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}
