import {
  createComponent,
  createSignal,
  createUniqueId,
  JSX,
  mergeProps,
} from 'solid-js';
import {
  omitProps,
} from 'solid-use';
import {
  HeadlessDisclosureRoot,
} from '../../headless/disclosure/HeadlessDisclosureRoot';
import {
  HeadlessDisclosureControlledOptions,
} from '../../headless/disclosure/useHeadlessDisclosure';
import {
  HeadlessSelectRoot,
  HeadlessSelectRootProps,
} from '../../headless/select/HeadlessSelectRoot';
import {
  HeadlessSelectSingleControlledOptions,
} from '../../headless/select/useHeadlessSelectSingle';
import createDynamic from '../../utils/create-dynamic';
import {
  DynamicProps,
  HeadlessProps,
  ValidConstructor,
} from '../../utils/dynamic-prop';
import Fragment from '../../utils/Fragment';
import {
  ListboxContext,
} from './ListboxContext';
import {
  ListboxBaseProps,
  ListboxSingleBaseProps,
} from './types';

// SCSCD = Single, Controlled Select, Controlled Disclosure

type ListboxSCSCDBaseProps<V> =
  & ListboxBaseProps
  & ListboxSingleBaseProps<V>
  & Omit<HeadlessSelectSingleControlledOptions<V>, 'onChange'>
  & Omit<HeadlessDisclosureControlledOptions, 'onChange'>
  & { children?: JSX.Element };

export type ListboxSCSCDProps<V, T extends ValidConstructor = typeof Fragment> =
  HeadlessProps<T, ListboxSCSCDBaseProps<V>>;

export function ListboxSCSCD<V, T extends ValidConstructor = typeof Fragment>(
  props: ListboxSCSCDProps<V, T>,
): JSX.Element {
  const [hovering, setHovering] = createSignal(false);
  const ownerID = createUniqueId();
  const labelID = createUniqueId();
  const buttonID = createUniqueId();
  const optionsID = createUniqueId();

  return createComponent(ListboxContext.Provider, {
    value: {
      multiple: false,
      ownerID,
      labelID,
      buttonID,
      optionsID,
      get horizontal() {
        return props.horizontal;
      },
      get hovering() {
        return hovering();
      },
      set hovering(value: boolean) {
        setHovering(value);
      },
    },
    get children() {
      return createDynamic(
        () => props.as ?? (Fragment as T),
        mergeProps(
          omitProps(props, [
            'as',
            'children',
            'disabled',
            'horizontal',
            'isOpen',
            'onDisclosureChange',
            'onSelectChange',
            'toggleable',
            'value',
          ]),
          {
            'aria-labelledby': labelID,
            'data-sh-listbox': ownerID,
            get disabled() {
              return props.disabled;
            },
            get 'aria-disabled'() {
              return props.disabled;
            },
            get 'data-sh-disabled'() {
              return props.disabled;
            },
            get children() {
              return createComponent(HeadlessSelectRoot, {
                onChange: props.onSelectChange,
                get toggleable() {
                  return props.toggleable;
                },
                get value() {
                  return props.value;
                },
                get disabled() {
                  return props.disabled;
                },
                get children() {
                  return createComponent(HeadlessDisclosureRoot, {
                    onChange: props.onDisclosureChange,
                    get isOpen() {
                      return props.isOpen;
                    },
                    get disabled() {
                      return props.disabled;
                    },
                    get children() {
                      return props.children;
                    },
                  });
                },
              } as HeadlessSelectRootProps<V>);
            },
          },
        ) as DynamicProps<T>,
      );
    },
  });
}
