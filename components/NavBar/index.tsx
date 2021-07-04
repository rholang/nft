import { reflect } from '@effector/reflect';

import { View } from './view';
import { Store as S, Event as E } from './model';
/**
 * export component
 */
export const NavBar = reflect({
  view: View,
  bind: { value: S.$nameStore, onChange: () => E.changeNameEvent() },
});
