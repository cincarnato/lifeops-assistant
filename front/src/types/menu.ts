interface Link {
  name: string;
}

type MenuColValue = number | string;

interface MenuItem {
  icon: string;
  text: string;
  link?: Link;
  gallery: boolean;
  children?: MenuItem[];
  permission?: string;
  auth?: boolean;
  cols?: MenuColValue;
  sm?: MenuColValue;
  md?: MenuColValue;
  lg?: MenuColValue;
  xl?: MenuColValue;
}

export type{
  Link,
  MenuItem,
  MenuColValue
}
