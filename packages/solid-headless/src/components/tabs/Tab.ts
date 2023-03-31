import {
  createComponent,
  createEffect,
  JSX,
  mergeProps,
  onCleanup,
} from 'solid-js';
import {
  omitProps,
} from 'solid-use/props';
import {
  createSelectOption,
  SelectOptionOptions,
  SelectOptionProvider,
  SelectOptionRenderProps,
} from '../../states/create-select-option-state';
import { useSelectState } from '../../states/create-select-state';
import createDynamic from '../../utils/create-dynamic';
import {
  createForwardRef,
  createRef,
  DynamicProps,
  HeadlessPropsWithRef,
  ValidConstructor,
} from '../../utils/dynamic-prop';
import { createOwnerAttribute } from '../../utils/focus-navigator';
import {
  createActive,
  createDisabled,
  createSelected,
} from '../../utils/state-props';
import { Prettify } from '../../utils/types';
import {
  useTabGroupContext,
} from './TabGroupContext';
import { useTabListContext } from './TabListContext';
import { TAB_TAG } from './tags';

export type TabBaseProps<V> = Prettify<
  SelectOptionOptions<V>
  & SelectOptionRenderProps
>;

export type TabProps<V, T extends ValidConstructor = 'div'> =
  HeadlessPropsWithRef<T, TabBaseProps<V>>;

export function Tab<V, T extends ValidConstructor = 'div'>(
  props: TabProps<V, T>,
): JSX.Element {
  const rootContext = useTabGroupContext('Tab');
  const listContext = useTabListContext('Tab');
  const properties = useSelectState<V>();

  const [internalRef, setInternalRef] = createForwardRef(props);
  const state = createSelectOption(props);

  createEffect(() => {
    const ref = internalRef();
    if (ref instanceof HTMLElement) {
      const onKeyDown = (e: KeyboardEvent) => {
        if (!state.disabled()) {
          switch (e.key) {
            case 'ArrowUp':
              if (!rootContext.horizontal) {
                e.preventDefault();
                listContext.setPrevChecked(ref);
              }
              break;
            case 'ArrowLeft':
              if (rootContext.horizontal) {
                e.preventDefault();
                listContext.setPrevChecked(ref);
              }
              break;
            case 'ArrowDown':
              if (!rootContext.horizontal) {
                e.preventDefault();
                listContext.setNextChecked(ref);
              }
              break;
            case 'ArrowRight':
              if (rootContext.horizontal) {
                e.preventDefault();
                listContext.setNextChecked(ref);
              }
              break;
            case ' ':
            case 'Enter':
              if (ref.tagName === 'BUTTON') {
                e.preventDefault();
              }
              listContext.setChecked(ref);
              break;
            case 'Home':
              e.preventDefault();
              listContext.setFirstChecked();
              break;
            case 'End':
              e.preventDefault();
              listContext.setLastChecked();
              break;
            default:
              break;
          }
        }
      };
      const onClick = () => {
        if (!state.disabled()) {
          properties.select(props.value);
        }
      };
      const onFocus = () => {
        if (!state.disabled()) {
          properties.focus(props.value);
          properties.select(props.value);
        }
      };
      const onBlur = () => {
        if (!state.disabled()) {
          properties.blur();
        }
      };

      ref.addEventListener('keydown', onKeyDown);
      ref.addEventListener('click', onClick);
      ref.addEventListener('focus', onFocus);
      ref.addEventListener('blur', onBlur);
      onCleanup(() => {
        ref.removeEventListener('keydown', onKeyDown);
        ref.removeEventListener('click', onClick);
        ref.removeEventListener('focus', onFocus);
        ref.removeEventListener('blur', onBlur);
      });
    }
  });

  return createDynamic(
    () => props.as ?? ('div' as T),
    mergeProps(
      omitProps(props, [
        'as',
        'children',
        'value',
        'disabled',
        'ref',
      ]),
      TAB_TAG,
      createOwnerAttribute(listContext.getId()),
      {
        role: 'tab',
        ref: createRef(props, (e) => {
          setInternalRef(() => e);
        }),
        get id() {
          return rootContext.getId('tab', props.value);
        },
        get 'aria-controls'() {
          return rootContext.getId('tab-panel', props.value);
        },
        get tabindex() {
          const selected = properties.isSelected(props.value);
          return (state.disabled() || !selected) ? -1 : 0;
        },
        get children() {
          return createComponent(SelectOptionProvider, {
            state,
            get children() {
              return props.children;
            },
          });
        },
      },
      createDisabled(() => state.disabled()),
      createSelected(() => properties.isSelected(props.value)),
      createActive(() => properties.isActive(props.value)),
    ) as DynamicProps<T>,
  );
}
