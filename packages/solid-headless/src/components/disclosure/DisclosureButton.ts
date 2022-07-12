import {
  createSignal,
  createEffect,
  onCleanup,
  JSX,
  mergeProps,
} from 'solid-js';
import {
  createComponent,
} from 'solid-js/web';
import {
  omitProps,
} from 'solid-use';
import {
  HeadlessDisclosureChildProps,
  useHeadlessDisclosureProperties,
  createHeadlessDisclosureChildProps,
} from '../../headless/disclosure';
import {
  createRef,
  DynamicNode,
  HeadlessPropsWithRef,
  ValidConstructor,
} from '../../utils/dynamic-prop';
import {
  createDisabled,
  createExpanded,
} from '../../utils/state-props';
import {
  ButtonProps,
  Button,
} from '../button';
import {
  useDisclosureContext,
} from './DisclosureContext';

export type DisclosureButtonProps<T extends ValidConstructor = 'button'> =
  HeadlessPropsWithRef<T, HeadlessDisclosureChildProps & ButtonProps<T>>;

export function DisclosureButton<T extends ValidConstructor = 'button'>(
  props: DisclosureButtonProps<T>,
): JSX.Element {
  const context = useDisclosureContext('DisclosureButton');
  const properties = useHeadlessDisclosureProperties();

  const [internalRef, setInternalRef] = createSignal<DynamicNode<T>>();

  createEffect(() => {
    const ref = internalRef();

    if (ref instanceof HTMLElement) {
      const toggle = () => {
        if (!(properties.disabled() || props.disabled)) {
          properties.setState(!properties.isOpen());
        }
      };

      ref.addEventListener('click', toggle);

      onCleanup(() => {
        ref.removeEventListener('click', toggle);
      });
    }
  });

  return createComponent(Button, mergeProps(
    omitProps(props, [
      'children',
      'ref',
    ]),
    {
      id: context.buttonID,
      'data-sh-disclosure-button': context.ownerID,
      ref: createRef(props, (e) => {
        setInternalRef(() => e);
      }),
      get 'aria-controls'() {
        return properties.isOpen() && context.panelID;
      },
    },
    createDisabled(() => properties.disabled() || props.disabled),
    createExpanded(() => properties.isOpen()),
    createHeadlessDisclosureChildProps(props),
  ) as ButtonProps<T>);
}
